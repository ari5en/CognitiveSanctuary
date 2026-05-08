using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

public class BurnoutService : InterfaceBurnoutService
{
    private readonly BurnoutCalculator _calculator = new();
    private readonly HttpClient _httpClient;

    public BurnoutService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    // ── OOP wrapper methods ──────────────────────────────────────────────────

    /// <summary>
    /// Computes burnout score using the UML-aligned BurnoutCalculator OOP class.
    /// Formula: durationFactor + breakPenalty + moodPenalty (capped at 100).
    /// This is called on the BACKEND — the frontend never sends a pre-computed score.
    /// </summary>
    public double CalculateScore(StudySession session, int mood)
    {
        return _calculator.calculateScore(session, mood);
    }

    public string GetStudyState(double score)
    {
        return _calculator.getStudyState(score);
    }

    public string EvaluateRisk()
    {
        return _calculator.evaluateRisk();
    }

    // ── Persistence ──────────────────────────────────────────────────────────

    public async Task SaveBurnoutRecordAsync(
        int    sessionId,
        double score,
        string burnoutLevel,
        int    mood,
        int    breaksSkipped)
    {
        var payload = new BurnoutRecordInsert
        {
            session_id     = sessionId,
            burnout_score  = score,
            burnout_level  = burnoutLevel,
            mood           = mood,
            breaks_skipped = breaksSkipped,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "burnout_records");
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task<BurnoutRecordData> GetLatestRecordByUserAsync(int userId)
    {
        var url = $"burnout_records?select=*,study_sessions!inner(user_id)"
                + $"&study_sessions.user_id=eq.{userId}&order=record_id.desc&limit=1";

        var response = await _httpClient.GetAsync(url);

        if (response.IsSuccessStatusCode)
        {
            var rows = await response.Content.ReadFromJsonAsync<List<BurnoutRecordRow>>();
            if (rows is { Count: > 0 })
            {
                var row = rows[0];
                return new BurnoutRecordData(row.burnout_score, row.burnout_level, DateTime.Now);
            }
        }

        // Baseline record for new users — keeps frontend data flow consistent
        return new BurnoutRecordData(0, "Stable", DateTime.Now);
    }

    // ── Private row types ────────────────────────────────────────────────────

    private sealed class BurnoutRecordRow
    {
        public int    record_id     { get; set; }
        public int    session_id    { get; set; }
        public double burnout_score { get; set; }
        public string burnout_level { get; set; } = string.Empty;
        public int    mood          { get; set; }
        public int    breaks_skipped { get; set; }
    }

    private sealed class BurnoutRecordInsert
    {
        public int    session_id     { get; set; }
        public double burnout_score  { get; set; }
        public string burnout_level  { get; set; } = string.Empty;
        public int    mood           { get; set; }
        public int    breaks_skipped { get; set; }
    }
}

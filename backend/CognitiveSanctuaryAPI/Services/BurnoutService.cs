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

    public async Task SaveBurnoutRecordAsync(int sessionId, double score, string burnoutLevel)
    {
        var payload = new BurnoutRecordInsert
        {
            session_id = sessionId,
            burnout_score = score,
            burnout_level = burnoutLevel,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "burnout_records");
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task<BurnoutRecordData> GetLatestRecordByUserAsync(int userId)
    {
        var url = $"burnout_records?select=*,study_sessions!inner(user_id)&study_sessions.user_id=eq.{userId}&order=record_id.desc&limit=1";
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

        // 🛡️ UML Alignment: Provide a baseline record if none exists
        return new BurnoutRecordData(0, "Stable", DateTime.Now);
    }

    private sealed class BurnoutRecordRow
    {
        public int record_id { get; set; }
        public int session_id { get; set; }
        public double burnout_score { get; set; }
        public string burnout_level { get; set; } = string.Empty;
    }

    private sealed class BurnoutRecordInsert
    {
        public int session_id { get; set; }
        public double burnout_score { get; set; }
        public string burnout_level { get; set; } = string.Empty;
    }
}

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

    private sealed class BurnoutRecordInsert
    {
        public int session_id { get; set; }
        public double burnout_score { get; set; }
        public string burnout_level { get; set; } = string.Empty;
    }
}

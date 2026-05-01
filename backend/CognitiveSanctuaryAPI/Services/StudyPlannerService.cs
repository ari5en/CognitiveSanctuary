using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

public class StudyPlannerService : InterfaceStudyPlannerService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly HttpClient _httpClient;

    public StudyPlannerService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public StudyPlanner CreatePlanner()
    {
        return new StudyPlanner();
    }

    public void GenerateSchedule(StudyPlanner planner, User user)
    {
        planner.generateSchedule(user);
    }

    public void AdjustSchedule(StudyPlanner planner, double score)
    {
        planner.adjustSchedule(score);
    }

    public void OptimizePlan(StudyPlanner planner)
    {
        planner.optimizePlan();
    }

    public async Task SavePlannerAsync(int userId, double recommendedLoad)
    {
        var payload = new StudyPlannerInsert
        {
            user_id = userId,
            recommended_load = recommendedLoad,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "study_planner");
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task<StudyPlanner?> GetPlannerByUserAsync(int userId)
    {
        var response = await _httpClient.GetAsync($"study_planner?user_id=eq.{userId}&select=*");
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudyPlannerRow>>(JsonOptions) ?? new List<StudyPlannerRow>();
        if (rows.Count == 0)
        {
            return null;
        }

        var planner = new StudyPlanner();
        planner.adjustSchedule(rows[0].recommended_load);
        return planner;
    }

    private sealed class StudyPlannerInsert
    {
        public int user_id { get; set; }
        public double recommended_load { get; set; }
    }

    private sealed class StudyPlannerRow
    {
        [JsonPropertyName("planner_id")]
        public int planner_id { get; set; }

        [JsonPropertyName("user_id")]
        public int user_id { get; set; }

        [JsonPropertyName("recommended_load")]
        public double recommended_load { get; set; }
    }
}

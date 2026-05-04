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
    private readonly InterfaceBurnoutService _burnoutService;

    public StudyPlannerService(HttpClient httpClient, InterfaceBurnoutService burnoutService)
    {
        _httpClient = httpClient;
        _burnoutService = burnoutService;
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
        // 1. Fetch the latest burnout record to determine current load capacity
        var burnoutData = await _burnoutService.GetLatestRecordByUserAsync(userId);
        
        // 2. Fetch the existing planner record
        var response = await _httpClient.GetAsync($"study_planner?user_id=eq.{userId}&select=*");
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudyPlannerRow>>(JsonOptions) ?? new List<StudyPlannerRow>();
        
        var planner = new StudyPlanner();
        
        // 3. Adjust the planner based on the latest burnout score
        planner.adjustSchedule(burnoutData.Score);
        
        // 4. If the planner exists and the load has changed significantly, we could sync it back.
        // For now, we return the adjusted planner object.
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

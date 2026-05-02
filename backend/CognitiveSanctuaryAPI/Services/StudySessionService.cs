using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

public class StudySessionService : InterfaceStudySessionService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly HttpClient _httpClient;

    public StudySessionService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<StudySession> CreateSessionAsync(int userId, int breakCount)
    {
        var payload = new StudySessionInsert
        {
            user_id = userId,
            study_duration = 0,
            break_count = breakCount,
            start_time = null,
            end_time = null,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "study_sessions");
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudySessionRow>>(JsonOptions);
        var row = rows is { Count: > 0 } ? rows[0] : null;

        return row is null
            ? new StudySession(0, breakCount)
            : MapSession(row);
    }

    public async Task UpdateSessionTimesAsync(int sessionId, DateTime startTime, DateTime endTime, double studyDuration)
    {
        var payload = new StudySessionUpdate
        {
            start_time = startTime,
            end_time = endTime,
            study_duration = studyDuration,
        };

        using var request = new HttpRequestMessage(new HttpMethod("PATCH"), $"study_sessions?session_id=eq.{sessionId}");
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task AddTaskAsync(int sessionId, StudyTask task)
    {
        var payload = new StudyTaskInsert
        {
            session_id = sessionId,
            title = task.title,
            estimated_time = task.estimatedTime,
            status = task.status,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "study_tasks");
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task<IReadOnlyList<StudySession>> GetSessionsByUserAsync(int userId)
    {
        var response = await _httpClient.GetAsync($"study_sessions?user_id=eq.{userId}&select=*");
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudySessionRow>>(JsonOptions) ?? new List<StudySessionRow>();
        var result = new List<StudySession>(rows.Count);

        foreach (var row in rows)
        {
            result.Add(MapSession(row));
        }

        return result;
    }

    public async Task<IReadOnlyList<StudyTask>> GetTasksByUserAsync(int userId)
    {
        // Using Supabase join to filter tasks by user_id in study_sessions
        var url = $"study_tasks?select=*,study_sessions!inner(user_id)&study_sessions.user_id=eq.{userId}";
        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudyTaskRow>>(JsonOptions) ?? new List<StudyTaskRow>();
        var result = new List<StudyTask>(rows.Count);

        foreach (var row in rows)
        {
            result.Add(new StudyTask(row.task_id, row.title, row.estimated_time, row.status));
        }

        return result;
    }
    private sealed class StudyTaskRow
    {
        public int task_id { get; set; }
        public int session_id { get; set; }
        public string title { get; set; } = string.Empty;
        public double estimated_time { get; set; }
        public string status { get; set; } = string.Empty;
    }

    private static StudySession MapSession(StudySessionRow row)
    {
        var session = new StudySession(row.session_id, row.break_count);
        return session;
    }

    private sealed class StudySessionRow
    {
        [JsonPropertyName("session_id")]
        public int session_id { get; set; }

        [JsonPropertyName("study_duration")]
        public double? study_duration { get; set; }

        [JsonPropertyName("break_count")]
        public int break_count { get; set; }

        [JsonPropertyName("start_time")]
        public DateTime? start_time { get; set; }

        [JsonPropertyName("end_time")]
        public DateTime? end_time { get; set; }
    }

    private sealed class StudySessionInsert
    {
        public int user_id { get; set; }
        public double study_duration { get; set; }
        public int break_count { get; set; }
        public DateTime? start_time { get; set; }
        public DateTime? end_time { get; set; }
    }

    private sealed class StudySessionUpdate
    {
        public double study_duration { get; set; }
        public DateTime start_time { get; set; }
        public DateTime end_time { get; set; }
    }

    private sealed class StudyTaskInsert
    {
        public int session_id { get; set; }
        public string title { get; set; } = string.Empty;
        public double estimated_time { get; set; }
        public string status { get; set; } = string.Empty;
    }
}

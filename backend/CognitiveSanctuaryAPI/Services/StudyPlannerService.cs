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
    // Note: StudySessionService is NOT injected here to avoid circular dependencies.
    // GenerateSessionAsync calls the Supabase REST API directly via HttpClient.

    public StudyPlannerService(
        HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    // ── OOP wrapper methods ──────────────────────────────────────────────────

    public StudyPlanner CreatePlanner() => new StudyPlanner();

    public void GenerateSchedule(StudyPlanner planner, User user)
    {
        planner.generateSchedule(user);
    }

    /// <summary>
    /// Wraps StudyPlanner.adjustSchedule() — returns the concrete focus/break config
    /// for the next session. This is what drives adaptive scheduling.
    /// </summary>
    public AdaptiveSessionConfig AdjustSchedule(StudyPlanner planner, double score)
    {
        return planner.adjustSchedule(score);
    }

    public void OptimizePlan(StudyPlanner planner)
    {
        planner.optimizePlan();
    }

    // ── Persistence ──────────────────────────────────────────────────────────

    public async Task SavePlannerAsync(
        int userId,
        double recommendedLoad,
        string burnoutMode,
        double plannedFocusDuration,
        int breakIntervalMinutes,
        double plannedBreakDuration)
    {
        // Ensure the user row exists first (best-effort, ignores RLS failures)
        await EnsureUserExistsAsync(userId);

        // ── PATCH-first upsert ─────────────────────────────────────────────────
        // 1. Try PATCH on existing row. Supabase PATCH with a filter returns the
        //    updated rows when "return=representation" is used, or an empty array
        //    if no rows matched the filter. We use this to detect missing rows.
        var updatePayload = new
        {
            recommended_load       = recommendedLoad,
            burnout_mode           = burnoutMode,
            planned_focus_duration = plannedFocusDuration,
            break_interval_minutes = breakIntervalMinutes,
            planned_break_duration = plannedBreakDuration,
            last_updated           = DateTime.UtcNow,
        };

        using var patchReq = new HttpRequestMessage(
            new HttpMethod("PATCH"),
            $"study_planner?user_id=eq.{userId}");
        patchReq.Headers.Add("Prefer", "return=representation");
        patchReq.Content = JsonContent.Create(updatePayload);
        using var patchRes = await _httpClient.SendAsync(patchReq);
        patchRes.EnsureSuccessStatusCode();

        var patchBody = await patchRes.Content.ReadAsStringAsync();

        // 2. If PATCH returned an empty array ([]), no row existed — INSERT instead.
        if (patchBody.Trim() == "[]")
        {
            var insertPayload = new StudyPlannerInsert
            {
                user_id                = userId,
                recommended_load       = recommendedLoad,
                burnout_mode           = burnoutMode,
                planned_focus_duration = plannedFocusDuration,
                break_interval_minutes = breakIntervalMinutes,
                planned_break_duration = plannedBreakDuration,
            };
            using var insertReq = new HttpRequestMessage(HttpMethod.Post, "study_planner");
            insertReq.Headers.Add("Prefer", "return=minimal");
            insertReq.Content = JsonContent.Create(insertPayload);
            using var insertRes = await _httpClient.SendAsync(insertReq);

            // 409 = row already exists (race condition or PATCH filter missed it)
            // In either case, the row is present — so we do a final PATCH to update values.
            if (insertRes.StatusCode == System.Net.HttpStatusCode.Conflict ||
                insertRes.StatusCode == (System.Net.HttpStatusCode)409)
            {
                Console.WriteLine($"[SavePlannerAsync] INSERT got 409 for user {userId} — falling back to global PATCH.");
                using var fallbackReq = new HttpRequestMessage(
                    new HttpMethod("PATCH"),
                    $"study_planner?user_id=eq.{userId}");
                fallbackReq.Headers.Add("Prefer", "return=minimal");
                fallbackReq.Content = JsonContent.Create(updatePayload);
                using var fallbackRes = await _httpClient.SendAsync(fallbackReq);
                // Ignore result — best-effort
            }
            else
            {
                insertRes.EnsureSuccessStatusCode();
            }
        }
    }

    /// <summary>
    /// Ensures a row exists in the `users` table for the given hashed userId.
    /// Uses Supabase upsert (POST with Prefer: resolution=ignore-duplicates)
    /// so it's a no-op if the user already exists.
    /// This prevents FK violations (409 Conflict) when inserting into study_planner or study_sessions.
    /// </summary>
    private async Task EnsureUserExistsAsync(int userId)
    {
        try
        {
            var payload = new UserInsert
            {
                user_id = userId,
                name = $"User {userId}",
                email = $"{userId}@local.invalid",
                password = userId.ToString(),
                mood_level = 5,
            };
            using var req = new HttpRequestMessage(HttpMethod.Post, "users");
            req.Headers.Add("Prefer", "resolution=ignore-duplicates,return=minimal");
            req.Content = JsonContent.Create(payload);
            using var res = await _httpClient.SendAsync(req);
            
            if (!res.IsSuccessStatusCode)
            {
                var body = await res.Content.ReadAsStringAsync();
                if (!body.Contains("duplicate") && !body.Contains("unique"))
                {
                    // Ignore RLS 401/403 or other errors gracefully
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EnsureUserExistsAsync] Ignored error: {ex.Message}");
        }
    }

    public async Task<PlannerSnapshot?> GetPlannerByUserAsync(int userId)
    {
        var response = await _httpClient.GetAsync(
            $"study_planner?user_id=eq.{userId}&select=*");
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudyPlannerRow>>(JsonOptions)
                   ?? new List<StudyPlannerRow>();

        if (rows.Count == 0)
        {
            var defaultPlanner = CreatePlanner();
            var defaultConfig = new AdaptiveSessionConfig(
                defaultPlanner.plannedFocusDuration,
                defaultPlanner.breakIntervalMinutes,
                defaultPlanner.plannedBreakDuration,
                defaultPlanner.burnoutMode);

            return new PlannerSnapshot(
                defaultPlanner.recommendedLoad,
                defaultPlanner.burnoutMode,
                defaultConfig);
        }

        var row = rows[0];
        var adaptiveConfig = new AdaptiveSessionConfig(
            row.planned_focus_duration,
            row.break_interval_minutes,
            row.planned_break_duration,
            row.burnout_mode);

        return new PlannerSnapshot(row.recommended_load, row.burnout_mode, adaptiveConfig);
    }

    /// <summary>
    /// Generates a new StudySession based on the current adaptive config from the planner.
    /// The session's focus/break structure is pre-computed — the user does not set it.
    /// This implements the correct StudyPlanner → StudySession ownership flow.
    /// Calls Supabase REST API directly to avoid circular service dependencies.
    /// </summary>
    public async Task<StudySession> GenerateSessionAsync(int userId)
    {
        var plannerSnapshot = await GetPlannerByUserAsync(userId);
        if (plannerSnapshot is null)
            throw new Exception("Planner not found.");

        var adaptiveConfig = plannerSnapshot.AdaptiveConfig;

        // 2. POST directly to Supabase to create the session
        var payload = new
        {
            user_id                = userId,
            study_duration         = 0,
            break_count            = 0,
            start_time             = (DateTime?)null,
            end_time               = (DateTime?)null,
            planned_focus_duration = adaptiveConfig.FocusDuration,
            break_interval_minutes = adaptiveConfig.BreakInterval,
            planned_break_duration = adaptiveConfig.BreakDuration,
            mood                   = 2,
            breaks_skipped         = 0,
            status                 = "Planned",
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "study_sessions");
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudyPlannerSessionRow>>(JsonOptions)
                   ?? new List<StudyPlannerSessionRow>();

        if (rows.Count == 0)
            throw new Exception("Failed to generate study session.");

        var row     = rows[0];
        var session = new StudySession(row.session_id, 0)
        {
            plannedFocusDuration = adaptiveConfig.FocusDuration,
            breakIntervalMinutes = adaptiveConfig.BreakInterval,
            plannedBreakDuration = adaptiveConfig.BreakDuration,
            status               = "Planned",
        };

        return session;
    }

    // ── Private row types ────────────────────────────────────────────────────

    private sealed class PlannerIdRow
    {
        public int planner_id { get; set; }
    }

    private sealed class StudyPlannerInsert
    {
        public int    user_id          { get; set; }
        public double recommended_load { get; set; }
        public string burnout_mode     { get; set; } = "Normal";
        public double planned_focus_duration { get; set; }
        public int    break_interval_minutes { get; set; }
        public double planned_break_duration { get; set; }
    }

    private sealed class StudyPlannerUpdate
    {
        public double   recommended_load { get; set; }
        public string   burnout_mode     { get; set; } = "Normal";
        public double   planned_focus_duration { get; set; }
        public int      break_interval_minutes { get; set; }
        public double   planned_break_duration { get; set; }
        public DateTime last_updated     { get; set; }
    }

    private sealed class StudyPlannerRow
    {
        [JsonPropertyName("planner_id")]      public int    planner_id      { get; set; }
        [JsonPropertyName("user_id")]         public int    user_id         { get; set; }
        [JsonPropertyName("recommended_load")] public double recommended_load { get; set; }
        [JsonPropertyName("burnout_mode")]    public string burnout_mode    { get; set; } = "Normal";
        [JsonPropertyName("planned_focus_duration")] public double planned_focus_duration { get; set; }
        [JsonPropertyName("break_interval_minutes")] public int    break_interval_minutes { get; set; }
        [JsonPropertyName("planned_break_duration")] public double planned_break_duration { get; set; }
    }

    private sealed class StudyPlannerSessionRow
    {
        [JsonPropertyName("session_id")] public int session_id { get; set; }
    }

    private sealed class UserInsert
    {
        public int user_id { get; set; }
        public string name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string password { get; set; } = string.Empty;
        public int mood_level { get; set; } = 5;
    }
}


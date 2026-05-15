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
    private readonly InterfaceBurnoutService _burnoutService;
    // Note: StudyPlannerService is NOT injected here to avoid circular dependencies.
    // The controller (SessionsController) is responsible for calling the planner
    // after CompleteSessionAsync returns.

    public StudySessionService(
        HttpClient httpClient,
        InterfaceBurnoutService burnoutService)
    {
        _httpClient     = httpClient;
        _burnoutService = burnoutService;
    }

    // ═══════════════════════════════════════════════════════════════
    // CREATE
    // ═══════════════════════════════════════════════════════════════

    public async Task<StudySession> CreateSessionAsync(
        int userId,
        int    breakCount,
        double plannedFocusDuration = 45,
        int    breakIntervalMinutes = 45,
        double plannedBreakDuration = 10)
    {
        var payload = new StudySessionInsert
        {
            user_id                = userId,
            study_duration         = 0,
            break_count            = breakCount,
            start_time             = null,
            end_time               = null,
            planned_focus_duration = plannedFocusDuration,
            break_interval_minutes = breakIntervalMinutes,
            planned_break_duration = plannedBreakDuration,
            mood                   = 2,
            breaks_skipped         = 0,
            status                 = "Planned",
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "study_sessions");
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudySessionRow>>(JsonOptions)
                   ?? new List<StudySessionRow>();

        if (rows.Count == 0)
            throw new Exception("Failed to create study session.");

        return MapSession(rows[0]);
    }

    // ═══════════════════════════════════════════════════════════════
    // READ
    // ═══════════════════════════════════════════════════════════════

    public async Task<IReadOnlyList<StudySession>> GetSessionsByUserAsync(int userId)
    {
        var response = await _httpClient.GetAsync(
            $"study_sessions?user_id=eq.{userId}&select=*&order=session_id.desc");
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudySessionRow>>(JsonOptions)
                   ?? new List<StudySessionRow>();

        var result = new List<StudySession>(rows.Count);
        foreach (var row in rows)
            result.Add(MapSession(row));

        return result;
    }

    public async Task<SessionWithUserId?> GetSessionWithUserIdAsync(int sessionId)
    {
        var response = await _httpClient.GetAsync(
            $"study_sessions?session_id=eq.{sessionId}&select=*,user_id");
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudySessionRow>>(JsonOptions)
                   ?? new List<StudySessionRow>();

        if (rows.Count == 0)
            return null;

        var row = rows[0];
        var session = MapSession(row);
        return new SessionWithUserId(session, row.user_id);
    }

    public async Task<IReadOnlyList<StudyTask>> GetTasksByUserAsync(int userId)
    {
        var url = $"study_tasks?select=*,study_sessions!inner(user_id)&study_sessions.user_id=eq.{userId}";
        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudyTaskRow>>(JsonOptions)
                   ?? new List<StudyTaskRow>();

        var result = new List<StudyTask>(rows.Count);
        foreach (var row in rows)
            result.Add(new StudyTask(row.task_id, row.title, row.estimated_time, row.status));

        return result;
    }

    public async Task<IReadOnlyList<StudyTask>> GetTasksBySessionAsync(int sessionId)
    {
        var response = await _httpClient.GetAsync(
            $"study_tasks?session_id=eq.{sessionId}&select=*");
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<StudyTaskRow>>(JsonOptions)
                   ?? new List<StudyTaskRow>();

        var result = new List<StudyTask>(rows.Count);
        foreach (var row in rows)
            result.Add(new StudyTask(row.task_id, row.title, row.estimated_time, row.status));

        return result;
    }

    // ═══════════════════════════════════════════════════════════════
    // ANALYTICS AGGREGATION (server-side — replaces frontend crunching)
    // ═══════════════════════════════════════════════════════════════

    /// <summary>
    /// Pre-aggregates all dashboard metrics server-side.
    /// Fetches sessions, burnout records, and tasks from Supabase in parallel,
    /// then computes totals, averages, weekly buckets, and streak — returning a
    /// single AnalyticsSummary so the frontend has nothing to calculate.
    /// </summary>
    public async Task<AnalyticsSummary> GetAnalyticsAsync(int userId)
    {
        // ── Fetch all data in parallel ──────────────────────────────────────
        var sessionsTask = _httpClient.GetAsync(
            $"study_sessions?user_id=eq.{userId}&select=*&order=session_id.asc");

        var burnoutTask = _httpClient.GetAsync(
            $"burnout_records?select=*,study_sessions!inner(user_id)" +
            $"&study_sessions.user_id=eq.{userId}&order=record_id.asc");

        var tasksTask = _httpClient.GetAsync(
            $"study_tasks?select=*,study_sessions!inner(user_id)" +
            $"&study_sessions.user_id=eq.{userId}");

        await Task.WhenAll(sessionsTask, burnoutTask, tasksTask);

        // ── Parse responses ─────────────────────────────────────────────────
        var sessionRows = new List<StudySessionRow>();
        if ((await sessionsTask).IsSuccessStatusCode)
        {
            sessionRows = await (await sessionsTask)
                .Content.ReadFromJsonAsync<List<StudySessionRow>>(JsonOptions)
                ?? new List<StudySessionRow>();
        }

        var burnoutRows = new List<BurnoutAnalyticsRow>();
        if ((await burnoutTask).IsSuccessStatusCode)
        {
            burnoutRows = await (await burnoutTask)
                .Content.ReadFromJsonAsync<List<BurnoutAnalyticsRow>>(JsonOptions)
                ?? new List<BurnoutAnalyticsRow>();
        }

        var taskRows = new List<StudyTaskRow>();
        if ((await tasksTask).IsSuccessStatusCode)
        {
            taskRows = await (await tasksTask)
                .Content.ReadFromJsonAsync<List<StudyTaskRow>>(JsonOptions)
                ?? new List<StudyTaskRow>();
        }

        // ── Aggregate: sessions ─────────────────────────────────────────────
        var completed = sessionRows.Where(s =>
            string.Equals(s.status, "Completed", StringComparison.OrdinalIgnoreCase)).ToList();

        double totalMinutes = completed.Sum(s => s.study_duration ?? 0);
        double totalStudyHours = Math.Round(totalMinutes / 60.0, 1);

        // ── Aggregate: burnout (Current Burnout Level) ──────────────────────
        double avgBurnout = burnoutRows.Count > 0
            ? Math.Round(burnoutRows.Last().burnout_score, 1)
            : 0;

        double avgMood = burnoutRows.Count > 0
            ? Math.Round(burnoutRows.Average(r => r.mood), 2)
            : 2;

        // ── Aggregate: tasks ─────────────────────────────────────────────────
        int tasksCompleted = taskRows.Count(t =>
            string.Equals(t.status, "Completed", StringComparison.OrdinalIgnoreCase));
        int tasksPending = taskRows.Count(t =>
            !string.Equals(t.status, "Completed", StringComparison.OrdinalIgnoreCase));

        // ── Weekly hours (Mon–Sun of the current week) ────────────────────────
        var today      = DateTime.UtcNow.Date;
        int dow        = (int)today.DayOfWeek;           // 0 = Sun
        var monday     = today.AddDays(-((dow + 6) % 7));

        string[] dayNames = { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
        var weeklyHours = dayNames.Select((name, i) =>
        {
            var dayStart = monday.AddDays(i);
            var dayEnd   = dayStart.AddDays(1);
            double hrs = completed
                .Where(s => s.start_time.HasValue
                    && s.start_time.Value.Date >= dayStart
                    && s.start_time.Value.Date < dayEnd)
                .Sum(s => (s.study_duration ?? 0) / 60.0);
            return new DailyHours(name, Math.Round(hrs, 1));
        }).ToList();

        // ── Streak: consecutive days with ≥1 completed session (ending today) ──
        var completedDates = completed
            .Where(s => s.start_time.HasValue)
            .Select(s => s.start_time!.Value.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToList();

        int streak = 0;
        var cursor = today;
        foreach (var date in completedDates)
        {
            if (date == cursor || date == cursor.AddDays(-1))
            {
                streak++;
                cursor = date;
            }
            else break;
        }

        return new AnalyticsSummary(
            TotalStudyHours:       totalStudyHours,
            TotalSessionsCompleted: completed.Count,
            AverageBurnoutScore:   avgBurnout,
            AverageMood:           avgMood,
            StreakDays:            streak,
            TasksCompleted:        tasksCompleted,
            TasksPending:          tasksPending,
            WeeklyHours:           weeklyHours
        );
    }

    // ── Private row type for burnout analytics ─────────────────────────────────
    private sealed class BurnoutAnalyticsRow
    {
        [JsonPropertyName("record_id")]    public int    record_id    { get; set; }
        [JsonPropertyName("burnout_score")] public double burnout_score { get; set; }
        [JsonPropertyName("burnout_level")] public string burnout_level { get; set; } = string.Empty;
        [JsonPropertyName("mood")]         public int    mood         { get; set; } = 2;
        [JsonPropertyName("breaks_skipped")] public int  breaks_skipped { get; set; }
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPLETE SESSION (atomic pipeline — the core of the realignment)
    // ═══════════════════════════════════════════════════════════════

    /// <summary>
    /// Atomic session-end pipeline:
    ///   1. Persist timing + mood + breaksSkipped → status = Completed
    ///   2. Fetch the updated session from DB
    ///   3. Instantiate StudySession OOP object, run BurnoutCalculator.calculateScore()
    ///   4. Save burnout_record
    ///   5. Run StudyPlanner.adjustSchedule(score) → persist updated planner
    ///   6. Return score + level + next adaptive config
    ///
    /// Score is computed HERE — never sent from the frontend.
    /// </summary>
    public async Task<SessionCompleteResult> CompleteSessionAsync(
        int      sessionId,
        DateTime startTime,
        DateTime endTime,
        double   studyDuration,
        int      mood,
        int      breaksSkipped)
    {
        // ── Step 1: Finalize session data ────────────────────────────────────
        var updatePayload = BuildCompletionPayload(startTime, endTime, studyDuration, mood, breaksSkipped);

        // ── Step 2: Persist session changes ──────────────────────────────────
        await PersistCompletionAsync(sessionId, updatePayload);

        // ── Step 3: Compute burnout (explicit) ───────────────────────────────
        int userId = await GetUserIdForSessionAsync(sessionId);
        var latestRecord = await _burnoutService.GetLatestRecordByUserAsync(userId);
        
        var session = new StudySession(sessionId, 0)
        {
            studyDuration  = studyDuration,
            mood           = mood,
            breaksSkipped  = breaksSkipped,
            status         = StudySession.StatusCompleted,
        };
        var (burnoutScore, burnoutLevel) = EvaluateBurnoutForSession(latestRecord.Score, session, mood, breaksSkipped);

        // ── Step 4: Save burnout record ──────────────────────────────────────
        await _burnoutService.SaveBurnoutRecordAsync(
            sessionId, burnoutScore, burnoutLevel, mood, breaksSkipped);

        // ── Step 5: Return score + level to controller ───────────────────────
        // The controller (SessionsController.CompleteSession) is responsible for
        // calling StudyPlannerService.AdjustSchedule() and SavePlannerAsync()
        // to avoid a circular service dependency.
        // We return a placeholder config here; the real one comes from the controller.
        var placeholderConfig = new AdaptiveSessionConfig(45, 45, 10, "Normal");
        return new SessionCompleteResult(burnoutScore, burnoutLevel, placeholderConfig);
    }

    // ═══════════════════════════════════════════════════════════════
    // LEGACY UPDATE (backward compat — kept for any callers that haven't migrated)
    // ═══════════════════════════════════════════════════════════════

    public async Task UpdateSessionTimesAsync(
        int sessionId, DateTime startTime, DateTime endTime, double studyDuration)
    {
        var payload = new { start_time = startTime, end_time = endTime, study_duration = studyDuration };

        using var request = new HttpRequestMessage(
            new HttpMethod("PATCH"),
            $"study_sessions?session_id=eq.{sessionId}");
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    // ═══════════════════════════════════════════════════════════════
    // TASK MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    public async Task AddTaskAsync(int sessionId, StudyTask task)
    {
        var payload = new StudyTaskInsert
        {
            session_id     = sessionId,
            title          = task.title,
            estimated_time = task.estimatedTime,
            status         = task.status,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "study_tasks");
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task UpdateTaskAsync(int taskId, StudyTask task)
    {
        var payload = new StudyTaskUpdate
        {
            title          = task.title,
            estimated_time = task.estimatedTime,
            status         = task.status,
        };

        using var request = new HttpRequestMessage(
            new HttpMethod("PATCH"),
            $"study_tasks?task_id=eq.{taskId}");
        request.Headers.Add("Prefer", "return=representation");
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task DeleteTaskAsync(int taskId)
    {
        using var response = await _httpClient.DeleteAsync($"study_tasks?task_id=eq.{taskId}");
        response.EnsureSuccessStatusCode();
    }

    // ═══════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════

    /// <summary>
    /// Builds a StudySession OOP object suitable for BurnoutCalculator.
    /// The calculator uses studyDuration + breakCount for its formula.
    /// We pass breaksSkipped as the breakCount because the formula measures
    /// "how many breaks were missed" against an expected number.
    /// </summary>
    private static StudySessionComplete BuildCompletionPayload(
        DateTime startTime,
        DateTime endTime,
        double studyDuration,
        int mood,
        int breaksSkipped)
    {
        return new StudySessionComplete
        {
            start_time     = startTime,
            end_time       = endTime,
            study_duration = studyDuration,
            mood           = mood,
            breaks_skipped = breaksSkipped,
            status         = StudySession.StatusCompleted,
        };
    }

    private async Task PersistCompletionAsync(int sessionId, StudySessionComplete updatePayload)
    {
        using var patchReq = new HttpRequestMessage(
            new HttpMethod("PATCH"),
            $"study_sessions?session_id=eq.{sessionId}");
        patchReq.Headers.Add("Prefer", "return=representation");
        patchReq.Content = JsonContent.Create(updatePayload);

        using var patchRes = await _httpClient.SendAsync(patchReq);
        patchRes.EnsureSuccessStatusCode();
    }

    private (double score, string level) EvaluateBurnoutForSession(
        double previousScore,
        StudySession session,
        int mood,
        int breaksSkipped)
    {
        // Note: breakCount on StudySession tracks actual breaks taken.
        // breaksSkipped is the penalty input to BurnoutCalculator.
        // We wire breaksSkipped into breakCount for the formula since
        // BurnoutCalculator uses session.breakCount as the break metric.
        var sessionForScoring = BuildSessionForScoring(
            session.sessionId,
            session.studyDuration,
            breaksSkipped);

        var score = _burnoutService.CalculateScore(previousScore, sessionForScoring, mood);
        var level = _burnoutService.GetStudyState(score);
        return (score, level);
    }

    private static StudySession BuildSessionForScoring(int sessionId, double studyDuration, int breaksSkipped)
    {
        // BurnoutCalculator: breakPenalty = (expectedBreaks - session.breakCount) * 10
        // To correctly penalise skipped breaks, we set breakCount = 0
        // and let the formula derive expectedBreaks from studyDuration.
        // breaksSkipped is already accounted for via mood in this session.
        // For a more accurate model, breakCount should be (expectedBreaks - breaksSkipped).
        double expectedBreaks = studyDuration / 45.0;
        int    actualBreaks   = (int)Math.Max(0, Math.Round(expectedBreaks) - breaksSkipped);

        var session = new StudySession(sessionId, actualBreaks);
        // Set studyDuration via property
        session.studyDuration = studyDuration;
        return session;
    }

    private async Task<int> GetUserIdForSessionAsync(int sessionId)
    {
        var response = await _httpClient.GetAsync(
            $"study_sessions?session_id=eq.{sessionId}&select=user_id");
        response.EnsureSuccessStatusCode();

        var rows = await response.Content.ReadFromJsonAsync<List<UserIdRow>>(JsonOptions)
                   ?? new List<UserIdRow>();

        return rows.Count > 0 ? rows[0].user_id : 1;
    }

    private static StudySession MapSession(StudySessionRow row)
    {
        var session = new StudySession(row.session_id, row.break_count)
        {
            plannedFocusDuration = row.planned_focus_duration ?? 45,
            breakIntervalMinutes = row.break_interval_minutes ?? 45,
            plannedBreakDuration = row.planned_break_duration ?? 10,
            mood                 = row.mood ?? 2,
            breaksSkipped        = row.breaks_skipped ?? 0,
            status               = row.status ?? "Planned",
        };
        session.studyDuration = row.study_duration ?? 0;
        return session;
    }

    // ═══════════════════════════════════════════════════════════════
    // PRIVATE ROW / INSERT / UPDATE TYPES
    // ═══════════════════════════════════════════════════════════════

    private sealed class StudySessionRow
    {
        [JsonPropertyName("user_id")]                public int      user_id                { get; set; }
        [JsonPropertyName("session_id")]             public int      session_id             { get; set; }
        [JsonPropertyName("study_duration")]          public double?  study_duration          { get; set; }
        [JsonPropertyName("break_count")]             public int      break_count             { get; set; }
        [JsonPropertyName("start_time")]              public DateTime? start_time             { get; set; }
        [JsonPropertyName("end_time")]                public DateTime? end_time               { get; set; }
        [JsonPropertyName("planned_focus_duration")] public double?  planned_focus_duration  { get; set; }
        [JsonPropertyName("break_interval_minutes")] public int?     break_interval_minutes  { get; set; }
        [JsonPropertyName("planned_break_duration")] public double?  planned_break_duration  { get; set; }
        [JsonPropertyName("mood")]                   public int?     mood                    { get; set; }
        [JsonPropertyName("breaks_skipped")]          public int?     breaks_skipped          { get; set; }
        [JsonPropertyName("status")]                  public string?  status                  { get; set; }
    }

    private sealed class StudySessionInsert
    {
        public int      user_id                { get; set; }
        public double   study_duration         { get; set; }
        public int      break_count            { get; set; }
        public DateTime? start_time            { get; set; }
        public DateTime? end_time              { get; set; }
        public double   planned_focus_duration { get; set; }
        public int      break_interval_minutes { get; set; }
        public double   planned_break_duration { get; set; }
        public int      mood                   { get; set; }
        public int      breaks_skipped         { get; set; }
        public string   status                 { get; set; } = "Planned";
    }

    private sealed class StudySessionComplete
    {
        public DateTime start_time     { get; set; }
        public DateTime end_time       { get; set; }
        public double   study_duration { get; set; }
        public int      mood           { get; set; }
        public int      breaks_skipped { get; set; }
        public string   status         { get; set; } = "Completed";
    }

    private sealed class StudyTaskRow
    {
        public int    task_id        { get; set; }
        public int    session_id     { get; set; }
        public string title          { get; set; } = string.Empty;
        public double estimated_time { get; set; }
        public string status         { get; set; } = string.Empty;
    }

    private sealed class StudyTaskInsert
    {
        public int    session_id     { get; set; }
        public string title          { get; set; } = string.Empty;
        public double estimated_time { get; set; }
        public string status         { get; set; } = string.Empty;
    }

    private sealed class StudyTaskUpdate
    {
        public string title          { get; set; } = string.Empty;
        public double estimated_time { get; set; }
        public string status         { get; set; } = string.Empty;
    }

    private sealed class UserIdRow
    {
        public int user_id { get; set; }
    }

    private sealed class UserInsert
    {
        public int user_id { get; set; }
        public string name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string password { get; set; } = string.Empty;
        public int mood_level { get; set; } = 5;
    }

    /// <summary>
    /// Upserts a minimal user row so FK constraints don't block inserts for new hashed IDs.
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
}

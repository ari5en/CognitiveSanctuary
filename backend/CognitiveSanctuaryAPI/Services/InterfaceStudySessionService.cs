using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

// Flow:
// Client (Frontend / Postman)
//     ↓  HTTP Request
// Controller  (validates request)
//     ↓
// DTO  (transfers data)
//     ↓
// Service Layer  (business logic)
//     ↓
// HttpClient → Supabase REST API → Database
//     ↓
// Response returned to client

public interface InterfaceStudySessionService
{
    // ── Create ──────────────────────────────────────────────────────────────
    Task<StudySession> CreateSessionAsync(int userId, int breakCount,
        double plannedFocusDuration = 45,
        int    breakIntervalMinutes = 45,
        double plannedBreakDuration = 10);

    // ── Read ─────────────────────────────────────────────────────────────────
    Task<IReadOnlyList<StudySession>> GetSessionsByUserAsync(int userId);
    Task<SessionWithUserId?> GetSessionWithUserIdAsync(int sessionId);
    Task<IReadOnlyList<StudyTask>>   GetTasksByUserAsync(int userId);
    Task<IReadOnlyList<StudyTask>>   GetTasksBySessionAsync(int sessionId);

    /// <summary>
    /// Returns a fully pre-aggregated analytics snapshot for the dashboard.
    /// All computation (weekly bucketing, averages, streak) is done server-side.
    /// </summary>
    Task<AnalyticsSummary> GetAnalyticsAsync(int userId);

    // ── Update ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Atomic session completion:
    ///   1. Persists timing + mood + breaksSkipped
    ///   2. Runs BurnoutCalculator on the backend (score is NOT sent from frontend)
    ///   3. Saves BurnoutRecord
    ///   4. Runs StudyPlanner.adjustSchedule() and updates the planner row
    /// Returns the burnout level and adaptive config for the next session.
    /// </summary>
    Task<SessionCompleteResult> CompleteSessionAsync(
        int      sessionId,
        DateTime startTime,
        DateTime endTime,
        double   studyDuration,
        int      mood,
        int      breaksSkipped);

    // ── Legacy update (kept for backward compat) ─────────────────────────────
    Task UpdateSessionTimesAsync(int sessionId, DateTime startTime, DateTime endTime, double studyDuration);

    // ── Task management ──────────────────────────────────────────────────────
    Task AddTaskAsync(int sessionId, StudyTask task);
    Task UpdateTaskAsync(int taskId, StudyTask task);
    Task DeleteTaskAsync(int taskId);
}

/// <summary>
/// Returned by CompleteSessionAsync — gives the frontend everything it needs
/// to show the post-session screen and decide on navigation.
/// </summary>
public record SessionCompleteResult(
    double               BurnoutScore,
    string               BurnoutLevel,      // Stable | Warning | Critical
    AdaptiveSessionConfig AdaptiveConfig    // structure for the NEXT session
);

/// <summary>
/// Session with its owning user id. Used for planner updates after burnout scoring.
/// </summary>
public record SessionWithUserId(StudySession Session, int userId);

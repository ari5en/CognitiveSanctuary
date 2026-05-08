using System.Threading.Tasks;
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

public interface InterfaceStudyPlannerService
{
    // ── OOP method wrappers ──────────────────────────────────────────────────
    StudyPlanner           CreatePlanner();
    void                   GenerateSchedule(StudyPlanner planner, User user);
    AdaptiveSessionConfig  AdjustSchedule(StudyPlanner planner, double score);
    void                   OptimizePlan(StudyPlanner planner);

    // ── Persistence ──────────────────────────────────────────────────────────
    Task SavePlannerAsync(
        int userId,
        double recommendedLoad,
        string burnoutMode,
        double plannedFocusDuration,
        int breakIntervalMinutes,
        double plannedBreakDuration);
    Task<PlannerSnapshot?> GetPlannerByUserAsync(int userId);

    /// <summary>
    /// Generates a new StudySession using the current adaptive config from the planner.
    /// The session's focus/break structure is pre-computed — user does not set it.
    /// </summary>
    Task<StudySession> GenerateSessionAsync(int userId);
}

/// <summary>
/// Snapshot of planner state plus the next adaptive session config.
/// </summary>
public record PlannerSnapshot(
    double RecommendedLoad,
    string BurnoutMode,
    AdaptiveSessionConfig AdaptiveConfig
);

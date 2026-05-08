namespace CognitiveSanctuaryAPI.Models;

/// <summary>
/// Holds the adaptive structure for the next StudySession,
/// computed by StudyPlanner.adjustSchedule() based on burnout score.
/// </summary>
public record AdaptiveSessionConfig(
    double FocusDuration,    // minutes per focus block
    int    BreakInterval,    // trigger break every N minutes
    double BreakDuration,    // minutes per break
    string Mode              // Normal | Warning | Recovery
);

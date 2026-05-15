namespace CognitiveSanctuaryAPI.DTOs;

/// <summary>
/// Request to create a new StudySession via POST /api/sessions.
/// Includes the adaptive structure pre-computed by StudyPlanner.
/// </summary>
public sealed class SessionCreateRequest
{
    public int userId               { get; set; }
    public int    BreakCount           { get; set; } = 0;
    public double PlannedFocusDuration { get; set; } = 45;  // minutes per focus block
    public int    BreakIntervalMinutes { get; set; } = 45;  // trigger break every N mins
    public double PlannedBreakDuration { get; set; } = 10;  // minutes per break
}

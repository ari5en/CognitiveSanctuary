using System;

namespace CognitiveSanctuaryAPI.DTOs;

/// <summary>
/// Sent by the frontend when a session ends.
/// The backend uses these values — combined with stored session data —
/// to run BurnoutCalculator and update the StudyPlanner.
/// NOTE: 'Score' is intentionally absent; it is computed on the backend.
/// </summary>
public sealed class SessionCompleteRequest
{
    public DateTime StartTime    { get; set; }
    public DateTime EndTime      { get; set; }
    public double   StudyDuration { get; set; }
    public int      Mood         { get; set; }  // 1=Happy 2=Neutral 3=Tired 4=Exhausted
    public int      BreaksSkipped { get; set; }
}

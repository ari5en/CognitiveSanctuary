using System;

namespace CognitiveSanctuaryAPI.DTOs;

public sealed class SessionTimesUpdateRequest
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public double StudyDuration { get; set; }
}

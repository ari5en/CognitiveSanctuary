namespace CognitiveSanctuaryAPI.DTOs;

public sealed class PlannerCreateRequest
{
    public double RecommendedLoad { get; set; }
    public double PlannedFocusDuration { get; set; } = 45;
    public int BreakIntervalMinutes { get; set; } = 45;
    public double PlannedBreakDuration { get; set; } = 10;
}

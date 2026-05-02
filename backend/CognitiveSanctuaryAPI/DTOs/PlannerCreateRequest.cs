namespace CognitiveSanctuaryAPI.DTOs;

public sealed class PlannerCreateRequest
{
    public int UserId { get; set; }
    public double RecommendedLoad { get; set; }
}

namespace CognitiveSanctuaryAPI.DTOs;

public sealed class TaskCreateRequest
{
    public string Title { get; set; } = string.Empty;
    public double EstimatedTime { get; set; }
    public string Status { get; set; } = "Active";
}

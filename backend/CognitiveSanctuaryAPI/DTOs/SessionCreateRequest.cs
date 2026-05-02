namespace CognitiveSanctuaryAPI.DTOs;

public sealed class SessionCreateRequest
{
    public int UserId { get; set; }
    public int BreakCount { get; set; }
}

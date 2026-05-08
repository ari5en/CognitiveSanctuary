namespace CognitiveSanctuaryAPI.DTOs;

/// <summary>
/// Used by POST /api/burnout (direct burnout record creation).
/// Score is computed on the backend — only mood and breaksSkipped are needed.
/// </summary>
public sealed class BurnoutRecordRequest
{
    public int SessionId    { get; set; }
    public int Mood         { get; set; }  // 1=Happy 2=Neutral 3=Tired 4=Exhausted
    public int BreaksSkipped { get; set; }
}

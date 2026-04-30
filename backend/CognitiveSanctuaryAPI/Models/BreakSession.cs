namespace CognitiveSanctuaryAPI.Models;

public class BreakSession : StudyTask
{
    private double _breakDuration;

    public BreakSession(int taskId, string title, double estimatedTime, string status, double breakDuration)
        : base(taskId, title, estimatedTime, status)
    {
        _breakDuration = breakDuration;
    }

    public double breakDuration
    {
        get { return _breakDuration; }
        private set { _breakDuration = value; }
    }

    public void startBreak()
    {
        status = "On Break";
    }

    public void endBreak()
    {
        status = "Active";
    }
}
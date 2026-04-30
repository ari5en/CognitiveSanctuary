namespace CognitiveSanctuaryAPI.Models;

public class FocusSession : StudyTask
{
    private int _focusLevel;

    public FocusSession(int taskId, string title, double estimatedTime, string status, int focusLevel)
        : base(taskId, title, estimatedTime, status)
    {
        _focusLevel = focusLevel;
    }

    public int focusLevel
    {
        get { return _focusLevel; }
        private set { _focusLevel = value; }
    }

    public void extendFocusTime(int minutes)
    {
        if (minutes > 0)
        {
            estimatedTime += minutes;
        }
    }
}
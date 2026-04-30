namespace CognitiveSanctuaryAPI.Models;

public class StudyTask
{
    private int _taskId;
    private string _title;
    private double _estimatedTime;
    private string _status;

    public StudyTask(int taskId, string title, double estimatedTime, string status)
    {
        _taskId = taskId;
        _title = title;
        _estimatedTime = estimatedTime;
        _status = status;
    }

    public int taskId
    {
        get { return _taskId; }
        private set { _taskId = value; }
    }

    public string title
    {
        get { return _title; }
        private set { _title = value; }
    }

    public double estimatedTime
    {
        get { return _estimatedTime; }
        protected set { _estimatedTime = value; }
    }

    public string status
    {
        get { return _status; }
        protected set { _status = value; }
    }

    public void updateTask(string status)
    {
        _status = status;
    }
}
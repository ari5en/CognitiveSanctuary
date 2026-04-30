namespace CognitiveSanctuaryAPI.Models;

public class StudySession
{
    private int _sessionId;
    private double _studyDuration;
    private int _breakCount;
    private DateTime _startTime;
    private DateTime _endTime;

    public StudySession(int sessionId, int breakCount)
    {
        _sessionId = sessionId;
        _breakCount = breakCount;
        _startTime = DateTime.MinValue;
        _endTime = DateTime.MinValue;
        _studyDuration = 0;
    }

    public int sessionId
    {
        get { return _sessionId; }
        private set { _sessionId = value; }
    }

    public double studyDuration
    {
        get { return _studyDuration; }
        private set { _studyDuration = value; }
    }

    public int breakCount
    {
        get { return _breakCount; }
        private set { _breakCount = value; }
    }

    public DateTime startTime
    {
        get { return _startTime; }
        private set { _startTime = value; }
    }

    public DateTime endTime
    {
        get { return _endTime; }
        private set { _endTime = value; }
    }

    public void startSession()
    {
        _startTime = DateTime.Now;
    }

    public void endSession()
    {
        _endTime = DateTime.Now;
        _studyDuration = calculateDuration();
    }

    public double calculateDuration()
    {
        if (_endTime == DateTime.MinValue || _startTime == DateTime.MinValue)
        {
            return 0;
        }

        return (_endTime - _startTime).TotalMinutes;
    }
}
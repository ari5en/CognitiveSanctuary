namespace CognitiveSanctuaryAPI.Models;

public class StudySession
{
    public const string StatusPlanned = "Planned";
    public const string StatusInProgress = "InProgress";
    public const string StatusAwaitingEvaluation = "AwaitingEvaluation";
    public const string StatusCompleted = "Completed";

    private int _sessionId;
    private double _studyDuration;
    private int _breakCount;
    private DateTime _startTime;
    private DateTime _endTime;

    // ── Adaptive session structure (set by StudyPlanner) ──
    private double _plannedFocusDuration;  // minutes per focus block
    private int    _breakIntervalMinutes;  // trigger break every N minutes
    private double _plannedBreakDuration; // minutes per break block

    // ── Session outcome (set when session completes) ──
    private int    _mood;           // 1=Happy 2=Neutral 3=Tired 4=Exhausted
    private int    _breaksSkipped;  // tracked automatically during execution
    private string _status;         // Planned | InProgress | AwaitingEvaluation | Completed | Cancelled

    public StudySession(int sessionId, int breakCount)
    {
        _sessionId            = sessionId;
        _breakCount           = breakCount;
        _startTime            = DateTime.MinValue;
        _endTime              = DateTime.MinValue;
        _studyDuration        = 0;
        _plannedFocusDuration = 45;
        _breakIntervalMinutes = 45;
        _plannedBreakDuration = 10;
        _mood                 = 2;
        _breaksSkipped        = 0;
        _status               = StatusPlanned;
    }

    // ── Core identity ──
    public int sessionId
    {
        get { return _sessionId; }
        private set { _sessionId = value; }
    }

    public double studyDuration
    {
        get { return _studyDuration; }
        set  { _studyDuration = value; }   // public set — assigned by service MapSession
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

    // ── Adaptive structure ──
    public double plannedFocusDuration
    {
        get { return _plannedFocusDuration; }
        set  { _plannedFocusDuration = value; }
    }

    public int breakIntervalMinutes
    {
        get { return _breakIntervalMinutes; }
        set  { _breakIntervalMinutes = value; }
    }

    public double plannedBreakDuration
    {
        get { return _plannedBreakDuration; }
        set  { _plannedBreakDuration = value; }
    }

    // ── Outcome fields ──
    public int mood
    {
        get { return _mood; }
        set  { _mood = value; }
    }

    public int breaksSkipped
    {
        get { return _breaksSkipped; }
        set  { _breaksSkipped = value; }
    }

    public string status
    {
        get { return _status; }
        set  { _status = value; }
    }

    // ── Lifecycle methods ──
    public void startSession()
    {
        _startTime = DateTime.Now;
        _status    = StatusInProgress;
    }

    public void endSession()
    {
        _endTime       = DateTime.Now;
        _studyDuration = calculateDuration();
        _status        = StatusCompleted;
    }

    public double calculateDuration()
    {
        if (_endTime == DateTime.MinValue || _startTime == DateTime.MinValue)
            return 0;

        return (_endTime - _startTime).TotalMinutes;
    }
}

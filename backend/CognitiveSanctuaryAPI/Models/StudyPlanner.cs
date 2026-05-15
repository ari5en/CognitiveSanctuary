using System.Collections.Generic;

namespace CognitiveSanctuaryAPI.Models;

public class StudyPlanner
{
    private List<StudySession> _dailySchedule;
    private double _recommendedLoad;
    private string _burnoutMode;
    private double _plannedFocusDuration;
    private int    _breakIntervalMinutes;
    private double _plannedBreakDuration;

    public StudyPlanner()
    {
        _dailySchedule   = new List<StudySession>();
        _recommendedLoad = 100;
        _burnoutMode     = "Normal";
        _plannedFocusDuration = 45;
        _breakIntervalMinutes = 45;
        _plannedBreakDuration = 10;
    }

    public List<StudySession> dailySchedule
    {
        get { return _dailySchedule; }
        private set { _dailySchedule = value; }
    }

    public double recommendedLoad
    {
        get { return _recommendedLoad; }
        private set { _recommendedLoad = value; }
    }

    public string burnoutMode
    {
        get { return _burnoutMode; }
        private set { _burnoutMode = value; }
    }

    public double plannedFocusDuration
    {
        get { return _plannedFocusDuration; }
        private set { _plannedFocusDuration = value; }
    }

    public int breakIntervalMinutes
    {
        get { return _breakIntervalMinutes; }
        private set { _breakIntervalMinutes = value; }
    }

    public double plannedBreakDuration
    {
        get { return _plannedBreakDuration; }
        private set { _plannedBreakDuration = value; }
    }

    public void generateSchedule(User user)
    {
        _dailySchedule.Clear();
    }

    /// <summary>
    /// Core adaptive scheduling method.
    /// Computes focus/break structure for the NEXT session based on burnout score.
    /// Also updates internal state (recommendedLoad, burnoutMode).
    /// </summary>
    /// <param name="score">Burnout score from BurnoutCalculator (0–100)</param>
    /// <returns>AdaptiveSessionConfig: concrete focus/break structure for the next session</returns>
    public AdaptiveSessionConfig adjustSchedule(double score)
    {
        if (score <= 25)
        {
            _recommendedLoad = 100;
            _burnoutMode     = "Optimal";
            _plannedFocusDuration = 45;
            _breakIntervalMinutes = 45;
            _plannedBreakDuration = 10;
            return new AdaptiveSessionConfig(45, 45, 10, "Optimal");
        }
        else if (score <= 50)
        {
            _recommendedLoad = 80;
            _burnoutMode     = "Balanced";
            _plannedFocusDuration = 40;
            _breakIntervalMinutes = 40;
            _plannedBreakDuration = 15;
            return new AdaptiveSessionConfig(40, 40, 15, "Balanced");
        }
        else if (score <= 75)
        {
            _recommendedLoad = 60;
            _burnoutMode     = "Paced";
            _plannedFocusDuration = 35;
            _breakIntervalMinutes = 35;
            _plannedBreakDuration = 20;
            return new AdaptiveSessionConfig(35, 35, 20, "Paced");
        }
        else
        {
            _recommendedLoad = 30;
            _burnoutMode     = "Recovery";
            _plannedFocusDuration = 25;
            _breakIntervalMinutes = 25;
            _plannedBreakDuration = 20;
            return new AdaptiveSessionConfig(25, 25, 20, "Recovery");
        }
    }

    public void optimizePlan()
    {
        // Placeholder for future optimization steps
    }
}
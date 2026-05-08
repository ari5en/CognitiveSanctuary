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
        if (score < 40)
        {
            // LOW burnout — Normal mode: full focus blocks, standard breaks
            _recommendedLoad = 100;
            _burnoutMode     = "Normal";
            _plannedFocusDuration = 45;
            _breakIntervalMinutes = 45;
            _plannedBreakDuration = 10;
            return new AdaptiveSessionConfig(
                FocusDuration: 45,
                BreakInterval: 45,
                BreakDuration: 10,
                Mode:          "Normal"
            );
        }
        else if (score < 75)
        {
            // MODERATE burnout — Warning mode: shorter focus, longer/more frequent breaks
            _recommendedLoad = 60;
            _burnoutMode     = "Warning";
            _plannedFocusDuration = 30;
            _breakIntervalMinutes = 30;
            _plannedBreakDuration = 15;
            return new AdaptiveSessionConfig(
                FocusDuration: 30,
                BreakInterval: 30,
                BreakDuration: 15,
                Mode:          "Warning"
            );
        }
        else
        {
            // HIGH burnout — Recovery mode: short focus blocks, equal break time
            _recommendedLoad = 30;
            _burnoutMode     = "Recovery";
            _plannedFocusDuration = 20;
            _breakIntervalMinutes = 20;
            _plannedBreakDuration = 20;
            return new AdaptiveSessionConfig(
                FocusDuration: 20,
                BreakInterval: 20,
                BreakDuration: 20,
                Mode:          "Recovery"
            );
        }
    }

    public void optimizePlan()
    {
        // Placeholder for future optimization steps
    }
}
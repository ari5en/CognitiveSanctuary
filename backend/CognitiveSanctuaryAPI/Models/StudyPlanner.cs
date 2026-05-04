using System.Collections.Generic;

namespace CognitiveSanctuaryAPI.Models;

public class StudyPlanner
{
    private List<StudySession> _dailySchedule;
    private double _recommendedLoad;

    public StudyPlanner()
    {
        _dailySchedule = new List<StudySession>();
        _recommendedLoad = 0;
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

    public void generateSchedule(User user)
    {
        _dailySchedule.Clear();
    }

    public void adjustSchedule(double score)
    {
        // Deterministic Load Calculation based on Burnout Score
        if (score < 40)
        {
            _recommendedLoad = 100; // Normal load
        }
        else if (score < 75)
        {
            _recommendedLoad = 60;  // Reduced load (Warning)
        }
        else
        {
            _recommendedLoad = 30;  // Minimal load (Critical)
        }
    }

    public void optimizePlan()
    {
        // Placeholder for optimization steps
    }
}
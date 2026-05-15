namespace CognitiveSanctuaryAPI.Models;

public class BurnoutCalculator
{
    private double _score;

    public double score
    {
        get { return _score; }
        private set { _score = value; }
    }

    public double calculateScore(double previousScore, StudySession session, int mood)
    {
        // 1. Mood Delta: Add or subtract from burnout based on feeling
        // Moods: 1: Happy, 2: Neutral, 3: Tired, 4: Exhausted
        double moodDelta = mood switch
        {
            1 => -5,   // Happy
            2 => -3,   // Neutral
            3 => 5,    // Tired
            4 => 10,   // Exhausted
            _ => 0
        };

        // 2. Break Penalty: Add small penalty if breaks were skipped
        double breakPenalty = session.breaksSkipped * 2;

        _score = previousScore + moodDelta + breakPenalty;
        if (_score < 0) _score = 0;
        if (_score > 100) _score = 100;
        
        return _score;
    }

    public string getStudyState(double score)
    {
        if (score <= 25) return "Optimal";
        if (score <= 50) return "Balanced";
        if (score <= 75) return "Paced";
        return "Recovery";
    }

    public string evaluateRisk()
    {
        if (_score <= 50) return "Safe";
        if (_score <= 75) return "Warning";
        return "High Risk";
    }
}
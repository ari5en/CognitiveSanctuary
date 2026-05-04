namespace CognitiveSanctuaryAPI.Models;

public class BurnoutCalculator
{
    private double _score;

    public double score
    {
        get { return _score; }
        private set { _score = value; }
    }

    public double calculateScore(StudySession session, int mood)
    {
        // 1. Duration Factor: 15 points per hour
        double durationFactor = (session.studyDuration / 60.0) * 15;

        // 2. Break Penalty: High penalty if no breaks were taken for long sessions
        // Rule: Expect 1 break per 45 mins of study
        double expectedBreaks = session.studyDuration / 45.0;
        double breakPenalty = 0;
        if (session.breakCount < expectedBreaks)
        {
            breakPenalty = (expectedBreaks - session.breakCount) * 10;
        }

        // 3. Mood Penalty: Weighted based on severity
        // Moods: 1: Happy, 2: Neutral, 3: Tired, 4: Exhausted
        double moodPenalty = mood switch
        {
            1 => 0,   // Happy
            2 => 10,  // Neutral
            3 => 30,  // Tired
            4 => 60,  // Exhausted
            _ => 10
        };

        _score = durationFactor + breakPenalty + moodPenalty;
        if (_score > 100) _score = 100;
        
        return _score;
    }

    public string getStudyState(double score)
    {
        if (score < 40) return "Stable";
        if (score < 75) return "Warning";
        return "Critical";
    }

    public string evaluateRisk()
    {
        if (_score < 40) return "Safe";
        if (_score < 75) return "Warning";
        return "High Risk";
    }
}
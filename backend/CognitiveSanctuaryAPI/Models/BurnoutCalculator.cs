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
        double baseScore = session.studyDuration - (mood * 2);
        _score = baseScore < 0 ? 0 : baseScore;
        return _score;
    }

    public string getStudyState(double score)
    {
        if (score < 30)
        {
            return "Low";
        }
        if (score < 70)
        {
            return "Moderate";
        }
        return "High";
    }

    public string evaluateRisk()
    {
        if (_score < 30)
        {
            return "Safe";
        }
        if (_score < 70)
        {
            return "Warning";
        }
        return "High Risk";
    }
}
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

public class BurnoutService : InterfaceBurnoutService
{
    private readonly BurnoutCalculator _calculator = new();

    public double CalculateScore(StudySession session, int mood)
    {
        return _calculator.calculateScore(session, mood);
    }

    public string GetStudyState(double score)
    {
        return _calculator.getStudyState(score);
    }

    public string EvaluateRisk()
    {
        return _calculator.evaluateRisk();
    }
}

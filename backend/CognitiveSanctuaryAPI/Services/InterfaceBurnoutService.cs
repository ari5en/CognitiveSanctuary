using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

public interface InterfaceBurnoutService
{
    double CalculateScore(StudySession session, int mood);
    string GetStudyState(double score);
    string EvaluateRisk();
}

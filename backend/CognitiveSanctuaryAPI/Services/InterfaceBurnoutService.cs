using System.Threading.Tasks;
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

public interface InterfaceBurnoutService
{
    double CalculateScore(StudySession session, int mood);
    string GetStudyState(double score);
    string EvaluateRisk();
    Task SaveBurnoutRecordAsync(int sessionId, double score, string burnoutLevel);
}

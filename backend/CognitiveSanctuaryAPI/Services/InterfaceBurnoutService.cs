using System.Threading.Tasks;
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

public interface InterfaceBurnoutService
{
    // ── OOP method wrappers ──────────────────────────────────────────────────

    /// <summary>
    /// Wraps BurnoutCalculator.calculateScore().
    /// Called on the BACKEND — score is never computed on the frontend.
    /// </summary>
    double CalculateScore(double previousScore, StudySession session, int mood);

    string GetStudyState(double score);
    string EvaluateRisk();

    // ── Persistence ──────────────────────────────────────────────────────────
    Task SaveBurnoutRecordAsync(int sessionId, double score, string burnoutLevel, int mood, int breaksSkipped);
    Task<BurnoutRecordData> GetLatestRecordByUserAsync(int userId);
}

/// <summary>
/// Read model returned when fetching the latest burnout record.
/// </summary>
public record BurnoutRecordData(double Score, string BurnoutLevel, DateTime RecordedAt);

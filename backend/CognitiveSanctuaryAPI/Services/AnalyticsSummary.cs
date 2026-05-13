namespace CognitiveSanctuaryAPI.Services;

/// <summary>
/// Pre-aggregated analytics summary for a user's dashboard.
/// Computed server-side so the frontend does no data crunching.
/// </summary>
public record AnalyticsSummary(
    double               TotalStudyHours,
    int                  TotalSessionsCompleted,
    double               AverageBurnoutScore,
    double               AverageMood,
    int                  StreakDays,
    int                  TasksCompleted,
    int                  TasksPending,
    IReadOnlyList<DailyHours> WeeklyHours
);

/// <summary>
/// Study hours for a single day — used to populate the Weekly Chart.
/// </summary>
public record DailyHours(string Day, double Hours);

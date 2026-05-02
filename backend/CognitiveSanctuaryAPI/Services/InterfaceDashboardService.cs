using System.Threading.Tasks;

namespace CognitiveSanctuaryAPI.Services;

public interface InterfaceDashboardService
{
    Task<DashboardData> GetDashboardDataAsync(int userId);
}

public record DashboardData(
    double TotalFocusTime,
    int SessionsToday,
    int CompletedTasks,
    double BurnoutRisk,
    string MoodLevel
);

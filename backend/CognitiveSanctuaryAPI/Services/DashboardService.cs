using System;
using System.Linq;
using System.Threading.Tasks;
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

public class DashboardService : InterfaceDashboardService
{
    private readonly InterfaceStudySessionService _sessionService;
    private readonly InterfaceBurnoutService _burnoutService;

    public DashboardService(InterfaceStudySessionService sessionService, InterfaceBurnoutService burnoutService)
    {
        _sessionService = sessionService;
        _burnoutService = burnoutService;
    }

    public async Task<DashboardData> GetDashboardDataAsync(int userId)
    {
        var sessions = await _sessionService.GetSessionsByUserAsync(userId);
        var tasks = await _sessionService.GetTasksByUserAsync(userId);
        var latestBurnout = await _burnoutService.GetLatestRecordByUserAsync(userId);

        var totalFocusTime = sessions.Sum(s => s.studyDuration);
        
        var today = DateTime.Today;
        var sessionsToday = sessions.Count(s => {
            var date = s.startTime; // Note: We should check if it's today
            return date.Date == today;
        });

        var completedTasks = tasks.Count(t => t.status == "Completed");

        return new DashboardData(
            totalFocusTime,
            sessionsToday,
            completedTasks,
            latestBurnout?.Score ?? 30,
            latestBurnout?.BurnoutLevel ?? "Stable"
        );
    }
}

using System.Threading.Tasks;
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

public interface InterfaceStudyPlannerService
{
    StudyPlanner CreatePlanner();
    void GenerateSchedule(StudyPlanner planner, User user);
    void AdjustSchedule(StudyPlanner planner, double score);
    void OptimizePlan(StudyPlanner planner);
    Task SavePlannerAsync(int userId, double recommendedLoad);
    Task<StudyPlanner?> GetPlannerByUserAsync(int userId);
}

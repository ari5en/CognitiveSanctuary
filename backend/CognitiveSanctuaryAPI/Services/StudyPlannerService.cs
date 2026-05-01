using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

public class StudyPlannerService : InterfaceStudyPlannerService
{
    public StudyPlanner CreatePlanner()
    {
        return new StudyPlanner();
    }

    public void GenerateSchedule(StudyPlanner planner, User user)
    {
        planner.generateSchedule(user);
    }

    public void AdjustSchedule(StudyPlanner planner, double score)
    {
        planner.adjustSchedule(score);
    }

    public void OptimizePlan(StudyPlanner planner)
    {
        planner.optimizePlan();
    }
}

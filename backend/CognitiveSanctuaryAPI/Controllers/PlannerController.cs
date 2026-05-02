using System.Threading.Tasks;
using CognitiveSanctuaryAPI.DTOs;
using CognitiveSanctuaryAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CognitiveSanctuaryAPI.Controllers;

[ApiController]
[Route("api/planner")]
public sealed class PlannerController : ControllerBase
{
    private readonly InterfaceStudyPlannerService _plannerService;
    private readonly InterfaceStudySessionService _sessionService;

    public PlannerController(InterfaceStudyPlannerService plannerService, InterfaceStudySessionService sessionService)
    {
        _plannerService = plannerService;
        _sessionService = sessionService;
    }

    [HttpPost]
    public async Task<IActionResult> SavePlanner([FromBody] PlannerCreateRequest request)
    {
        if (request.UserId <= 0)
        {
            return BadRequest("UserId must be greater than 0.");
        }

        if (request.RecommendedLoad < 0)
        {
            return BadRequest("RecommendedLoad cannot be negative.");
        }

        await _plannerService.SavePlannerAsync(request.UserId, request.RecommendedLoad);
        return Ok();
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetPlannerByUser(int userId)
    {
        if (userId <= 0)
        {
            return BadRequest("UserId must be greater than 0.");
        }

        var planner = await _plannerService.GetPlannerByUserAsync(userId);
        if (planner is null)
        {
            return NotFound();
        }

        return Ok(planner);
    }

    [HttpGet("user/{userId:int}/tasks")]
    public async Task<IActionResult> GetTasksByUser(int userId)
    {
        if (userId <= 0) return BadRequest("UserId must be greater than 0.");
        var tasks = await _sessionService.GetTasksByUserAsync(userId);
        return Ok(tasks);
    }

    [HttpPost("tasks")]
    public async Task<IActionResult> AddTask([FromBody] TaskCreateRequest request)
    {
        var sessions = await _sessionService.GetSessionsByUserAsync(request.UserId);
        int sessionId;
        if (sessions.Count == 0)
        {
            var newSession = await _sessionService.CreateSessionAsync(request.UserId, 0);
            sessionId = newSession.sessionId;
        }
        else
        {
            sessionId = sessions[0].sessionId;
        }

        var task = new StudyTask(0, request.Title, request.EstimatedTime, "Pending");
        await _sessionService.AddTaskAsync(sessionId, task);
        return Ok(new { message = "Task added to planner" });
    }

    [HttpPut("tasks/{taskId:int}")]
    public async Task<IActionResult> UpdateTask(int taskId, [FromBody] TaskCreateRequest request)
    {
        var task = new StudyTask(taskId, request.Title, request.EstimatedTime, request.Status);
        await _sessionService.UpdateTaskAsync(taskId, task);
        return Ok(new { message = "Task updated" });
    }

    [HttpDelete("tasks/{taskId:int}")]
    public async Task<IActionResult> DeleteTask(int taskId)
    {
        await _sessionService.DeleteTaskAsync(taskId);
        return Ok(new { message = "Task deleted" });
    }
}

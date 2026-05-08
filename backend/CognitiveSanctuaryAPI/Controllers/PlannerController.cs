using System.Threading.Tasks;
using CognitiveSanctuaryAPI.DTOs;
using CognitiveSanctuaryAPI.Models;
using CognitiveSanctuaryAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CognitiveSanctuaryAPI.Controllers;

[ApiController]
[Route("api/planner")]
public sealed class PlannerController : ControllerBase
{
    private readonly InterfaceStudyPlannerService _plannerService;
    private readonly InterfaceStudySessionService _sessionService;

    public PlannerController(
        InterfaceStudyPlannerService plannerService,
        InterfaceStudySessionService sessionService)
    {
        _plannerService = plannerService;
        _sessionService = sessionService;
    }

    // ── POST /api/planner/user/{userId}/sessions ──────────────────────────────
    /// <summary>
    /// StudyPlanner generates a new StudySession based on the current adaptive config.
    /// This is the correct entry point: StudyPlanner → StudySession.
    /// Focus/break structure is computed automatically — user does not set it.
    /// </summary>
    [HttpPost("user/{userId:int}/sessions")]
    public async Task<IActionResult> GenerateSession(int userId)
    {
        if (userId <= 0)
            return BadRequest("UserId must be greater than 0.");

        var session = await _plannerService.GenerateSessionAsync(userId);
        return Ok(session);
    }

    // ── GET /api/planner/user/{userId} ────────────────────────────────────────
    /// <summary>
    /// Returns the current planner state: recommendedLoad, burnoutMode,
    /// and the adaptive config for the next session.
    /// </summary>
    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetPlannerByUser(int userId)
    {
        if (userId <= 0)
            return BadRequest("UserId must be greater than 0.");

        var planner = await _plannerService.GetPlannerByUserAsync(userId);
        if (planner is null)
            return NotFound();

        return Ok(new
        {
            recommendedLoad = planner.RecommendedLoad,
            burnoutMode     = planner.BurnoutMode,
            adaptiveConfig  = new
            {
                focusDuration = planner.AdaptiveConfig.FocusDuration,
                breakInterval = planner.AdaptiveConfig.BreakInterval,
                breakDuration = planner.AdaptiveConfig.BreakDuration,
                mode          = planner.AdaptiveConfig.Mode,
            },
        });
    }

    // ── GET /api/planner/user/{userId}/tasks ──────────────────────────────────
    [HttpGet("user/{userId:int}/tasks")]
    public async Task<IActionResult> GetTasksByUser(int userId)
    {
        if (userId <= 0)
            return BadRequest("UserId must be greater than 0.");

        var tasks = await _sessionService.GetTasksByUserAsync(userId);
        return Ok(tasks);
    }

    // ── POST /api/planner/user/{userId}/tasks ─────────────────────────────────
    /// <summary>
    /// Adds a task to the user's most recent Planned session.
    /// If no Planned session exists, creates one via GenerateSessionAsync first.
    /// </summary>
    [HttpPost("user/{userId:int}/tasks")]
    public async Task<IActionResult> AddTask(int userId, [FromBody] TaskCreateRequest request)
    {
        // Find the most recent Planned session or generate one
        var sessions = await _sessionService.GetSessionsByUserAsync(userId);

        int sessionId;
        var plannedSession = sessions
            .Cast<StudySession>()
            .FirstOrDefault(s => s.status == "Planned");

        if (plannedSession != null)
        {
            sessionId = plannedSession.sessionId;
        }
        else if (sessions.Count == 0)
        {
            var newSession = await _plannerService.GenerateSessionAsync(userId);
            sessionId = newSession.sessionId;
        }
        else
        {
            // Fall back to most recent session
            sessionId = sessions[0].sessionId;
        }

        var task = new StudyTask(0, request.Title, request.EstimatedTime, "Pending");
        await _sessionService.AddTaskAsync(sessionId, task);

        return Ok(new { message = "Task added to planner session", sessionId });
    }

    // ── PUT /api/planner/tasks/{taskId} ───────────────────────────────────────
    [HttpPut("tasks/{taskId:int}")]
    public async Task<IActionResult> UpdateTask(int taskId, [FromBody] TaskCreateRequest request)
    {
        var task = new StudyTask(taskId, request.Title, request.EstimatedTime, request.Status);
        await _sessionService.UpdateTaskAsync(taskId, task);
        return Ok(new { message = "Task updated" });
    }

    // ── DELETE /api/planner/tasks/{taskId} ────────────────────────────────────
    [HttpDelete("tasks/{taskId:int}")]
    public async Task<IActionResult> DeleteTask(int taskId)
    {
        await _sessionService.DeleteTaskAsync(taskId);
        return Ok(new { message = "Task deleted" });
    }

    // ── POST /api/planner/user/{userId} (save planner manually) ──────────────
    [HttpPost("user/{userId:int}")]
    public async Task<IActionResult> SavePlanner(int userId, [FromBody] PlannerCreateRequest request)
    {
        if (userId <= 0)
            return BadRequest("UserId must be greater than 0.");

        if (request.RecommendedLoad < 0)
            return BadRequest("RecommendedLoad cannot be negative.");

        await _plannerService.SavePlannerAsync(
            userId,
            request.RecommendedLoad,
            "Normal",
            request.PlannedFocusDuration,
            request.BreakIntervalMinutes,
            request.PlannedBreakDuration);
        return Ok();
    }
}

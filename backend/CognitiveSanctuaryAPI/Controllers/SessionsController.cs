using System.Threading.Tasks;
using CognitiveSanctuaryAPI.DTOs;
using CognitiveSanctuaryAPI.Models;
using CognitiveSanctuaryAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CognitiveSanctuaryAPI.Controllers;

[ApiController]
[Route("api/sessions")]
public sealed class SessionsController : ControllerBase
{
    private readonly InterfaceStudySessionService _studySessionService;
    private readonly InterfaceStudyPlannerService _plannerService;

    public SessionsController(
        InterfaceStudySessionService studySessionService,
        InterfaceStudyPlannerService plannerService)
    {
        _studySessionService = studySessionService;
        _plannerService      = plannerService;
    }

    // ── POST /api/sessions ────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] SessionCreateRequest request)
    {
        if (request.UserId <= 0)
            return BadRequest("UserId must be greater than 0.");

        if (request.BreakCount < 0)
            return BadRequest("BreakCount cannot be negative.");

        if (request.PlannedFocusDuration <= 0)
            return BadRequest("PlannedFocusDuration must be greater than 0.");

        var session = await _studySessionService.CreateSessionAsync(
            request.UserId,
            request.BreakCount,
            request.PlannedFocusDuration,
            request.BreakIntervalMinutes,
            request.PlannedBreakDuration);

        return Ok(session);
    }

    // ── GET /api/sessions/user/{userId} ──────────────────────────────────────
    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetSessionsByUser(int userId)
    {
        if (userId <= 0)
            return BadRequest("UserId must be greater than 0.");

        var sessions = await _studySessionService.GetSessionsByUserAsync(userId);
        return Ok(sessions);
    }

    // ── GET /api/sessions/user/{userId}/tasks ─────────────────────────────────
    [HttpGet("user/{userId:int}/tasks")]
    public async Task<IActionResult> GetTasksByUser(int userId)
    {
        if (userId <= 0)
            return BadRequest("UserId must be greater than 0.");

        var tasks = await _studySessionService.GetTasksByUserAsync(userId);
        return Ok(tasks);
    }

    // ── GET /api/sessions/{sessionId}/tasks ──────────────────────────────────
    [HttpGet("{sessionId:int}/tasks")]
    public async Task<IActionResult> GetTasksBySession(int sessionId)
    {
        if (sessionId <= 0)
            return BadRequest("SessionId must be greater than 0.");

        var tasks = await _studySessionService.GetTasksBySessionAsync(sessionId);
        return Ok(tasks);
    }

    // ── POST /api/sessions/{sessionId}/tasks ─────────────────────────────────
    [HttpPost("{sessionId:int}/tasks")]
    public async Task<IActionResult> AddTask(int sessionId, [FromBody] TaskCreateRequest request)
    {
        if (sessionId <= 0)
            return BadRequest("SessionId must be greater than 0.");

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest("Title is required.");

        if (request.EstimatedTime < 0)
            return BadRequest("EstimatedTime cannot be negative.");

        var task = new StudyTask(0, request.Title, request.EstimatedTime, request.Status);
        await _studySessionService.AddTaskAsync(sessionId, task);

        return Ok(new { message = "Task added successfully" });
    }

    // ── PATCH /api/sessions/{sessionId}/complete ──────────────────────────────
    /// <summary>
    /// Atomic session completion — runs the full EVALUATE phase:
    ///   1. Persists timing + mood + breaksSkipped  (StudySessionService)
    ///   2. Runs BurnoutCalculator on the backend   (score is NOT from frontend)
    ///   3. Saves BurnoutRecord
    ///   4. Runs StudyPlanner.adjustSchedule() for the derived adaptive response
    /// Returns: burnoutScore, burnoutLevel, adaptiveConfig for the next session.
    /// </summary>
    [HttpPatch("{sessionId:int}/complete")]
    public async Task<IActionResult> CompleteSession(
        int sessionId,
        [FromBody] SessionCompleteRequest request)
    {
        if (sessionId <= 0)
            return BadRequest("SessionId must be greater than 0.");

        if (request.StudyDuration < 0)
            return BadRequest("StudyDuration cannot be negative.");

        if (request.EndTime < request.StartTime)
            return BadRequest("EndTime must be after StartTime.");

        if (request.Mood < 1 || request.Mood > 4)
            return BadRequest("Mood must be between 1 (Happy) and 4 (Exhausted).");

        if (request.BreaksSkipped < 0)
            return BadRequest("BreaksSkipped cannot be negative.");

        // Steps 1–4: session persistence + burnout scoring + burnout record save
        var result = await _studySessionService.CompleteSessionAsync(
            sessionId,
            request.StartTime,
            request.EndTime,
            request.StudyDuration,
            request.Mood,
            request.BreaksSkipped);

        // Step 5: Adaptive scheduling
        // Controller handles this to avoid circular service dependency.
        // StudyPlannerService depends on StudySessionService, so we call planner here.
        var planner        = _plannerService.CreatePlanner();
        var adaptiveConfig = _plannerService.AdjustSchedule(planner, result.BurnoutScore);

        return Ok(new
        {
            burnoutScore   = result.BurnoutScore,
            burnoutLevel   = result.BurnoutLevel,
            adaptiveConfig = new
            {
                focusDuration = adaptiveConfig.FocusDuration,
                breakInterval = adaptiveConfig.BreakInterval,
                breakDuration = adaptiveConfig.BreakDuration,
                mode          = adaptiveConfig.Mode,
            }
        });
    }

    // ── PATCH /api/sessions/{sessionId}/times  (legacy — kept for compat) ────
    [HttpPatch("{sessionId:int}/times")]
    public async Task<IActionResult> UpdateSessionTimes(
        int sessionId,
        [FromBody] SessionTimesUpdateRequest request)
    {
        if (sessionId <= 0)
            return BadRequest("SessionId must be greater than 0.");

        if (request.StudyDuration < 0)
            return BadRequest("StudyDuration cannot be negative.");

        if (request.EndTime < request.StartTime)
            return BadRequest("EndTime must be greater than or equal to StartTime.");

        await _studySessionService.UpdateSessionTimesAsync(
            sessionId, request.StartTime, request.EndTime, request.StudyDuration);

        return Ok();
    }
}

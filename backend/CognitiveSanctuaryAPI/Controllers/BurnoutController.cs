using System;
using System.Threading.Tasks;
using CognitiveSanctuaryAPI.DTOs;
using CognitiveSanctuaryAPI.Models;
using CognitiveSanctuaryAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CognitiveSanctuaryAPI.Controllers;

[ApiController]
[Route("api/burnout")]
public sealed class BurnoutController : ControllerBase
{
    private readonly InterfaceBurnoutService _burnoutService;
    private readonly InterfaceStudySessionService _sessionService;
    private readonly InterfaceStudyPlannerService _plannerService;

    public BurnoutController(
        InterfaceBurnoutService burnoutService,
        InterfaceStudySessionService sessionService,
        InterfaceStudyPlannerService plannerService)
    {
        _burnoutService = burnoutService;
        _sessionService = sessionService;
        _plannerService = plannerService;
    }

    // ── POST /api/burnout ─────────────────────────────────────────────────────
    /// <summary>
    /// Direct burnout record creation.
    /// Score is computed HERE on the backend using BurnoutCalculator — not passed from frontend.
    /// For the full atomic pipeline (timing + burnout + planner update in one call),
    /// use PATCH /api/sessions/{id}/complete instead.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> SaveBurnoutRecord([FromBody] BurnoutRecordRequest request)
    {
        if (request.SessionId <= 0)
            return BadRequest("SessionId must be greater than 0.");

        if (request.Mood < 1 || request.Mood > 4)
            return BadRequest("Mood must be between 1 (Happy) and 4 (Exhausted).");

        if (request.BreaksSkipped < 0)
            return BadRequest("BreaksSkipped cannot be negative.");

        var sessionWithUser = await _sessionService.GetSessionWithUserIdAsync(request.SessionId);
        if (sessionWithUser is null)
            return NotFound($"Session {request.SessionId} not found.");

        var scoringSession = BuildSessionForScoring(sessionWithUser.Session, request.BreaksSkipped);
        double burnoutScore = _burnoutService.CalculateScore(scoringSession, request.Mood);
        string burnoutLevel = _burnoutService.GetStudyState(burnoutScore);

        await _burnoutService.SaveBurnoutRecordAsync(
            request.SessionId,
            burnoutScore,
            burnoutLevel,
            request.Mood,
            request.BreaksSkipped);

        var planner = _plannerService.CreatePlanner();
        var adaptiveConfig = _plannerService.AdjustSchedule(planner, burnoutScore);

        return Ok(new
        {
            burnoutScore,
            burnoutLevel,
            adaptiveConfig = new
            {
                focusDuration = adaptiveConfig.FocusDuration,
                breakInterval = adaptiveConfig.BreakInterval,
                breakDuration = adaptiveConfig.BreakDuration,
                mode          = adaptiveConfig.Mode,
            }
        });
    }

    private static StudySession BuildSessionForScoring(StudySession session, int breaksSkipped)
    {
        double expectedBreaks = session.studyDuration / 45.0;
        int actualBreaks = (int)Math.Max(0, Math.Round(expectedBreaks) - breaksSkipped);

        var scoringSession = new StudySession(session.sessionId, actualBreaks)
        {
            studyDuration = session.studyDuration,
        };

        return scoringSession;
    }

    // ── GET /api/burnout/user/{userId} ────────────────────────────────────────
    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetLatestRecordByUser(int userId)
    {
        if (userId <= 0)
            return BadRequest("UserId must be greater than 0.");

        var record = await _burnoutService.GetLatestRecordByUserAsync(userId);
        return Ok(record);
    }
}

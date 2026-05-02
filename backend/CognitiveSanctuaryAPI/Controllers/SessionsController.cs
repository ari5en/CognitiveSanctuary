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

    public SessionsController(InterfaceStudySessionService studySessionService)
    {
        _studySessionService = studySessionService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] SessionCreateRequest request)
    {
        if (request.UserId <= 0)
        {
            return BadRequest("UserId must be greater than 0.");
        }

        if (request.BreakCount < 0)
        {
            return BadRequest("BreakCount cannot be negative.");
        }

        var session = await _studySessionService.CreateSessionAsync(request.UserId, request.BreakCount);
        return Ok(session);
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetSessionsByUser(int userId)
    {
        if (userId <= 0)
        {
            return BadRequest("UserId must be greater than 0.");
        }

        var sessions = await _studySessionService.GetSessionsByUserAsync(userId);
        return Ok(sessions);
    }

    [HttpGet("user/{userId:int}/tasks")]
    public async Task<IActionResult> GetTasksByUser(int userId)
    {
        if (userId <= 0)
        {
            return BadRequest("UserId must be greater than 0.");
        }

        var tasks = await _studySessionService.GetTasksByUserAsync(userId);
        return Ok(tasks);
    }


    [HttpPost("{sessionId:int}/tasks")]
    public async Task<IActionResult> AddTask(int sessionId, [FromBody] TaskCreateRequest request)
    {
        if (sessionId <= 0)
        {
            return BadRequest("SessionId must be greater than 0.");
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest("Title is required.");
        }

        if (request.EstimatedTime < 0)
        {
            return BadRequest("EstimatedTime cannot be negative.");
        }

        var task = new StudyTask(0, request.Title, request.EstimatedTime, request.Status);
        await _studySessionService.AddTaskAsync(sessionId, task);

        return Ok(new { message = "Task added successfully" });
    }

    [HttpPatch("{sessionId:int}/times")]
    public async Task<IActionResult> UpdateSessionTimes(int sessionId, [FromBody] SessionTimesUpdateRequest request)
    {
        if (sessionId <= 0)
        {
            return BadRequest("SessionId must be greater than 0.");
        }

        if (request.StudyDuration < 0)
        {
            return BadRequest("StudyDuration cannot be negative.");
        }

        if (request.EndTime < request.StartTime)
        {
            return BadRequest("EndTime must be greater than or equal to StartTime.");
        }

        await _studySessionService.UpdateSessionTimesAsync(sessionId, request.StartTime, request.EndTime, request.StudyDuration);
        return Ok();
    }
}

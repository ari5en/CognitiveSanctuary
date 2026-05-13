using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CognitiveSanctuaryAPI.Services;

/// <summary>
/// Controller for the dashboard analytics endpoint.
/// Delegates all computation to StudySessionService.GetAnalyticsAsync().
/// </summary>
[Microsoft.AspNetCore.Mvc.ApiController]
[Microsoft.AspNetCore.Mvc.Route("api/analytics")]
public sealed class AnalyticsController : Microsoft.AspNetCore.Mvc.ControllerBase
{
    private readonly InterfaceStudySessionService _sessionService;

    public AnalyticsController(InterfaceStudySessionService sessionService)
    {
        _sessionService = sessionService;
    }

    // ── GET /api/analytics/user/{userId} ─────────────────────────────────────
    /// <summary>
    /// Returns a pre-aggregated analytics snapshot for the dashboard.
    /// Replaces the frontend's need to call multiple endpoints and crunch numbers.
    /// </summary>
    [Microsoft.AspNetCore.Mvc.HttpGet("user/{userId:int}")]
    public async Task<Microsoft.AspNetCore.Mvc.IActionResult> GetAnalytics(int userId)
    {
        if (userId <= 0)
            return BadRequest("UserId must be greater than 0.");

        var summary = await _sessionService.GetAnalyticsAsync(userId);
        return Ok(summary);
    }
}

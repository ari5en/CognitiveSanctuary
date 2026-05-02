using System.Threading.Tasks;
using CognitiveSanctuaryAPI.DTOs;
using CognitiveSanctuaryAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CognitiveSanctuaryAPI.Controllers;

[ApiController]
[Route("api/burnout")]
public sealed class BurnoutController : ControllerBase
{
    private readonly InterfaceBurnoutService _burnoutService;

    public BurnoutController(InterfaceBurnoutService burnoutService)
    {
        _burnoutService = burnoutService;
    }

    [HttpPost]
    public async Task<IActionResult> SaveBurnoutRecord([FromBody] BurnoutRecordRequest request)
    {
        if (request.SessionId <= 0)
        {
            return BadRequest("SessionId must be greater than 0.");
        }

        if (request.Score < 0)
        {
            return BadRequest("Score cannot be negative.");
        }

        var burnoutLevel = _burnoutService.GetStudyState(request.Score);
        await _burnoutService.SaveBurnoutRecordAsync(request.SessionId, request.Score, burnoutLevel);

        return Ok(new { burnoutLevel });
    }
}

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

    public PlannerController(InterfaceStudyPlannerService plannerService)
    {
        _plannerService = plannerService;
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
}

using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using CognitiveSanctuaryAPI.Services;

namespace CognitiveSanctuaryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly InterfaceDashboardService _dashboardService;

    public DashboardController(InterfaceDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetDashboardData(int userId)
    {
        if (userId <= 0) return BadRequest("UserId must be greater than 0.");
        
        try 
        {
            var data = await _dashboardService.GetDashboardDataAsync(userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Error aggregating dashboard data: " + ex.Message);
        }
    }
}

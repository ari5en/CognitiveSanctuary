var builder = WebApplication.CreateBuilder(args);

// Add services to the DI container
//DI means Dependency Injection. It is a design pattern that
// allows us to inject dependencies into a class instead
// of creating them inside the class.

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddScoped<CognitiveSanctuaryAPI.Services.InterfaceStudySessionService, CognitiveSanctuaryAPI.Services.StudySessionService>();
builder.Services.AddScoped<CognitiveSanctuaryAPI.Services.InterfaceBurnoutService, CognitiveSanctuaryAPI.Services.BurnoutService>();
builder.Services.AddScoped<CognitiveSanctuaryAPI.Services.InterfaceStudyPlannerService, CognitiveSanctuaryAPI.Services.StudyPlannerService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();

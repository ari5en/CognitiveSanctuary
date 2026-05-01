using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the DI container
//DI means Dependency Injection. It is a design pattern that
// allows us to inject dependencies into a class instead
// of creating them inside the class.

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var supabaseUrl = builder.Configuration["SUPABASE_URL"];
var supabaseAnonKey = builder.Configuration["ANON_KEY"];

if (string.IsNullOrWhiteSpace(supabaseUrl) || string.IsNullOrWhiteSpace(supabaseAnonKey))
{
    throw new InvalidOperationException("SUPABASE_URL and ANON_KEY must be set in the environment.");
}

void ConfigureSupabaseClient(HttpClient client)
{
    client.BaseAddress = new Uri($"{supabaseUrl.TrimEnd('/')}/rest/v1/");
    client.DefaultRequestHeaders.Clear();
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    client.DefaultRequestHeaders.Add("apikey", supabaseAnonKey);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", supabaseAnonKey);
}

builder.Services.AddHttpClient<CognitiveSanctuaryAPI.Services.InterfaceStudySessionService, CognitiveSanctuaryAPI.Services.StudySessionService>(
    client => ConfigureSupabaseClient(client));

builder.Services.AddHttpClient<CognitiveSanctuaryAPI.Services.InterfaceBurnoutService, CognitiveSanctuaryAPI.Services.BurnoutService>(
    client => ConfigureSupabaseClient(client));

builder.Services.AddHttpClient<CognitiveSanctuaryAPI.Services.InterfaceStudyPlannerService, CognitiveSanctuaryAPI.Services.StudyPlannerService>(
    client => ConfigureSupabaseClient(client));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();

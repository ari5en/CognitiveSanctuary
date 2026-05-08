using System.Net.Http.Headers;

// =====================================================
// LOAD ENVIRONMENT VARIABLES FROM .ENV FILE
// =====================================================
// This manually reads the .env file from the root directory
// and sets them as environment variables so builder.Configuration can find them.
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "../../.env");
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        var parts = line.Split('=', 2, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 2)
        {
            Environment.SetEnvironmentVariable(parts[0], parts[1].Trim());
        }
    }
}

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables(); // Ensure env vars are picked up

/*
=====================================================
 SERVICE REGISTRATION (DEPENDENCY INJECTION SETUP)
=====================================================
DI (Dependency Injection) is a design pattern where
we register services here and let .NET inject them
automatically where needed (controllers/services).
*/

// Registers controller support (API endpoints)
builder.Services.AddControllers();

// Registers OpenAPI/Swagger support (API documentation UI)
builder.Services.AddOpenApi();

// =====================================================
// CORS CONFIGURATION
// =====================================================
// This allows your React frontend (port 5173) to talk to this API.
// Without this, the browser will block requests for security reasons.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

/*
These values come from appsettings.json or environment variables.
They are required to connect to Supabase REST API.
supabase configuration
*/

var supabaseUrl = builder.Configuration["SUPABASE_URL"];
var supabaseAnonKey = builder.Configuration["ANON_KEY"];

/*
If Supabase credentials are missing, stop the app immediately.
This prevents runtime errors later.
*/
if (string.IsNullOrWhiteSpace(supabaseUrl) || string.IsNullOrWhiteSpace(supabaseAnonKey))
{
    throw new InvalidOperationException("SUPABASE_URL and ANON_KEY must be set in the environment.");
}

/*
This function configures HttpClient so every request
automatically includes Supabase headers + base URL.
*/
void ConfigureSupabaseClient(HttpClient client)
{
    // Base URL for Supabase REST API
    client.BaseAddress = new Uri($"{supabaseUrl.TrimEnd('/')}/rest/v1/");

    // Clear any default headers first
    client.DefaultRequestHeaders.Clear();

    // Tell Supabase we expect JSON responses
    client.DefaultRequestHeaders.Accept.Add(
        new MediaTypeWithQualityHeaderValue("application/json")
    );

    // API key required by Supabase
    client.DefaultRequestHeaders.Add("apikey", supabaseAnonKey);

    // Authorization header (Bearer token authentication)
    client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", supabaseAnonKey);
}

/*
=====================================================
 REGISTERING SERVICES (DI + HTTP CLIENT INTEGRATION)
=====================================================
Each service is registered with HttpClient configured
to communicate with Supabase REST API.

Flow:
Controller → Service → HttpClient → Supabase API
*/

/*
=====================================================
 SERVICE REGISTRATIONS — ORDER MATTERS
=====================================================
 Dependency chain (no circular refs):
   BurnoutService        ← no service deps
   StudySessionService   ← depends on BurnoutService
   StudyPlannerService   ← depends on BurnoutService + StudySessionService
*/

// 1. Burnout service — no dependencies on other custom services
builder.Services.AddHttpClient<
    CognitiveSanctuaryAPI.Services.InterfaceBurnoutService,
    CognitiveSanctuaryAPI.Services.BurnoutService
>(client => ConfigureSupabaseClient(client));

// 2. Study Session service — depends on BurnoutService + StudyPlannerService.
//    StudyPlannerService is registered after, but .NET DI resolves lazily at runtime.
builder.Services.AddHttpClient<
    CognitiveSanctuaryAPI.Services.InterfaceStudySessionService,
    CognitiveSanctuaryAPI.Services.StudySessionService
>(client => ConfigureSupabaseClient(client));

// 3. Study Planner service — depends on BurnoutService + StudySessionService
builder.Services.AddHttpClient<
    CognitiveSanctuaryAPI.Services.InterfaceStudyPlannerService,
    CognitiveSanctuaryAPI.Services.StudyPlannerService
>(client => ConfigureSupabaseClient(client));

/*
=====================================================
 BUILD APPLICATION PIPELINE
=====================================================
This creates the actual running web application.
*/
var app = builder.Build();

/*
=====================================================
 DEVELOPMENT-ONLY MIDDLEWARE
=====================================================
Swagger/OpenAPI UI is only enabled in development mode.
*/
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

/*
=====================================================
 MIDDLEWARE PIPELINE CONFIGURATION
=====================================================
These define how HTTP requests are processed.
*/

// Redirect HTTP → HTTPS
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Map controller routes (enables API endpoints)
app.MapControllers();

/*
=====================================================
 START APPLICATION
=====================================================
Runs the web server.
*/
app.Run();
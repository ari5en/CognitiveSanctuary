using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

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

// Study Session service registration
builder.Services.AddHttpClient<
    CognitiveSanctuaryAPI.Services.InterfaceStudySessionService,
    CognitiveSanctuaryAPI.Services.StudySessionService
>(client => ConfigureSupabaseClient(client));

// Burnout service registration
builder.Services.AddHttpClient<
    CognitiveSanctuaryAPI.Services.InterfaceBurnoutService,
    CognitiveSanctuaryAPI.Services.BurnoutService
>(client => ConfigureSupabaseClient(client));

// Study Planner service registration
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

// Map controller routes (enables API endpoints)
app.MapControllers();

/*
=====================================================
 START APPLICATION
=====================================================
Runs the web server.
*/
app.Run();
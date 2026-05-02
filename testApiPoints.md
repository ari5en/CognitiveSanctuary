Backend Test Commands

1. Start the backend with environment variables loaded:

```powershell
cd "c:\Users\HP LAPTOP 15s\CognitiveSanctuary\backend\CognitiveSanctuaryAPI"
Get-Content "..\..\.env" | ForEach-Object { if ($_ -match '^(SUPABASE_URL|ANON_KEY)=') { $parts = $_ -split '=',2; $name = $parts[0]; $value = $parts[1]; Set-Item -Path ("Env:" + $name) -Value $value } }
dotnet run --launch-profile http
```

2. Verify the health endpoint:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5197/api/health"
```

3. Create a session:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5197/api/sessions" -ContentType "application/json" -Body (@{ userId = 1; breakCount = 0 } | ConvertTo-Json -Compress)
```

4. Fetch sessions for a user:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5197/api/sessions/user/1"
```

5. Add a task to a session:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5197/api/sessions/8/tasks" -ContentType "application/json" -Body (@{ title = "Calculus"; estimatedTime = 45; status = "Active" } | ConvertTo-Json -Compress)
```

6. Update session times:

```powershell
Invoke-RestMethod -Method Patch -Uri "http://localhost:5197/api/sessions/8/times" -ContentType "application/json" -Body (@{ startTime = "2026-05-01T09:00:00"; endTime = "2026-05-01T10:30:00"; studyDuration = 90 } | ConvertTo-Json -Compress)
```

7. Save a burnout record:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5197/api/burnout" -ContentType "application/json" -Body (@{ sessionId = 8; score = 45 } | ConvertTo-Json -Compress)
```

8. Save and fetch planner data:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5197/api/planner" -ContentType "application/json" -Body (@{ userId = 1; recommendedLoad = 75 } | ConvertTo-Json -Compress)
Invoke-RestMethod -Method Get -Uri "http://localhost:5197/api/planner/user/1"
```
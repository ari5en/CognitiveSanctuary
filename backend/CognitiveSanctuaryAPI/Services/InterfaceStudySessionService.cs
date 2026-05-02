using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

// I in the fileName means Interface. 
//Interfaces Files defines what methods should exists in the service files
// and then the service files is the one that puts logic inside method
// the logic inside method that the service files is implementing is
// from the class files in the folder Models.
// and then the controller files is the one that calls 
//the methods in the service files 
// to execute the logic and return the response to the client.

// The "I" in the file name means Interface.  
// Interface files define what methods should exist in the service files.  

// Then the service files are the ones that put the logic inside those methods.  
// The logic inside the service methods is implemented inside the service class itself,  
// while Models are only used as data structures.  

// Then the controller files are the ones that call the methods in the service files  
// in order to execute the logic and return a response back to the client.

// Client (Frontend / Postman)
//     ↓
// HTTP Request (API Endpoint)
//     ↓
// Controller (Receives & validates request)
//     ↓
// DTO (Transforms request data)
//     ↓
// Service Layer (Business logic execution)
//     ↓
// HttpClient
//     ↓
// Supabase REST API
//     ↓
// Database
//     ↓
// Response returned to Controller
//     ↓
// Client receives response


public interface InterfaceStudySessionService
{
    Task<StudySession> CreateSessionAsync(int userId, int breakCount);
    Task UpdateSessionTimesAsync(int sessionId, DateTime startTime, DateTime endTime, double studyDuration);
    Task AddTaskAsync(int sessionId, StudyTask task);
    Task<IReadOnlyList<StudySession>> GetSessionsByUserAsync(int userId);
}

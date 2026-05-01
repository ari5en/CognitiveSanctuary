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


public interface InterfaceStudySessionService
{
    Task<StudySession> CreateSessionAsync(int userId, int breakCount);
    Task UpdateSessionTimesAsync(int sessionId, DateTime startTime, DateTime endTime, double studyDuration);
    Task AddTaskAsync(int sessionId, StudyTask task);
    Task<IReadOnlyList<StudySession>> GetSessionsByUserAsync(int userId);
}

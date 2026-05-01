using System.Collections.Generic;
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
    StudySession CreateSession(int sessionId, int breakCount);
    void StartSession(StudySession session);
    void EndSession(StudySession session);
    void AddTask(StudySession session, StudyTask task);
    IReadOnlyList<StudySession> GetAllSessions();
}

using System.Collections.Generic;

// calling the class files models from the folder Models
using CognitiveSanctuaryAPI.Models;

namespace CognitiveSanctuaryAPI.Services;

// the class StydySessionService implements the 
//interface InterfaceStudySessionService
// this shows abstraction oop pillar
// which means that the classStudySessionService is 
//abstracting the implementation of the methods
// defined in the interface InterfaceStudySessionService

public class StudySessionService : InterfaceStudySessionService
{
    private readonly List<StudySession> _sessions = new();

    public StudySession CreateSession(int sessionId, int breakCount)
    {
        var session = new StudySession(sessionId, breakCount);
        _sessions.Add(session);
        return session; 
    }

    public void StartSession(StudySession session)
    {
        session.startSession();
    }

    public void EndSession(StudySession session)
    {
        session.endSession();
    }

    public void AddTask(StudySession session, StudyTask task)
    {
        // Placeholder for task tracking until a collection is added to StudySession.
        _ = session;
        _ = task;
    }

    public IReadOnlyList<StudySession> GetAllSessions()
    {
        return _sessions.AsReadOnly();
    }
}

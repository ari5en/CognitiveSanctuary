namespace CognitiveSanctuaryAPI.Models;

public class User
{
    private int _userId;
    private string _name;
    private string _email;
    private int _moodLevel;

    public User(int userId, string name, string email, int moodLevel)
    {
        _userId = userId;
        _name = name;
        _email = email;
        _moodLevel = moodLevel;
    }

    public int userId
    {
        get { return _userId; }
        private set { _userId = value; }
    }

    public string name
    {
        get { return _name; }
        private set { _name = value; }
    }

    public string email
    {
        get { return _email; }
        private set { _email = value; }
    }

    public int moodLevel
    {
        get { return _moodLevel; }
        private set { _moodLevel = value; }
    }

    public void updateMood(int mood)
    {
        _moodLevel = mood;
    }

    public string getUserInfo()
    {
        return $"{_name} ({_email}) - Mood: {_moodLevel}";
    }
}

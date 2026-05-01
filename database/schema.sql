-- =========================================
-- Cognitive Sanctuary Database Schema
-- PostgreSQL / Supabase
-- =========================================


-- USERS TABLE
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    mood_level INT DEFAULT 5
);



-- STUDY SESSIONS TABLE
CREATE TABLE study_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    study_duration DOUBLE PRECISION,
    break_count INT DEFAULT 0,
    start_time TIMESTAMP,
    end_time TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);



-- STUDY TASKS TABLE
CREATE TABLE study_tasks (
    task_id SERIAL PRIMARY KEY,
    session_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    estimated_time DOUBLE PRECISION,
    status VARCHAR(50),

    CONSTRAINT fk_session
        FOREIGN KEY(session_id)
        REFERENCES study_sessions(session_id)
        ON DELETE CASCADE
);



-- STUDY PLANNER TABLE
CREATE TABLE study_planner (
    planner_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    recommended_load DOUBLE PRECISION,

    CONSTRAINT fk_planner_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);



-- BURNOUT RECORDS TABLE
CREATE TABLE burnout_records (
    record_id SERIAL PRIMARY KEY,
    session_id INT NOT NULL,
    burnout_score DOUBLE PRECISION,
    burnout_level VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_burnout_session
        FOREIGN KEY(session_id)
        REFERENCES study_sessions(session_id)
        ON DELETE CASCADE
);
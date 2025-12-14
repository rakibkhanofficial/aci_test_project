-- Create admin user
INSERT INTO users (username, email, hashed_password, full_name, is_active, is_superuser)
VALUES (
    'astronaut_admin',
    'admin@chimera.space',
    -- Password: 'SpaceAdmin2024!' (bcrypt hash)
    '$2b$12$YourBcryptHashHere', -- Replace with actual bcrypt hash
    'Astronaut Administrator',
    TRUE,
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Create test astronaut user
INSERT INTO users (username, email, hashed_password, full_name, is_active, is_superuser)
VALUES (
    'astronaut_01',
    'astro1@chimera.space',
    -- Password: 'SecurePass123!'
    '$2b$12$YourBcryptHashForAstro', -- Replace with actual bcrypt hash
    'Commander Alex Johnson',
    TRUE,
    FALSE
) ON CONFLICT (username) DO NOTHING;

-- Create ground control user
INSERT INTO users (username, email, hashed_password, full_name, is_active, is_superuser)
VALUES (
    'ground_control',
    'control@mission.earth',
    -- Password: 'MissionControl2024!'
    '$2b$12$YourBcryptHashForControl', -- Replace with actual bcrypt hash
    'Ground Control Center',
    TRUE,
    TRUE
) ON CONFLICT (username) DO NOTHING;
USE BookOrbit;

-- Delete existing admin user if exists
DELETE FROM Users WHERE username = 'admin';

-- Insert admin user with hashed password (password is 'admin123')
INSERT INTO Users (username, email, password_hash, role) 
VALUES (
    'admin',
    'admin@bookorbit.com',
    '$2b$10$Yd4toC0cTWHuF12yqnsCxeAcypPlrW53BtvKR9jF4HMUCzxw76VK.', -- This is the hashed version of 'admin123' using bcrypt
    'admin'
); 
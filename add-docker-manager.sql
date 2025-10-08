-- SQL Script to add Docker Manager to existing UpDesk installation
-- Run this if you already have an UpDesk database and want to add the Docker Manager

-- Add Docker Manager program
INSERT INTO programs (name, url, icon, position_x, position_y)
VALUES ('Docker Manager', '/apps/docker', '/icons/docker.svg', 4, 0);

-- Verify the insertion
SELECT * FROM programs WHERE name = 'Docker Manager';
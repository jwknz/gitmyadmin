USE GMA;

-- DROP TABLE IF EXISTS gma_users;
-- CREATE TABLE gma_users (
--     ID INT(11) AUTO_INCREMENT,
--     USERNAME VARCHAR(50) NOT NULL,
--     GITHUB_ID VARCHAR(50) NOT NULL,
--     REPO_URL VARCHAR(200) NOT NULL,
--     LOCATION VARCHAR(100), -- can be null, since data is optional
--     AVATAR VARCHAR(200) NOT NULL,
--     EMAIL VARCHAR(50), -- can be null, since data is optional
--     TOKEN VARCHAR (50) NOT NULL,
--     CREATION_DATE DATE NOT NULL,
--     UPDATE_DATE DATE NOT NULL, -- checking if the user has to re-authorize the app
--     PRIMARY KEY(ID)
-- ) AUTO_INCREMENT = 1;

TRUNCATE gma_users;

-- SELECT * FROM gma_users;

-- INSERT INTO gma_users (USERNAME, GITHUB_ID, REPO_URL, LOCATION, AVATAR, EMAIL, TOKEN, CREATION_DATE, UPDATE_DATE) VALUES ("jwknz","22186552","https://api.github.com/users/jwknz/repos","Tauranga - New Zealand","https://avatars3.githubusercontent.com/u/22186552?v=4","null","bb00c63dd0c916bef4b95f45e3bd3901fa27ca54", NOW(), NOW())




































































































































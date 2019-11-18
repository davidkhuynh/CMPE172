-- create secrets
CREATE DATABASE IF NOT EXISTS fumblr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fumblr;

-- create tables
CREATE TABLE IF NOT EXISTS Users (
    username VARCHAR(64) NOT NULL UNIQUE,
    birthday DATE NOT NULL,
    displayName VARCHAR(256),
    bio VARCHAR(4096),
    createdOn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (username)
);

CREATE TABLE IF NOT EXISTS Posts (
    id VARCHAR(64) NOT NULL UNIQUE DEFAULT '',
    username VARCHAR(64) NOT NULL,
    picture VARCHAR(4096),
    text VARCHAR(4096),
    postedOn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    editedOn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
);

-- generate unique ID for post id
DELIMITER //
CREATE TRIGGER IF NOT EXISTS set_post_id
BEFORE INSERT 
ON Posts FOR EACH ROW
BEGIN
    DECLARE rand_id VARCHAR(64);
    SET rand_id = (SELECT MD5(RAND()));
    WHILE EXISTS(SELECT id FROM Posts WHERE id = rand_id)
    DO
        SET rand_id = (SELECT MD5(RAND()));
    END WHILE;
    SET NEW.id = rand_id;
END //
DELIMITER ;

CREATE TABLE IF NOT EXISTS Bookmarks (
    username VARCHAR(64) NOT NULL,
    postId VARCHAR(64) NOT NULL,
    
    PRIMARY KEY (username, postId)
);

CREATE TABLE IF NOT EXISTS PostLikes (
    postId VARCHAR(64) NOT NULL,
    username VARCHAR(64) NOT NULL,

    PRIMARY KEY (postId, username)
);

CREATE TABLE IF NOT EXISTS PostTags (
    postId VARCHAR(64) NOT NULL,
    tag VARCHAR(256) NOT NULL,

    PRIMARY KEY (postId, tag)
);

CREATE TABLE IF NOT EXISTS Follows (
    follower VARCHAR(64) NOT NULL,
    following VARCHAR(64) NOT NULL,

    PRIMARY KEY (follower, following)
);

CREATE TABLE IF NOT EXISTS Blocks (
    blocker VARCHAR(64) NOT NULL,
    blocked VARCHAR(64) NOT NULL,

    PRIMARY KEY (blocker, blocked)
);


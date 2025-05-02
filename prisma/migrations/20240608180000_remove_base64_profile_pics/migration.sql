-- Migration: Remove base64 profilePic values from User table

UPDATE "User"
SET "profilePic" = NULL
WHERE "profilePic" IS NOT NULL
  AND "profilePic" LIKE 'data:image%'; 
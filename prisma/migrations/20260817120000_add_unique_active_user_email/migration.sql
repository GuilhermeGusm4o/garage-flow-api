DROP INDEX IF EXISTS "users_email_key";

CREATE UNIQUE INDEX "users_email_active_unique"
ON "users" ("email")
WHERE "deleted_at" IS NULL;

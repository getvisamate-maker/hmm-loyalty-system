ALTER TABLE "cafe_secrets" ADD COLUMN "secret_key" text DEFAULT (gen_random_uuid()::text);

import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations/CLI can deadlock through a transaction-mode pooler (e.g. Neon's
// pooled connection uses PgBouncer). Prefer the direct/unpooled URL for
// `prisma migrate`, falling back to DATABASE_URL when no unpooled URL exists.
const migrationUrl =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error("DATABASE_URL (hoặc DATABASE_URL_UNPOOLED) chưa được cấu hình");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: migrationUrl,
  },
});

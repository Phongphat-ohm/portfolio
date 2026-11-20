const { spawn } = require("node:child_process");

// Do not rename/edit .env. Explicit blanks prevent Next.js from loading local
// credentials over the environment inherited by this isolated regression build.
const env = { ...process.env, NODE_ENV: "production" };
for (const name of [
  "DATABASE_URL", "DIRECT_URL", "AUTH_SECRET", "JWT_SECRET", "ADMIN_USERNAME",
  "ADMIN_PASSWORD", "REDIS_URL", "SUPABASE_URL", "SUPABASE_SECRET_KEY",
]) env[name] = "";

console.log("Regression build: database, auth, Redis and Storage credentials are blank.");
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "build"], {
  env, stdio: "inherit",
});
child.on("error", () => { console.error("Could not start regression build."); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });

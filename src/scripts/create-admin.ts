// Administrative provisioning uses the migration connection, never the runtime role.
export {};
if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL;
const { prisma } = await import("@/lib/prisma");
const { hashPassword } = await import("@/lib/auth");

const [, , username, password, email] = process.argv;

if (!username || !password) {
  console.error("Usage: bun run admin:create <username> <password> [email]");
  process.exit(1);
}

await prisma.adminUser.upsert({
  where: { username },
  create: {
    username,
    email: email || null,
    passwordHash: hashPassword(password),
  },
  update: {
    email: email || null,
    passwordHash: hashPassword(password),
  },
});

console.log(`Admin user "${username}" is ready.`);

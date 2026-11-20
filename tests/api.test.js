import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest } from "next/server";

const state = {};
const events = [];
const publicFile = { id: "file-1", filename: "ใบรับรอง.pdf", url: "/api/files/file-1", mimeType: "application/pdf", size: 16 };
const db = {
  uploadedFile: {
    findUnique: mock(async () => state.file),
    create: mock(async ({ data }) => { events.push("metadata"); if (state.dbFailure) throw Error("db unavailable"); return { ...publicFile, id: data.id, url: data.url, mimeType: data.mimeType }; }),
  },
  project: { findFirst: mock(async ({ where }) => { state.projectQuery = where; return state.project; }), findMany: mock(async (query) => { state.listQuery = query; return []; }) },
  certificate: { findFirst: mock(async () => state.certificate) },
  storageCleanupJob: {
    create: mock(async () => { events.push("intent"); if (state.intentFailure) throw Error("db unavailable"); return { id: "intent-1" }; }),
    delete: mock(async () => { events.push("intent-delete"); }),
  },
  $transaction: mock(async (callback) => callback(db)),
};
mock.module("../src/lib/prisma", () => ({ prisma: db }));
mock.module("../src/lib/storage", () => ({
  storageBucket: () => ({ upload: async () => { events.push("upload"); return { error: state.storageFailure ? Error("storage unavailable") : null }; } }),
  downloadStorageObject: async () => { events.push("download"); if (state.storageFailure) throw Error("storage unavailable"); return { body: new Blob(["%PDF-1.7 content"]).stream() }; },
}));

const { createSessionToken, readSessionToken, hashPassword, verifyPassword } = await import("../src/lib/auth");
const { GET } = await import("../src/app/api/files/[id]/route");
const { POST } = await import("../src/app/api/uploads/route");
const { GET: listProjects, POST: createProject } = await import("../src/app/api/projects/route");
const { POST: login } = await import("../src/app/api/auth/login/route");
const { proxy } = await import("../src/proxy");
const { fileResponseHeaders, detectFileType, MAX_UPLOAD_BYTES } = await import("../src/lib/file-policy");
const context = { params: Promise.resolve({ id: "file-1" }) };
function request(url, { role, method = "GET", body } = {}) {
  const headers = {};
  if (role) headers.cookie = `portfolio_session=${createSessionToken({ sub: "admin-1", username: "admin", role })}`;
  return new NextRequest(`http://localhost${url}`, { method, headers, body });
}
function upload(bytes = "%PDF-1.7 content", mime = "application/pdf", role = "admin") {
  const form = new FormData();
  form.set("file", new File([bytes], mime === "image/png" ? "test.png" : mime === "image/svg+xml" ? "test.svg" : "test.pdf", { type: mime }));
  return request("/api/uploads", { method: "POST", body: form, role });
}
beforeEach(() => {
  for (const key of Object.keys(state)) delete state[key];
  events.length = 0;
  state.file = { ...publicFile, key: "migrated/file-1/document.pdf", provider: "supabase" };
  process.env.AUTH_SECRET = "test-secret-which-is-long-enough-for-production";
  delete process.env.MAINTENANCE_READ_ONLY;
});
afterEach(() => { delete process.env.MAINTENANCE_READ_ONLY; });

describe("private file delivery", () => {
  test("unattached/draft files are hidden and never fetched from Storage", async () => {
    expect((await GET(request("/api/files/file-1"), context)).status).toBe(404);
    expect(events).not.toContain("download");
    expect(state.projectQuery).toEqual({ published: true, OR: [{ fileId: "file-1" }, { imageUrl: "/api/files/file-1" }] });
  });
  test("a published reference permits reading; unpublishing revokes the next request", async () => {
    state.project = { id: "published-project" };
    const response = await GET(request("/api/files/file-1"), context);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("%PDF");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    state.project = null;
    expect((await GET(request("/api/files/file-1"), context)).status).toBe(404);
  });
  test("a shared file stays public while any published certificate references it", async () => {
    state.certificate = { id: "published-certificate" };
    expect((await GET(request("/api/files/file-1"), context)).status).toBe(200);
  });
  test("admin can read drafts, another role cannot", async () => {
    expect((await GET(request("/api/files/file-1", { role: "admin" }), context)).status).toBe(200);
    expect((await GET(request("/api/files/file-1", { role: "editor" }), context)).status).toBe(404);
  });
  test("missing object, incomplete migration and Storage failure are explicit", async () => {
    state.file = null;
    expect((await GET(request("/api/files/file-1", { role: "admin" }), context)).status).toBe(404);
    state.file = { ...publicFile, provider: "sftpgo", key: "/old" };
    expect((await GET(request("/api/files/file-1", { role: "admin" }), context)).status).toBe(503);
    state.file.provider = "supabase";
    state.storageFailure = true;
    expect((await GET(request("/api/files/file-1", { role: "admin" }), context)).status).toBe(502);
  });
  test("download headers support Unicode, prevent injection and force legacy HTML to download", () => {
    const headers = fileResponseHeaders({ filename: 'ใบรับรอง\r\n".pdf', mimeType: "application/pdf" }, true);
    expect(headers["Content-Disposition"]).toStartWith("attachment;");
    expect(headers["Content-Disposition"]).not.toContain("\r");
    expect(headers["Content-Disposition"]).toContain("filename*=UTF-8''");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(fileResponseHeaders({ filename: "x.html", mimeType: "text/html" }, false)["Content-Disposition"]).toStartWith("attachment;");
  });
});

describe("uploads and maintenance", () => {
  test("standalone source guard freezes writes while keeping reads and logout", () => {
    process.env.MAINTENANCE_READ_ONLY = "true";
    expect(proxy(request("/api/uploads", { method: "POST" })).status).toBe(503);
    expect(proxy(request("/api/projects", { method: "DELETE" })).status).toBe(503);
    expect(proxy(request("/api/projects")).headers.get("x-middleware-next")).toBe("1");
    expect(proxy(request("/api/auth/logout", { method: "POST" })).headers.get("x-middleware-next")).toBe("1");
  });
  test("only admins can upload", async () => {
    expect((await POST(upload("%PDF-1.7", "application/pdf", null))).status).toBe(401);
    expect((await POST(upload("%PDF-1.7", "application/pdf", "editor"))).status).toBe(401);
    expect(events).toEqual([]);
  });
  test("valid upload records an intent before Storage and removes it transactionally", async () => {
    const response = await POST(upload());
    expect(response.status).toBe(201);
    expect(events).toEqual(["intent", "upload", "metadata", "intent-delete"]);
    const { file } = await response.json();
    expect(file.mimeType).toBe("application/pdf");
    expect(file).not.toHaveProperty("key");
    expect(file).not.toHaveProperty("provider");
  });
  test("spoofed MIME and SVG are rejected before upload", async () => {
    expect((await POST(upload("%PDF-1.7", "image/png"))).status).toBe(415);
    expect((await POST(upload("<svg/>", "image/svg+xml"))).status).toBe(415);
    expect(events).toEqual([]);
  });
  test("oversized and chunked requests are bounded", async () => {
    expect((await POST(upload(new Uint8Array(MAX_UPLOAD_BYTES + 1)))).status).toBe(413);
    expect(events).toEqual([]);
  });
  test("DB preparation failure never uploads; failed DB commit leaves durable cleanup intent", async () => {
    state.intentFailure = true;
    expect((await POST(upload())).status).toBe(503);
    expect(events).toEqual(["intent"]);
    events.length = 0;
    state.intentFailure = false;
    state.dbFailure = true;
    expect((await POST(upload())).status).toBe(502);
    expect(events).toEqual(["intent", "upload", "metadata"]);
  });
  test("Storage failure keeps the cleanup intent", async () => {
    state.storageFailure = true;
    expect((await POST(upload())).status).toBe(502);
    expect(events).toEqual(["intent", "upload"]);
  });
  test("maintenance blocks login, uploads and CRUD but keeps reads", async () => {
    process.env.MAINTENANCE_READ_ONLY = "true";
    expect((await POST(upload())).status).toBe(503);
    expect((await createProject(request("/api/projects", { method: "POST" }))).status).toBe(503);
    expect((await login(new Request("http://localhost/api/auth/login", { method: "POST" }))).status).toBe(503);
    expect((await listProjects(request("/api/projects"))).status).toBe(200);
  });
  test("public lists select safe file fields and ignore all=true without admin", async () => {
    await listProjects(request("/api/projects?all=true", { role: "editor" }));
    expect(state.listQuery.where).toEqual({ published: true });
    expect(state.listQuery.include.file.select).not.toHaveProperty("key");
    await listProjects(request("/api/projects?all=true", { role: "admin" }));
    expect(state.listQuery.where).toBeUndefined();
  });
});

describe("compatible sessions and password hashes", () => {
  test("existing password algorithm round trips and rejects wrong password", () => {
    const hash = hashPassword("original-password");
    expect(verifyPassword("original-password", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
    expect(verifyPassword("wrong", "pbkdf2_sha256$120000$salt$x")).toBe(false);
  });
  test("tampered, expired, malformed and non-ASCII signatures do not authenticate", () => {
    const token = createSessionToken({ sub: "admin-1", username: "admin", role: "admin" });
    expect(readSessionToken(token)?.username).toBe("admin");
    expect(readSessionToken(token + ".extra")).toBeNull();
    expect(readSessionToken(token.split(".")[0] + "." + "é".repeat(43))).toBeNull();
    expect(readSessionToken("bad.token")).toBeNull();
    const now = Date.now;
    Date.now = () => now() + 8 * 86400_000;
    try { expect(readSessionToken(token)).toBeNull(); } finally { Date.now = now; }
  });
  test("all supported formats have recognizable signatures", () => {
    for (const [bytes, expected] of [[new Uint8Array([255,216,255]), "image/jpeg"], [new Uint8Array([137,80,78,71,13,10,26,10]), "image/png"], [new TextEncoder().encode("GIF89a"), "image/gif"], [new TextEncoder().encode("RIFF0000WEBP"), "image/webp"]]) expect(detectFileType(bytes)).toBe(expected);
  });
});

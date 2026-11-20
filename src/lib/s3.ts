import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function env(name: string): string | undefined {
  const value = process.env[name];
  if (value && value.trim()) return value.trim();
  return undefined;
}

function config(name: string): { endpoint: string; port: string; useSsl: boolean; region: string; accessKeyId: string; secretAccessKey: string; bucket: string; publicUrl: string; forcePathStyle: boolean } | null {
  const rawEndpoint = env(name + "_ENDPOINT");
  const port = env(name + "_PORT") ?? "";
  const accessKeyId = env(name + "_ACCESS_KEY_ID");
  const secretAccessKey = env(name + "_SECRET_ACCESS_KEY");
  const bucket = env(name + "_BUCKET");
  const publicUrl = env(name + "_PUBLIC_URL");
  if (!rawEndpoint || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) return null;

  const explicitProtocol =
    /^https:\/\//i.test(rawEndpoint) ? "https" : /^http:\/\//i.test(rawEndpoint) ? "http" : null;
  const envUseSsl = (env(name + "_USE_SSL") ?? "true") === "true";
  const useSsl = explicitProtocol ?? (envUseSsl ? "https" : "http");

  const base = explicitProtocol ? rawEndpoint : `${useSsl}://${rawEndpoint}`;
  const url = new URL(base);
  if (port && port !== "443" && port !== "80") {
    url.port = port;
  } else if (url.port && (url.port === "443" || url.port === "80")) {
    url.port = "";
  }
  const endpoint = url.toString().replace(/\/+$/, "");

  return {
    endpoint,
    port: port ?? "",
    useSsl: url.protocol === "https:",
    region: env(name + "_REGION") ?? "us-east-1",
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl: publicUrl.replace(/\/+$/, ""),
    forcePathStyle: (env(name + "_FORCE_PATH_STYLE") ?? "true") === "true",
  };
}

export const S3_CONFIG = config("S3") ?? config("MINIO");

function numEnv(name: string, fallback: number): number {
  const raw = env(name);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const SMALL_UPLOAD_LIMIT = numEnv("S3_SMALL_UPLOAD_LIMIT", 5 * 1024 * 1024);
export const MAX_UPLOAD_SIZE = numEnv("S3_MAX_UPLOAD_SIZE", 50 * 1024 * 1024);
export const PRESIGN_EXPIRES = numEnv("S3_PRESIGN_EXPIRES", 15 * 60);

export function isS3Configured(): boolean {
  return S3_CONFIG !== null;
}

export function assertS3Config() {
  if (!S3_CONFIG) {
    throw new Error(
      "S3 is not configured (set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, S3_PUBLIC_URL)"
    );
  }
  return S3_CONFIG;
}

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (client) return client;
  const cfg = assertS3Config();
  client = new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
    forcePathStyle: cfg.forcePathStyle,
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
  return client;
}

export function getBucket(): string {
  return assertS3Config().bucket;
}

export function getPublicUrl(key: string): string {
  const cfg = assertS3Config();
  return `${cfg.publicUrl}/${cfg.bucket}/${key}`;
}

export function extractKeyFromUrl(url: string): string | null {
  if (!S3_CONFIG) return null;
  try {
    const parsed = new URL(url);
    const base = new URL(S3_CONFIG.publicUrl);
    if (parsed.origin !== base.origin) return null;
    const prefix = `/${S3_CONFIG.bucket}/`;
    const pathname = parsed.pathname;
    if (!pathname.startsWith(prefix)) return null;
    const key = decodeURIComponent(pathname.slice(prefix.length));
    return key || null;
  } catch {
    return null;
  }
}

export function isOwnS3Url(url: string): boolean {
  return extractKeyFromUrl(url) !== null;
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await getS3Client().send(command);
}

export async function deleteObject(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  await getS3Client().send(command);
}

export async function presignedPutUrl(
  key: string,
  contentType: string,
  expiresIn = PRESIGN_EXPIRES
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn });
}

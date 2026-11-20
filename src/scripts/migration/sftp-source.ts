import path from "node:path";
import { required } from "./common";

export async function sftpRequest(endpoint: string, remotePath?: string) {
  const base = required("SFTPGO_BASE_URL").replace(/\/+$/, "");
  const auth = Buffer.from(`${required("SFTPGO_USERNAME")}:${required("SFTPGO_PASSWORD")}`).toString("base64");
  const tokenResponse = await fetch(`${base}/api/v2/user/token`, { headers: { Authorization: `Basic ${auth}` }, signal: AbortSignal.timeout(30_000) });
  if (!tokenResponse.ok) throw new Error(`SFTPGo authentication failed (${tokenResponse.status}).`);
  const token = (await tokenResponse.json()) as { access_token: string };
  if (!token.access_token) throw new Error("SFTPGo token missing.");
  const response = await fetch(`${base}/api/v2/user/${endpoint}${remotePath !== undefined ? `?path=${encodeURIComponent(remotePath)}` : ""}`, {
    headers: { Authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(600_000),
  });
  if (!response.ok) throw new Error(`SFTPGo ${endpoint} failed (${response.status}).`);
  return response;
}

export async function listSourceFiles(directory: string): Promise<{ key: string; size: number }[]> {
  const entries = await (await sftpRequest("dirs", directory)).json() as { name: string; size?: number; mode: number }[];
  if (!Array.isArray(entries)) throw new Error("SFTPGo directory response is not an array.");
  const files: { key: string; size: number }[] = [];
  for (const item of entries) {
    if (item.name === "." || item.name === ".." || /[\\/]/.test(item.name)) throw new Error("SFTPGo unsafe directory entry.");
    const key = path.posix.join(directory, item.name);
    if ((item.mode & 2147483648) !== 0) files.push(...await listSourceFiles(key));
    else if ((item.mode & 2401763328) === 0 && Number.isSafeInteger(item.size) && item.size! >= 0) files.push({ key, size: item.size! });
    else throw new Error("Unsupported SFTPGo symlink or special file; inventory must be reconciled explicitly.");
  }
  return files;
}

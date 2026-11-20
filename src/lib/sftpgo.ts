type SftpGoUploadResult = {
  key: string;
};

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function createRemoteFile(dir: string, filename: string) {
  const safeDir = dir.endsWith("/") ? dir.slice(0, -1) : dir;
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeFilename}`;

  return {
    dir: safeDir || "/",
    name: uniqueName,
    path: `${safeDir || ""}/${uniqueName}`,
  };
}

function getSftpGoConfig() {
  const baseUrl = process.env.SFTPGO_BASE_URL;
  const username = process.env.SFTPGO_USERNAME;
  const password = process.env.SFTPGO_PASSWORD;

  if (!baseUrl || !username || !password) {
    throw new Error("SFTPGo environment variables are incomplete.");
  }

  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    username,
    password,
  };
}

async function getUserToken(baseUrl: string, username: string, password: string) {
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");
  const response = await fetch(`${baseUrl}/api/v2/user/token`, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    throw new Error(`SFTPGo token request failed with ${response.status}.`);
  }

  const data = (await response.json()) as { access_token?: string };

  if (!data.access_token) {
    throw new Error("SFTPGo token response did not include access_token.");
  }

  return data.access_token;
}

export async function uploadToSftpGo(file: File): Promise<SftpGoUploadResult> {
  const { baseUrl, username, password } = getSftpGoConfig();
  const remoteDir = process.env.SFTPGO_REMOTE_DIR || "/portfolio";
  const remoteFile = createRemoteFile(remoteDir, file.name);
  const token = await getUserToken(baseUrl, username, password);
  const formData = new FormData();

  formData.append("filenames", file, remoteFile.name);

  const uploadUrl = `${baseUrl}/api/v2/user/files?path=${encodeURIComponent(remoteFile.dir)}`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`SFTPGo upload failed with ${response.status}.`);
  }

  return {
    key: remoteFile.path,
  };
}

export async function downloadFromSftpGo(remotePath: string) {
  const { baseUrl, username, password } = getSftpGoConfig();
  const token = await getUserToken(baseUrl, username, password);
  const downloadUrl = `${baseUrl}/api/v2/user/files?path=${encodeURIComponent(remotePath)}`;

  const response = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok || !response.body) {
    throw new Error(`SFTPGo download failed with ${response.status}.`);
  }

  return response;
}

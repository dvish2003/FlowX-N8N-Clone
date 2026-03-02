import { google } from "googleapis";

export class GoogleDriveService {
  private auth: InstanceType<typeof google.auth.OAuth2>;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret) {
      throw new Error("Missing Google OAuth client configuration.");
    }
    if (!refreshToken) {
      throw new Error("GOOGLE_REFRESH_TOKEN is missing. Reconnect Google Drive with offline access.");
    }

    this.auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    this.auth.setCredentials({ refresh_token: refreshToken });
  }

  private async authHeaders() {
    const headers = await this.auth.getRequestHeaders();
    const authorization =
      (typeof (headers as Headers).get === "function"
        ? (headers as Headers).get("authorization") ||
          (headers as Headers).get("Authorization")
        : (headers as unknown as Record<string, string>)?.authorization ||
          (headers as unknown as Record<string, string>)?.Authorization);

    if (!authorization) {
      throw new Error("Failed to create OAuth authorization header for Drive API.");
    }

    return { Authorization: authorization };
  }

  async startWatch() {
    const pageToken = await this.getStartPageToken();

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/changes/watch?pageToken=${pageToken}`,
      {
        method: "POST",
        headers: {
          ...(await this.authHeaders()),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: `channel-${Date.now()}`,
          type: "web_hook",
          address: process.env.WEB_HOOK_URL + "/api/webhooks/drive",
        }),
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to start watch: ${await res.text()}`);
    }
    return await res.json();
  }

  async getStartPageToken() {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/changes/startPageToken`,
      { headers: await this.authHeaders() }
    );

    if (!res.ok) {
      throw new Error(`Failed to get start page token: ${await res.text()}`);
    }
    const data = await res.json();
    return data.startPageToken;
  }

  async getFileInfo(fileId: string) {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,modifiedTime,owners`,
      { headers: await this.authHeaders() }
    );

    if (!res.ok) {
      throw new Error(`Failed to get file info: ${await res.text()}`);
    }

    return {
      type: "drive_file_info",
      data: await res.json(),
    };
  }

  async downloadFile(fileId: string) {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: await this.authHeaders() }
    );

    if (!res.ok) {
      throw new Error(`Failed to download file: ${await res.text()}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      type: "drive_file_downloaded",
      data: buffer.toString("base64"),
    };
  }

  async getChanges(pageToken: string) {
    const url = `https://www.googleapis.com/drive/v3/changes?pageToken=${pageToken}&includeRemoved=true&fields=changes(file(id,name,trashed),fileId),newStartPageToken`;
     const res = await fetch(
        url,
        { headers: await this.authHeaders() }
      );

    if (!res.ok) {
      throw new Error(`Failed to get changes: ${await res.text()}`);
    }
    
    return await res.json();
  }
}

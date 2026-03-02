import { WebClient } from "@slack/web-api";

export class SlackService {
  private client: WebClient;

  constructor(accessToken: string) {
    if (!accessToken) throw new Error("Missing Slack access token");
    this.client = new WebClient(accessToken);
  }

  async sendMessage({ channel, text }: { channel: string; text: string }) {
    const res = await this.client.chat.postMessage({
      channel,
      text,
    });
    return {
      type: "slack_message_sent",
      data: res,
    } as const;
  }

  async uploadFile({
    channel,
    fileBase64,
    filename,
  }: {
    channel: string;
    fileBase64: string;
    filename: string;
  }) {
    const buffer = Buffer.from(fileBase64, "base64");

    const res = await this.client.files.upload({
      channels: channel,
      file: buffer,
      filename,
    });
    return {
      type: "slack_file_uploaded",
      data: res,
    } as const;
  }

  async listChenel(limit=20){
    const res = await this.client.conversations.list({limit});
    return {
      type: "slack_channel_listed",
      data: res.channels ?? [],
    } as const;
  }

  async deleteMessage({ channel, ts }: { channel: string; ts: string }) {
    const res = await this.client.chat.delete({
      channel,
      ts,
    });
    return {
      type: "slack_message_deleted",
      data: res,
    } as const;
  }



}

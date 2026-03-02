import { google } from "googleapis";
import { gmail_v1 } from "googleapis";

export type GmailEventType =
  | "gmail_message_sent"
  | "gmail_messages_listed"
  | "gmail_message_read"
  | "gmail_message_deleted";

export class GoogleGmailService {
  private gmail: gmail_v1.Gmail;
  private auth: InstanceType<typeof google.auth.OAuth2>;
  static node_name = "gmailNode";
  constructor(accessToken: string, refreshToken: string) {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.auth.setCredentials({
      access_token: accessToken || process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: refreshToken || process.env.GOOGLE_REFRESH_TOKEN,
    });
    this.gmail = google.gmail({ version: "v1", auth: this.auth });
  }

  async startWatch() {
    const topicName = process.env.GMAIL_PUBSUB_TOPIC as string;

    if (!topicName) {
      throw new Error(
        "GMAIL_PUBSUB_TOPIC is not defined in environment variables."
      );
    }
    const res = await this.gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName: "projects/n8n-clone-483510/topics/n8n-clone-483510",
        labelIds: ["INBOX", "SENT"],
        labelFilterAction: "include",
      },
    });
    return res.data;
  }

  async stopWatch() {
    const res = await this.gmail.users.stop({
      userId: "me",
    });
    return res.data;
  }

  async sendEmail({
    to,
    subject,
    message,
  }: {
    to: string;
    subject: string;
    message: string;
  }) {
    const rawMessage = this.createRawEmail(to, subject, message);

    const res = await this.gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage,
      },
    });
    return {
      type: "gmail_message_sent" as GmailEventType,
      data: res.data,
    } as const;
  }

  async replyTo({
    threadId,
    messageId,
    to,
    subject,
    message,
  }: {
    threadId: string;
    messageId: string;
    to: string;
    subject: string;
    message: string;
  }) {
    const raw = this.createRawEmail(to, subject, message, messageId);

    const res = await this.gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: raw,
        threadId: threadId,
      },
    });
    return {
      type: "gmail_message_sent" as GmailEventType,
      data: res.data,
    } as const;
  }

  private createRawEmail(
    to: string,
    subject: string,
    message: string,
    messageId?: string
  ) {
    const lines = [
      `To: ${to}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "MIME-Version: 1.0",
      `Subject: Re: ${subject}`,
      `In-Reply-To: ${messageId}`,
      "References: " + (messageId ? messageId : ""),
      "",
      message,
    ];
    return Buffer.from(lines.join("\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async listHistory(startHistoryId: string){
    const allHistory: unknown[] = [];
    let pageToken: string | undefined ;
    do{
      const res = await this.gmail.users.history.list({
        userId: "me",
        startHistoryId,
        pageToken: pageToken,
        historyTypes: ["messageAdded","messageDeleted"],
      });
      if(res.data.history){
        allHistory.push(...res.data.history);
      }
      pageToken = res.data.nextPageToken || undefined;
    }while(pageToken);
    return allHistory;
  }
  async getMessage(messageId: string){
    const res = await this.gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });
    const payload = res.data.payload;

    const getHeader = (name: string) => {
      return payload?.headers?.find((h: gmail_v1.Schema$MessagePartHeader) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
    }

    const getBody = (payload: gmail_v1.Schema$MessagePart | undefined): string => {
      if(!payload) return "";

      if(payload.body?.data){
        return Buffer.from(payload.body.data, 'base64').toString('utf-8'); 
      }

      if(payload.parts?.length){
        for(const part of payload.parts){
          if(part.mimeType === 'text/plain' || part.mimeType === 'text/html'){
            return Buffer.from(part.body?.data || '', 'base64').toString('utf-8'); 
          }
        }
      }
      return "";
    }

    return {
      type: "gmail_message_read" as GmailEventType,
      data: {
        id: res.data.id,
        threadId: res.data.threadId,
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        body: getBody(payload),
      },
    } as const;
  }

  async listMessages(maxResults: number = 10, query?: string) {
    const allMessages: unknown[] = [];
    let pageToken: string | undefined;
    do {
      const res = await this.gmail.users.messages.list({
        userId: "me",
        maxResults,
        q: query,
        pageToken: pageToken,
      });
      if (res.data.messages) {
        allMessages.push(...res.data.messages);
      }
      pageToken = res.data.nextPageToken || undefined;
    } while (pageToken);
    return {
      type: "gmail_messages_listed" as GmailEventType,
      data: allMessages,
    } as const;
  }
}



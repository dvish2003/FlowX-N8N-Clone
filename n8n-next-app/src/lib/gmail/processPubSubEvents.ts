import { GoogleGmailService } from "./gmailService";

let lastHistoryId: string | undefined;

export const GmailHistoryStore = {
  get() {
    return lastHistoryId;
  },
  set(id: string) {
    lastHistoryId = id;
  },
};

export async function processPubSubEvents(pubsubData: {
  emailAddress?: string;
  historyId: string;
}) {
  const gmail = new GoogleGmailService(
    process.env.GOOGLE_ACCESS_TOKEN || "",
    process.env.GOOGLE_REFRESH_TOKEN || ""
  );

  const newHistoryId = pubsubData.historyId;

  console.log("📬 pubsub event payload:", pubsubData);

  if (!newHistoryId) {
    return {
      received: [],
      sent: [],
    };
  }
  const previousHistoryId = GmailHistoryStore.get();

  if (!previousHistoryId) {
    const baseline = (Number(newHistoryId) - 1).toString();
    GmailHistoryStore.set(baseline);
    return {
      received: [],
      sent: [],
    };
  }

  if (Number(newHistoryId) <= Number(previousHistoryId)) {
    console.log("⏭️ Old or duplicate historyId, skipping processing.");
    return {
      received: [],
      sent: [],
    };
  }
  const startId = previousHistoryId;

  const history = await gmail.listHistory(startId);

  if (!Array.isArray(history) || history.length === 0){
    GmailHistoryStore.set((Number(newHistoryId)-1).toString());
    return {
      received: [],
      sent: [],
    };
  }
  const messageAdded = history.flatMap((h: any) => h.messagesAdded ?? []);

  const receivedMessageIds = messageAdded
    .filter((m) => m.message.labelIds?.includes("INBOX"))
    .map((m) => m.message.id);

  const sentMessageIds = messageAdded
    .filter((m) => m.message.labelIds?.includes("SENT"))
    .map((m) => m.message.id);

  GmailHistoryStore.set(newHistoryId);

  console.log("📥 gmail history received ids:", receivedMessageIds);
  console.log("📤 gmail history sent ids:", sentMessageIds);

  return {
    received: receivedMessageIds,
    sent: sentMessageIds,
  };
}

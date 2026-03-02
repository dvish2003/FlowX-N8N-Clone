
import axios from 'axios';

export async function executeWhatsAppNode(
  nodeData: any,
  inputData: any,
  logs: string[]
): Promise<any> {
    const { accessToken, phoneNumberId, recipientPhone, message } = nodeData;

    if (!accessToken || !phoneNumberId || !recipientPhone) {
        throw new Error("WhatsApp configuration missing (Token, ID, or Recipient).");
    }

    logs.push(`Executing WhatsApp Node`);

    // Dynamic message parsing
    let finalMessage = message || '';
    const variableRegex = /{{(.*?)}}/g;
    let match;
    
    while ((match = variableRegex.exec(message)) !== null) {
        const path = match[1].trim();
        const value = getNestedValue(inputData, path);
        if (value !== undefined) {
            finalMessage = finalMessage.replace(match[0], String(value));
        }
    }

    logs.push(`Sending message to ${recipientPhone}`);

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",
                to: recipientPhone,
                type: "text",
                text: {
                    body: finalMessage
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        logs.push(`✓ WhatsApp message sent: ${response.data.messages?.[0]?.id || 'Success'}`);
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        logs.push(`✗ WhatsApp failed: ${errorMessage}`);
        throw new Error(`WhatsApp API Error: ${errorMessage}`);
    }
}

function getNestedValue(obj: any, path: string) {
    if (!path || !obj) return undefined;
    if (path === '$root') return obj;
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current === null || current === undefined) return undefined;
        current = current[key];
    }
    return current;
}

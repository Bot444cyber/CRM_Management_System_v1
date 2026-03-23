import dotenv from 'dotenv';

dotenv.config();

// Configuration for Green API
const WHATSAPP_API_URL = (process.env.WHATSAPP_API_URL || 'https://api.green-api.com').replace(/\/$/, '');
const WHATSAPP_INSTANCE_ID = process.env.WHATSAPP_INSTANCE_ID || '1234567890';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'token123456789';

// This is an interface for the generic responses you might get
interface WhatsAppResponse {
    sent: boolean;
    message?: string;
    id?: string;
}

let cachedContacts: Record<string, { contacts: any[], lastFetch: number }> = {};
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches available WhatsApp groups.
 * Note: Many simple APIs don't natively list groups easily without a specific endpoint. 
 * If your API doesn't support fetching groups, you may need to define them in DB or .env,
 * or use a webhook to capture Group IDs when you are added to them.
 */
export const fetchGroups = async (instanceId: string, token: string): Promise<any[]> => {
    try {
        const cacheKey = `${instanceId}`;
        const cache = cachedContacts[cacheKey];

        if (cache && (Date.now() - cache.lastFetch < CACHE_DURATION_MS)) {
            console.log("Returning WhatsApp contacts from local cache to avoid rate limits.");
            return cache.contacts;
        }

        // Green API format: /waInstance{id}/getContacts/{token}
        const url = `${WHATSAPP_API_URL}/waInstance${instanceId}/getContacts/${token}`;

        console.log("Fetching WhatsApp contacts from Green API:", url);

        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            // Filter only groups & contacts
            if (Array.isArray(data)) {
                const contactsList = data
                    .filter(contact => contact.id && (contact.id.endsWith('@g.us') || contact.id.endsWith('@c.us')))
                    .map(contact => ({
                        id: contact.id,
                        name: contact.name || contact.id,
                        type: contact.id.endsWith('@g.us') ? 'group' : 'contact'
                    }));

                cachedContacts[cacheKey] = { contacts: contactsList, lastFetch: Date.now() };
                return contactsList;
            }
            return [];
        } else {
            throw new Error(`Green API error: ${response.status} ${response.statusText}`);
        }
    } catch (error: any) {
        console.log(`⚠️ WhatsApp Fetch Warning: ${error.message}`);

        const cacheKey = `${instanceId}`;
        const cache = cachedContacts[cacheKey];
        // If rate limited but we have an old cache, return the old cache instead of an empty array
        if (cache) {
            console.log("Returning expired local cache due to API fetch failure.");
            return cache.contacts;
        }

        return [];
    }
};

/**
 * Sends a WhatsApp message (with optional image) to a specific group or contact.
 */
export const sendWhatsAppMessage = async (to: string, message: string, instanceId: string, token: string, imageUrl?: string): Promise<WhatsAppResponse> => {
    try {
        let endpoint = 'sendMessage';
        let payload: any = {
            chatId: to,
            message: message
        };

        const isValidUrl = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));
        const isBase64 = imageUrl && imageUrl.startsWith('data:image/');

        if (isValidUrl) {
            endpoint = 'sendFileByUrl';
            payload = {
                chatId: to,
                urlFile: imageUrl,
                fileName: "product_image.jpg",
                caption: message
            };
        } else if (isBase64) {
            endpoint = 'sendFileByUpload';
            // Convert base64 to buffer to blob
            const [mimeInfo, base64Data] = imageUrl.split(',');
            const mime = mimeInfo.replace('data:', '').split(';')[0];
            const buffer = Buffer.from(base64Data, 'base64');
            const blob = new Blob([buffer], { type: mime });

            const formData = new FormData();
            formData.append('chatId', to);
            formData.append('caption', message);
            formData.append('file', blob, 'product_image.jpg');

            payload = formData;
        } else if (imageUrl) {
            console.warn(`[WhatsApp] Image URL is not a valid public link (${imageUrl.substring(0, 30)}...). Falling back to text-only message.`);
        }

        // Green API format: /waInstance{id}/{method}/{token}
        const url = `${WHATSAPP_API_URL}/waInstance${instanceId}/${endpoint}/${token}`;

        console.log(`[WhatsApp] Sending ${endpoint !== 'sendMessage' ? 'Image' : 'Text'} to ${to} via Green API`);

        const isFormData = payload instanceof FormData;

        const response = await fetch(url, {
            method: 'POST',
            headers: isFormData ? {} : {
                'Content-Type': 'application/json'
            },
            body: isFormData ? payload : JSON.stringify(payload)
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error(`Green API Error Body (${response.status}):`, errBody);
            throw new Error(`WhatsApp API responded with ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        return { sent: true, ...data };

    } catch (error: any) {
        console.error("Error sending WhatsApp message:", error);
        return { sent: false, message: error.message };
    }
};

export default {
    fetchGroups,
    sendWhatsAppMessage
};

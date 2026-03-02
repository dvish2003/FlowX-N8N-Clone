import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";



let syncToken: string | null = null;


export const CalenderSyncStore = {
    get() {
        return syncToken;
    },
    set(token: string) {
        syncToken = token;
    },
}

export class GoogleCalenderService {
    private calender;
    private auth;
    static node_name = "calenderNode";


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

        this.calender = google.calendar({ version: "v3", auth: this.auth });
    }


    async initializeSyncToken() {
        const res = await this.calender.events.list({
            calendarId: 'primary',
            singleEvents: true,
            showDeleted: true,
            timeMin: (new Date()).toISOString(),
        });
        return res.data.nextSyncToken;
    }

    async fecthChanges(syncToken: string){
        try {
            
        const res = await this.calender.events.list({
            calendarId: 'primary',
            singleEvents: true,
            showDeleted: true,
            syncToken,
        });
        return {
            events: res.data.items || [],
            nextSyncToken: res.data.nextSyncToken || null,
        }
        } catch (error: unknown) {
         const err = error as { code?: number };
         if(err.code === 410){
            return null
         }  
            throw error; 
        }
    }

    async getEvent(eventId: string){
        try {
            const res = await this.calender.events.get({
                calendarId:'primary',
                eventId,
            });
            return {
                type: 'calender_event_fetched',
                data: res.data,
            }
        } catch (error: unknown) {
            console.log("⚠️ Error fetching event:", error);
            return null;
            
        }
    }

    async watchCalendar(){
        const channelID = "calender-"+Date.now()+"-"+crypto.randomUUID();
        const res = await this.calender.events.watch({
            calendarId:'primary',
            requestBody:{
                id:channelID,
                type:'web_hook',
                address:process.env.WEB_HOOK_URL+'/api/webhooks/calender',
            }
        });
        return res.data;
    }

async listEvents(maxResults: number = 10, query?: string) {
        const res = await this.calender.events.list({
            calendarId: 'primary',
            maxResults,
            q: query,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return {
            type: 'calender_events_listed',
            data: res.data.items || [],
        }as const;
    }
    async updateEvent(eventId:string ,updates: Partial<calendar_v3.Schema$Event>){
        const res = await this.calender.events.patch({
            calendarId:'primary',
            eventId,
            requestBody:updates,
        });
        return {
            type: 'calender_event_updated',
            data: res.data,
        };
    }
}
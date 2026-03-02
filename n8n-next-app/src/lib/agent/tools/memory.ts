import path from 'path';
import fs from 'fs';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';


const ROOT = process.cwd();
const MEMORY_DIR = path.join(ROOT,'public', 'chat-history')

if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
}


const HISTORY_FILE = path.join(MEMORY_DIR, 'chat-history.json');

type MemoryMessage = {
    role: 'user' | 'ai';
    userId: string;
    content: string;
    noteId?: string;
};

export const writeMemoryTool = tool(
    async({message}) => {
        try {
            
let history: MemoryMessage[] = [];

        if (fs.existsSync(HISTORY_FILE)) {
        const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
        history = JSON.parse(data);
        }

        history.push(...message);

        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');

        return `Successfully wrote ${message.length} messages to memory.`;

        } catch (error) {
            console.error('Error writing to memory:', error);
            return 'Failed to write messages to memory.';
            
        }
    },{
        name: 'write_memory',
        description: 'Writes messages to the agent memory storage.',
        schema: z.object({
            message: z.array(
                z.object({
                    role: z.enum(['user','ai']),
                    userId:z.string(),
                    noteId: z.string().optional(),
                    content: z.string(),
                })
            ),
        }),
    }
);


export const readMemoryTool = tool(
    async({userId,noteId}) => {
        try {
            if (!fs.existsSync(HISTORY_FILE)) {
                return [];
            }

            const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
            const history: MemoryMessage[] = JSON.parse(data);

            const filtered = history.filter((msg) => {
                if (noteId) {
                    return msg.userId === userId && msg.noteId === noteId;
                }
                return msg.userId === userId;
            });

            return filtered;
        } catch (error) {
            console.error('Error reading from memory:', error);
            return [];
            
        }
    },
    {
        name: 'read_memory',
        description: 'Reads messages from the agent memory storage.',
        schema: z.object({
            userId: z.string(),
            noteId: z.string().optional(),
        }),
    }
)
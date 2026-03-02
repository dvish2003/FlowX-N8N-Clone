import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Dynamic MongoDB Connection Helper
async function getDynamicMongoClient(config: any) {
    if (!config || config.connectionType === 'none') return null;
    
    let uri = '';
    if (config.connectionType === 'string') {
        uri = config.connectionString;
    } else {
        const user = encodeURIComponent(config.user || '');
        const pass = encodeURIComponent(config.password || '');
        const host = config.connectionType === 'cluster' ? 'cluster0.mongodb.net' : 'localhost:27017';
        uri = user ? `mongodb+srv://${user}:${pass}@${host}/${config.database}?retryWrites=true&w=majority` : `mongodb://${host}/${config.database}`;
    }

    if (!uri) return null;

    try {
        // We use a separate connection for dynamic user DBs to avoid clashing with platform DB
        const conn = await mongoose.createConnection(uri).asPromise();
        return conn;
    } catch (err) {
        console.error('Dynamic Mongo Connection Error:', err);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { message, modelConfig, memoryConfig, agentConfig, contextFile } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 1. Prepare System Prompt from Agent Config
        const systemPrompt = `
            ${agentConfig?.instruction || 'You are a helpful assistant.'}
            ${agentConfig?.task ? `Your primary objective is: ${agentConfig.task}` : ''}
            ${contextFile ? `You have access to context from the following file: ${contextFile}` : ''}
        `.trim();

        // 2. Identify Model & API Key
        let modelId = modelConfig?.customModel || modelConfig?.model || 'gpt-4o-mini';
        let baseUrl = 'https://api.openai.com/v1';
        let apiKey = modelConfig?.apiKey || process.env.OPENAI_API_KEY;

        // Provider Logic
        if (modelId.includes('gemini')) {
             baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai'; 
             apiKey = modelConfig?.apiKey || process.env.GEMINI_API_KEY;
        } else if (modelId.includes('deepseek')) {
             baseUrl = 'https://api.deepseek.com';
             apiKey = modelConfig?.apiKey || process.env.DEEPSEEK_API_KEY;
        } else if (modelId.includes('mistral')) {
             baseUrl = 'https://api.mistral.ai/v1';
             apiKey = modelConfig?.apiKey || process.env.MISTRAL_API_KEY;
        } else if (modelId.includes('qwen')) {
             baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
             apiKey = modelConfig?.apiKey || process.env.DASHSCOPE_API_KEY;
        } else if (modelId.includes('llama') || modelId.includes('groq')) {
             baseUrl = 'https://api.groq.com/openai/v1';
             apiKey = modelConfig?.apiKey || process.env.GROQ_API_KEY;
             // Ensure robust model ID for Groq if simple 'llama' is passed
             if (modelId === 'llama3-70b-8192') modelId = 'llama3-70b-8192'; 
        }

        if (!apiKey) {
             return NextResponse.json({ 
                response: `⚠️ Missing API Key for model ${modelId}. Please configure it in the node settings.`,
                error: true 
            });
        }

        // 3. Handle Memory (MongoDB)
        let history: any[] = [];
        const userConn = await getDynamicMongoClient(memoryConfig);
        if (userConn && memoryConfig?.collection) {
            try {
                const collection = userConn.collection(memoryConfig.collection);
                // Load last 5 messages
                const rawHistory = await collection.find({}).sort({ timestamp: -1 }).limit(10).toArray();
                history = rawHistory.reverse().map((h: any) => ({
                    role: h.role,
                    content: h.content
                }));
            } catch (err) {
                console.warn('Memory Load Error:', err);
            }
        }

        // 4. Call AI Provider
        const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: modelId,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...history,
                    { role: 'user', content: message }
                ],
                temperature: Number(modelConfig?.temperature || 0.7),
                stream: false
            }),
        });

        if (!aiResponse.ok) {
            const errData = await aiResponse.json();
            return NextResponse.json({ 
                response: `⚠️ AI Provider Error: ${errData.error?.message || 'Check your API key and model selection.'}`,
                error: true 
            });
        }

        const data = await aiResponse.json();
        const responseText = data.choices[0]?.message?.content || 'No response Generated';

        // 5. Save to Memory if configured
        if (userConn && memoryConfig?.collection) {
            try {
                const collection = userConn.collection(memoryConfig.collection);
                await collection.insertMany([
                    { role: 'user', content: message, timestamp: new Date() },
                    { role: 'assistant', content: responseText, timestamp: new Date() }
                ]);
            } catch (err) {
                console.warn('Memory Save Error:', err);
            } finally {
                await userConn.close();
            }
        }

        return NextResponse.json({
            response: responseText,
            model: modelId,
            timestamp: Date.now()
        });

    } catch (error: any) {
        console.error('[Chat API] Critical Error:', error);
        return NextResponse.json(
            { error: 'System Failure', details: error.message },
            { status: 500 }
        );
    }
}

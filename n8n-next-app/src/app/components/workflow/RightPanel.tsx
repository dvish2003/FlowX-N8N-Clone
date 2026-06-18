"use client"

import React, { useCallback } from 'react'
import Image from 'next/image'
import { Input } from '@/app/components/ui/input'
import type { Node } from '@xyflow/react'
import { useDispatch, useSelector } from 'react-redux'
import { addNode, setShowToolsPanel, updateNodeData } from '@/stores/FlowSlice'
import { ConfigPanelSelector } from './config-panel/ConfigPanelSelector'
import type { RootState } from '@/stores/index'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Sparkles, Box, MessageSquare, List, Workflow, Search, Zap, Send } from 'lucide-react'

type Props = {
  node?: Node | null
}

type ChatMessage = {
	role: 'user' | 'system'
	text: string
	timestamp: number
}

type ToolItem = {
  name: string
  iconPath: string
  type: Node['type']
}

const aiModels = [
  { name: 'OpenAI', iconPath: '/icons/openai-icon.svg', type: 'modelNode' },
  { name: 'Google Gemini', iconPath: '/icons/gemini.png', type: 'modelNode' },
  { name: 'DeepSeek', iconPath: '/icons/deepseek-icon.svg', type: 'modelNode' },
  { name: 'Mistral AI', iconPath: '/icons/mistral-ai-icon.svg', type: 'modelNode' },
  { name: 'Qwen', iconPath: '/icons/qwen-icon.svg', type: 'modelNode' },
  { name: 'Groq', iconPath: '/icons/meta_nnmll6.webp', type: 'groqNode' },
]

const apps: ToolItem[] = [
  { name: 'Schedule Trigger', iconPath: '/icons/schedule.png', type: 'scheduleTriggerNode' },
  { name: 'Chat Trigger', iconPath: '/icons/chatbot.png', type: 'chatTriggerNode' },
  { name: 'Retriever', iconPath: '/icons/retriever.png', type: 'retrieverNode' },
  { name: 'Gmail', iconPath: '/icons/gmail.png', type: 'gmailNode' },
  { name: 'Drive', iconPath: '/icons/drive.png', type: 'driveNode' },
  { name: 'Calendar', iconPath: '/icons/calendar.png', type: 'calendarNode' },
  { name: 'Notion', iconPath: '/icons/notion.png', type: 'notionNode' },
  { name: 'Vector DB', iconPath: '/icons/db.png', type: 'vectordbNode' },
  { name: 'Slack', iconPath: '/icons/slack.png', type: 'slackNode' },
  { name: 'Embedding Model', iconPath: '/icons/embedding.png', type: 'embeddingModelNode' },
  { name: 'Discord', iconPath: '/icons/discord.png', type: 'discordNode' },
  { name: 'Http Request', iconPath: '/icons/http.png', type: 'httpNode' },
  { name: 'Send Data', iconPath: '/icons/send.png', type: 'sendDataNode' },
  { name: 'MongoDB', iconPath: '/icons/mongodb.png', type: 'mongoDBNode' },
  { name: 'Google Sheets', iconPath: '/icons/sheet.png', type: 'googleSheetNode' },
  { name: 'IF Condition', iconPath: '/icons/default.png', type: 'ifNode' },
  { name: 'Switch', iconPath: '/icons/default.png', type: 'switchNode' },
  { name: 'Delay/Wait', iconPath: '/icons/schedule.png', type: 'delayNode' },
  { name: 'Email (SMTP)', iconPath: '/icons/message.png', type: 'emailNode' },
  { name: 'Telegram', iconPath: '/icons/bot.png', type: 'telegramNode' },
  { name: 'WhatsApp', iconPath: '/icons/whatsapp.png', type: 'whatsAppNode' },
  { name: 'Webhook', iconPath: '/icons/http.png', type: 'webhookNode' },

  { name: 'Data Formatter', iconPath: '/icons/retriever.png', type: 'dataFormatterNode' },
  { name: 'Code', iconPath: '/icons/brain.png', type: 'codeNode' },
  { name: 'Loop', iconPath: '/icons/default.png', type: 'loopNode' },
  { name: 'Error Handler', iconPath: '/icons/db.png', type: 'errorHandlerNode' },
  { name: 'CSV Loader', iconPath: '/icons/sheet.png', type: 'csvLoaderNode' },
  { name: 'PDF Converter', iconPath: '/icons/retriever.png', type: 'pdfConverterNode' },
]

const categorizedApps: Record<string, ToolItem[]> = {
    'Triggers': [
        { name: 'Schedule Trigger', iconPath: '/icons/schedule.png', type: 'scheduleTriggerNode' },
        { name: 'Chat Trigger', iconPath: '/icons/chatbot.png', type: 'chatTriggerNode' },
        { name: 'Webhook', iconPath: '/icons/http.png', type: 'webhookNode' },
    ],
    'Logic': [
        { name: 'IF Condition', iconPath: '/icons/default.png', type: 'ifNode' },
        { name: 'Switch', iconPath: '/icons/default.png', type: 'switchNode' },
        { name: 'Delay/Wait', iconPath: '/icons/schedule.png', type: 'delayNode' },
        { name: 'Loop', iconPath: '/icons/default.png', type: 'loopNode' },
        { name: 'Code', iconPath: '/icons/brain.png', type: 'codeNode' },
        { name: 'Error Handler', iconPath: '/icons/db.png', type: 'errorHandlerNode' },
    ],
    'Integrations': [
        { name: 'Gmail', iconPath: '/icons/gmail.png', type: 'gmailNode' },
        { name: 'Drive', iconPath: '/icons/drive.png', type: 'driveNode' },
        { name: 'Calendar', iconPath: '/icons/calendar.png', type: 'calendarNode' },
        { name: 'Notion', iconPath: '/icons/notion.png', type: 'notionNode' },
        { name: 'Slack', iconPath: '/icons/slack.png', type: 'slackNode' },
        { name: 'Discord', iconPath: '/icons/discord.png', type: 'discordNode' },
        { name: 'Google Sheets', iconPath: '/icons/sheet.png', type: 'googleSheetNode' },
        { name: 'Email (SMTP)', iconPath: '/icons/message.png', type: 'emailNode' },
        { name: 'Telegram', iconPath: '/icons/bot.png', type: 'telegramNode' },
        { name: 'WhatsApp', iconPath: '/icons/whatsapp.png', type: 'whatsAppNode' },
    ],
    'Data': [
        { name: 'Http Request', iconPath: '/icons/http.png', type: 'httpNode' },
        { name: 'Send Data', iconPath: '/icons/send.png', type: 'sendDataNode' },
        { name: 'Data Formatter', iconPath: '/icons/retriever.png', type: 'dataFormatterNode' },
        { name: 'Vector DB', iconPath: '/icons/db.png', type: 'vectordbNode' },
        { name: 'Embedding Model', iconPath: '/icons/embedding.png', type: 'embeddingModelNode' },
        { name: 'Retriever', iconPath: '/icons/retriever.png', type: 'retrieverNode' },
        { name: 'MongoDB', iconPath: '/icons/mongodb.png', type: 'mongoDBNode' },
        { name: 'CSV Loader', iconPath: '/icons/sheet.png', type: 'csvLoaderNode' },
        { name: 'PDF Converter', iconPath: '/icons/retriever.png', type: 'pdfConverterNode' },
    ]
}

const RightPanel: React.FC<Props> = () => {
	const [mainTab, setMainTab] = React.useState('tool')
	const [searchQuery, setSearchQuery] = React.useState('')
	const [chatInput, setChatInput] = React.useState('')
	const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([])
	const [chatLoading, setChatLoading] = React.useState(false)
	const dispatch = useDispatch()
	
    const { selectedNode, logs, showToolsPanel, nodes, edges } = useSelector((state: RootState) => state.flow)
    
    const selectedNodeId = selectedNode?.id

    const isChatEnabled = React.useMemo(() => {
       const chatNode = nodes.find(n => n.type === 'chatTriggerNode')
       const agentNode = nodes.find(n => n.type === 'agent')
       if (!chatNode || !agentNode) return false
       return edges.some(e => e.source === chatNode.id && e.target === agentNode.id)
    }, [nodes, edges])

    const activeRetrieverFile = React.useMemo(() => {
        const agentNode = nodes.find(n => n.type === 'agent')
        if (!agentNode) return null
        const retrieverEdge = edges.find(e => e.source === agentNode.id && nodes.find(n => n.id === e.target)?.type === 'retrieverNode')
        if (!retrieverEdge) return null
        const retrieverNode = nodes.find(n => n.id === retrieverEdge.target)
        return retrieverNode?.data?.fileName as string || null
    }, [nodes, edges])

	React.useEffect(() => {
		if (showToolsPanel) {
			setMainTab('tool')
		} else if (selectedNode) {
            setMainTab('properties')
        }
	}, [showToolsPanel, selectedNode])

	const handleAddNode = useCallback((item: ToolItem) => {
		dispatch(addNode({
			node: item.type as string,
			icon: item.iconPath,
			label: item.name,
		}))
		dispatch(setShowToolsPanel(false))
	}, [dispatch])

	const onDragStart = (event: React.DragEvent, item: ToolItem) => {
		event.dataTransfer.setData('application/reactflow', JSON.stringify(item))
		event.dataTransfer.effectAllowed = 'move'
	}

	const handleConfigChange = useCallback((nodeData: Record<string, unknown>) => {
		if (selectedNodeId) {
			dispatch(updateNodeData({
				nodeId: selectedNodeId,
				data: nodeData,
			}))
		}
	}, [selectedNodeId, dispatch])

	const handleChatMessageReceived = useCallback(async (text: string) => {
		const trimmed = text.trim()
		if (!trimmed || chatLoading) return

		setChatMessages((prev) => [...prev, { role: 'user', text: trimmed, timestamp: Date.now() }])
		setChatInput('')
		setChatLoading(true)

        const agentNode = nodes.find(n => n.type === 'agent')
        const modelEdge = agentNode ? edges.find(e => e.target === agentNode.id && e.targetHandle === 'chat-model') : null
        const memoryEdge = agentNode ? edges.find(e => e.target === agentNode.id && e.targetHandle === 'memory') : null
        
        const modelNode = modelEdge ? nodes.find(n => n.id === modelEdge.source) : null
        const memoryNode = memoryEdge ? nodes.find(n => n.id === memoryEdge.source) : null

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
                    message: trimmed, 
                    modelConfig: modelNode?.data,
                    memoryConfig: memoryNode?.data,
                    agentConfig: agentNode?.data,
                    contextFile: activeRetrieverFile
                }),
			})
			const data = await res.json()
			setChatMessages((prev) => [...prev, { role: 'system', text: data.response || 'No response.', timestamp: Date.now() }])
		} catch {
			setChatMessages((prev) => [...prev, { role: 'system', text: '❌ Error connecting to AI core.', timestamp: Date.now() }])
		} finally {
			setChatLoading(false)
		}
	}, [chatLoading, activeRetrieverFile, nodes, edges])

	const filteredApps = apps.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
	const filteredAI = aiModels.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))

	return (
		<div className="h-full flex flex-col bg-neutral-50/60 backdrop-blur-xl border-l border-neutral-200 shadow-2xl z-30 text-neutral-850">
			<Tabs value={mainTab} onValueChange={setMainTab} className="h-full flex flex-col">
				<div className="px-5 py-4 border-b border-neutral-200 bg-transparent">
					<TabsList className="w-full grid grid-cols-4 h-11 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
						<TabsTrigger value="tool" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:border data-[state=active]:border-neutral-300 rounded-lg transition-all duration-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center gap-1.5 cursor-pointer">
                             <Box className="w-3.5 h-3.5" /> Apps
                        </TabsTrigger>
						<TabsTrigger value="properties" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:border data-[state=active]:border-neutral-300 rounded-lg transition-all duration-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center gap-1.5 cursor-pointer">
                             <Workflow className="w-3.5 h-3.5" /> Config
                        </TabsTrigger>
						<TabsTrigger 
                             value="chat" 
                             disabled={!isChatEnabled}
                             className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:border data-[state=active]:border-neutral-300 rounded-lg transition-all duration-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                             title={!isChatEnabled ? "Connect 'Chat Trigger' to 'AI Agent' to enable" : "AI Chat Interface"}
                        >
                             <MessageSquare className="w-3.5 h-3.5" /> AI
                        </TabsTrigger>
						<TabsTrigger value="logs" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:border data-[state=active]:border-neutral-300 rounded-lg transition-all duration-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center gap-1.5 cursor-pointer">
                             <List className="w-3.5 h-3.5" /> Logs
                        </TabsTrigger>
					</TabsList>
				</div>

                <div className="flex-1 overflow-hidden relative">
                    <TabsContent value="tool" className="h-full mt-0 data-[state=active]:flex flex-col p-0">
                        <div className="p-4 border-b border-neutral-200 bg-transparent">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
                                <Input 
                                    placeholder="Search..." 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                    className="pl-9 h-11 bg-white border border-neutral-200 ring-offset-0 focus-visible:ring-1 focus-visible:ring-neutral-400 font-bold text-xs text-neutral-800 rounded-xl transition-all placeholder:text-neutral-400"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-neutral-450 uppercase tracking-widest">
                                    <Sparkles className="w-3.5 h-3.5 text-neutral-400" /> AI Engines
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {filteredAI.map((i) => (
                                        <button
                                            key={i.name}
                                            onClick={() => handleAddNode(i as any)}
                                            className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-350 hover:bg-neutral-50 hover:shadow-sm transition-all duration-300 group text-center cursor-pointer"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-150 flex items-center justify-center p-2 opacity-70 group-hover:opacity-100 transition-all group-hover:scale-110">
                                                <Image src={i.iconPath} alt={i.name} width={40} height={40} className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-tight">{i.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(categorizedApps).map(([category, items]) => {
                                    const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
                                    if (filteredItems.length === 0) return null;

                                    return (
                                        <div key={category} className="space-y-3">
                                            <div className="flex items-center gap-2 text-xs font-bold text-neutral-450 uppercase tracking-widest pl-1">
                                                {category === 'Triggers' && <Zap className="w-3.5 h-3.5 text-neutral-400" />}
                                                {category === 'Logic' && <Workflow className="w-3.5 h-3.5 text-neutral-400" />}
                                                {category === 'Integrations' && <Box className="w-3.5 h-3.5 text-neutral-400" />}
                                                {category === 'Data' && <Search className="w-3.5 h-3.5 text-neutral-400" />}
                                                {category}
                                            </div>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {filteredItems.map((i) => (
                                                    <button
                                                        key={i.name}
                                                        onClick={() => handleAddNode(i)}
                                                        draggable
                                                        onDragStart={(e) => onDragStart(e, i)}
                                                        className="flex items-center gap-4 p-3 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 transition-all group text-left cursor-grab"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center p-1.5 shrink-0 opacity-70 group-hover:opacity-100 transition-all">
                                                            <Image src={i.iconPath} alt={i.name} width={24} height={24} className="w-full h-full object-contain" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-[11px] font-black text-neutral-900 block truncate uppercase tracking-tighter">{i.name}</span>
                                                            <span className="text-[9px] text-neutral-450 block truncate font-bold">{category} Node</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
					</TabsContent>

                    <TabsContent value="properties" className="h-full mt-0 data-[state=active]:flex flex-col">
                        {selectedNode ? (
                            <div className="flex flex-col h-full bg-transparent">
                                <div className="px-5 py-5 bg-neutral-50 border-b border-neutral-200 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neutral-200 to-neutral-100 border border-neutral-300 flex items-center justify-center shadow-sm transition-transform group-hover:rotate-6">
                                         <Zap className="w-6 h-6 text-neutral-805 fill-neutral-805" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                         <h3 className="text-base font-black text-neutral-900 uppercase tracking-tight truncate">{(selectedNode.data?.label as string) || selectedNode.type}</h3>
                                         <p className="text-[10px] font-bold text-neutral-400 truncate font-mono">{selectedNode.id}</p>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto bg-white">
                                    <ConfigPanelSelector 
                                        nodeId={selectedNode.id}
                                        nodeType={selectedNode.type}
                                        nodeData={selectedNode.data}
                                        onChange={handleConfigChange}
                                        nodes={nodes}
                                        edges={edges}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-6 bg-transparent animate-in zoom-in-95 duration-700">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-neutral-100 border border-neutral-200 flex items-center justify-center shadow-inner relative group">
                                    <div className="absolute inset-0 bg-neutral-500/5 rounded-[2.5rem] animate-pulse" />
                                    <Workflow className="w-10 h-10 text-neutral-500 group-hover:text-neutral-900 transition-colors duration-500" />
                                </div>
                                <div className="space-y-2">
                                  <h3 className="text-xl font-black text-neutral-900 tracking-tight">System Standby</h3>
                                  <p className="text-sm text-neutral-400 max-w-[200px] font-medium leading-relaxed">
                                    Select an operational unit to configure its neural parameters.
                                  </p>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="chat" className="h-full mt-0 data-[state=active]:flex flex-col bg-transparent">
                        {activeRetrieverFile && (
                            <div className="px-4 py-2 bg-neutral-100 border-b border-neutral-200 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-neutral-450 animate-pulse" />
                                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wide">
                                    Context Active: {activeRetrieverFile}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-medium text-xs">
                            {chatMessages.map((m, idx) => (
                                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3.5 rounded-2xl max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-850 border border-neutral-200'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-neutral-200">
                            <div className="relative flex items-center">
                                <Input 
                                    placeholder="Type message..." 
                                    value={chatInput} 
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleChatMessageReceived(chatInput)}
                                    className="bg-white border-neutral-200 text-neutral-800 placeholder-neutral-400"
                                />
                                <button onClick={() => handleChatMessageReceived(chatInput)} className="absolute right-3 text-neutral-500 hover:text-neutral-900 transition-all cursor-pointer">
                                    <Send className="w-5 h-5 fill-current" />
                                </button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="logs" className="h-full mt-0 data-[state=active]:flex flex-col bg-transparent">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {logs.map((log) => (
                                <div key={log.id} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full ${log.type === 'error' ? 'bg-red-500' : 'bg-neutral-400'}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-black uppercase tracking-tight text-neutral-900">{log.message}</div>
                                            <div className="text-[9px] font-bold text-neutral-450 mt-1 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                    {log.data && (
                                        <div className="mt-3 bg-neutral-100/30 p-2 rounded border border-neutral-200 overflow-x-auto">
                                            <pre className="text-[10px] font-mono text-neutral-600">{JSON.stringify(log.data, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </TabsContent>
				</div>
			</Tabs>
		</div>
	)
}

export default RightPanel

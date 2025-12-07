'use client'

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { X, MessageCircle, Send, Minimize2, CheckCircle2 } from 'lucide-react'

export default function ChatWidget({ courseId, lessonId }: { courseId: string, lessonId?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [localInput, setLocalInput] = useState('')

    // Adapted to the available API keys from debug session:
    // ['id', 'messages', 'setMessages', 'sendMessage', 'regenerate', 'clearError', 'stop', 'error', 'resumeStream', 'status', 'addToolResult', 'addToolOutput']
    const { messages, sendMessage, status, error } = useChat({
        api: '/api/chat',
        body: { courseId, lessonId }
    })

    const isLoading = status === 'streaming' || status === 'submitted'
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isOpen, status])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!localInput.trim() || isLoading) return

        const userMessage = localInput
        setLocalInput('') // Clear input immediately

        try {
            // Using sendMessage based on debug output. Assuming it takes the message object.
            // If it takes a string, we might need to adjust, but standard Append takes object.
            await sendMessage({
                role: 'user',
                content: userMessage
            })
        } catch (error) {
            console.error('Chat error:', error)
            setLocalInput(userMessage) // Restore input on error
        }
    }

    // Floating Button
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 shadow-xl shadow-indigo-600/30 flex items-center justify-center text-white hover:bg-indigo-500 transition-all hover:scale-110 z-50"
            >
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <MessageCircle size={24} />
            </button>
        )
    }

    // Chat Window
    return (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <span className="text-indigo-400 font-bold text-xs">AI</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Ekonex Tutor</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${status === 'connected' || status === 'ready' ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`}></span>
                            <span className="text-[10px] text-slate-400">
                                {status === 'streaming' ? 'Typing...' : 'Online'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                        <Minimize2 size={16} />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {messages.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                        <MessageCircle size={32} className="mb-3 text-slate-700" />
                        <p className="text-sm">Hi! I can help you with questions about this course. Ask me anything!</p>
                    </div>
                )}

                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                            ${m.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-sm'
                            }
                        `}>
                            {m.content}
                        </div>
                    </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 w-16">
                            <div className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                        {error.message || 'An error occurred. Please try again.'}
                    </div>
                )}

                <div ref={bottomRef}></div>
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/30">
                <div className="relative flex items-center">
                    <input
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!localInput.trim() || isLoading}
                        className="absolute right-2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="text-[10px] text-center text-slate-600 mt-2">
                    AI can make mistakes. Check important info.
                </div>
            </form>
        </div>
    )
}

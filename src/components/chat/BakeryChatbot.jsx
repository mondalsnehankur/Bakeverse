import React, { useState, useEffect, useRef } from 'react';
import { Bot, ChevronDown, Send, Sparkles, Trash2, X } from 'lucide-react';
import api from '../../services/api';

const STORAGE_KEY = 'bakeverse_chat_history';
const MAX_STORED_MESSAGES = 50; // Keep last 50 messages to avoid bloating localStorage

const DEFAULT_MESSAGES = [
    { role: 'assistant', text: 'Ask for cake design, pricing, dietary options, timings, or delivery details.' },
];

const BakeryChatbot = ({ currentCakeState, onApplySuggestedDesign }) => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState(() => {
        // Restore chat history from localStorage on first render
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch {
            // ignore parse errors
        }
        return DEFAULT_MESSAGES;
    });
    const [suggestedDesign, setSuggestedDesign] = useState(null);
    const [quickReplies, setQuickReplies] = useState(['Design a Cake', 'Show Pricing', 'Show Dietary Info']);
    const messagesEndRef = useRef(null);

    // Persist messages to localStorage whenever they change
    useEffect(() => {
        try {
            const toStore = messages.slice(-MAX_STORED_MESSAGES);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
        } catch {
            // ignore storage errors (e.g. private browsing quota)
        }
    }, [messages]);

    // Auto-scroll to latest message when chat opens or new message arrives
    useEffect(() => {
        if (open && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open]);

    const parseResponse = (payload) => {
        if (payload && typeof payload === 'object') return payload;
        if (typeof payload !== 'string') throw new Error('Chatbot returned an invalid response.');
        const cleaned = payload.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
            return JSON.parse(cleaned);
        } catch (error) {
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start < 0 || end <= start) throw error;
            return JSON.parse(cleaned.slice(start, end + 1));
        }
    };

    const sendMessage = async (value = input) => {
        const message = value.trim();
        if (!message || loading) return;
        setInput('');
        setMessages((current) => [...current, { role: 'user', text: message }]);
        setLoading(true);
        try {
            const response = await api.post('/chat/message', {
                message,
                currentCakeState,
                userContext: {},
            });
            const data = parseResponse(response.data);
            const reply = typeof data.reply === 'string' && data.reply.trim()
                ? data.reply.trim()
                : 'No response was returned.';
            setMessages((current) => [...current, { role: 'assistant', text: reply }]);
            setSuggestedDesign(data.suggested3DParams || null);
            setQuickReplies(Array.isArray(data.quickReplies) ? data.quickReplies.filter(Boolean) : []);
        } catch (error) {
            setMessages((current) => [...current, { role: 'assistant', text: 'Chat response unavailable. The 3D editor remains ready to use.' }]);
        } finally {
            setLoading(false);
        }
    };

    const applyDesign = () => {
        if (!suggestedDesign || !onApplySuggestedDesign) return;
        onApplySuggestedDesign(suggestedDesign);
        setMessages((current) => [...current, { role: 'assistant', text: 'Applied the suggested design to your live 3D canvas.' }]);
        setSuggestedDesign(null);
    };

    const clearHistory = () => {
        setMessages(DEFAULT_MESSAGES);
        setSuggestedDesign(null);
        setQuickReplies(['Design a Cake', 'Show Pricing', 'Show Dietary Info']);
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
            {open && (
                <section className="w-[min(23rem,calc(100vw-2rem))] rounded-3xl border border-purple-700 bg-mocha-950 text-purple-200 shadow-2xl">
                    <header className="flex items-center justify-between border-b border-purple-800 px-4 py-3">
                        <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-purple-300" /><strong className="text-sm">BakeVerse AI</strong></div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={clearHistory}
                                aria-label="Clear chat history"
                                title="Clear chat history"
                                className="text-purple-500 hover:text-purple-300 transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => setOpen(false)} aria-label="Close chatbot"><X className="h-4 w-4" /></button>
                        </div>
                    </header>
                    <div className="max-h-96 space-y-3 overflow-y-auto overscroll-contain p-3 text-xs">
                        {messages.map((item, index) => (
                            <p key={`${item.role}-${index}`} className={`max-w-[88%] break-words whitespace-pre-wrap rounded-2xl px-3 py-2 leading-relaxed ${item.role === 'user' ? 'ml-auto bg-purple-700 text-white' : 'bg-purple-950 text-purple-200'}`}>
                                {item.text}
                            </p>
                        ))}
                        {loading && <div className="flex items-center gap-1 text-purple-400"><span className="animate-pulse">●</span><span className="animate-pulse">●</span><span className="animate-pulse">●</span></div>}
                        <div ref={messagesEndRef} />
                    </div>
                    {suggestedDesign && (
                        <button type="button" onClick={applyDesign} className="mx-3 mb-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-xl bg-purple-500 px-3 py-2 text-xs font-bold text-white hover:bg-purple-400">
                            <Sparkles className="h-3.5 w-3.5" /> ✨ Apply Suggested Design to 3D Canvas
                        </button>
                    )}
                    {quickReplies.length > 0 && (
                        <div className="flex gap-1.5 overflow-x-auto px-3 pb-3">
                            {quickReplies.map((reply) => <button key={reply} type="button" onClick={() => sendMessage(reply)} className="whitespace-nowrap rounded-full border border-purple-700 px-2.5 py-1 text-[10px] text-purple-200 hover:bg-purple-900">{reply}</button>)}
                        </div>
                    )}
                    <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex gap-2 border-t border-purple-800 p-3">
                        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask BakeVerse AI..." className="min-w-0 flex-1 rounded-xl border border-purple-800 bg-mocha-900 px-3 py-2 text-xs text-purple-100 outline-none placeholder:text-purple-500" />
                        <button type="submit" aria-label="Send message" className="rounded-xl bg-purple-600 p-2 text-white hover:bg-purple-500"><Send className="h-4 w-4" /></button>
                    </form>
                </section>
            )}
            <button type="button" onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-purple-400 bg-mocha-950 px-4 py-3 text-xs font-bold text-purple-200 shadow-xl hover:bg-purple-950" aria-label="Open BakeVerse AI chatbot">
                <Bot className="h-5 w-5" /> <span>Ask BakeVerse AI</span>{open ? <ChevronDown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </button>
        </div>
    );
};

export default BakeryChatbot;

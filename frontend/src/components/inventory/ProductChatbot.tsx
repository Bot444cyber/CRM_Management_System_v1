"use client";

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInventory } from '@/context/InventoryContext';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

const ProductChatbot: React.FC = () => {
    const { inventories } = useInventory();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting specific to the product
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    role: 'assistant',
                    text: `Hi there! I'm your AI inventory assistant. Ask me anything about your products!`
                }
            ]);
        }
    }, [isOpen, messages.length]);

    // Scroll to bottom on multiple messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Need to pass the context without 'id' to match Backend expectations
            const historyToBackend = messages.concat(userMsg).map(m => ({ role: m.role, text: m.text }));

            // Build a simplified context so we don't send a massive payload if there are many products
            const simplifiedCatalog = inventories.flatMap(inv =>
                inv.mainProducts.flatMap(mp =>
                    mp.subProducts.map(sub => ({
                        inventory: inv.name,
                        mainProduct: mp.name,
                        name: sub.name,
                        price: sub.price,
                        stock: sub.stock,
                        status: sub.status
                    }))
                )
            );

            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    catalog: simplifiedCatalog,
                    messages: historyToBackend
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch response');
            }

            const data = await response.json();
            const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', text: data.reply };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', text: "I'm sorry, I'm having trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                    <MessageSquare size={24} className="group-hover:animate-pulse" />
                </button>
            )}

            {/* Chatbot Popup */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                                <Bot size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground text-sm">Product Assistant</h3>
                                <p className="text-[10px] text-emerald-500 font-medium tracking-wider uppercase">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex flex-col gap-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "self-end items-end" : "self-start items-start")}>
                                <div className={cn(
                                    "p-3 rounded-2xl text-sm leading-relaxed prose dark:prose-invert prose-emerald max-w-none",
                                    msg.role === 'user'
                                        ? "bg-emerald-500 text-black rounded-br-sm prose-p:text-black prose-strong:text-black"
                                        : "bg-muted text-foreground border border-border rounded-bl-sm"
                                )}>
                                    <ReactMarkdown
                                        components={{
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 last:mb-0" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 last:mb-0" {...props} />,
                                            li: ({ node, ...props }) => <li className="mb-1 last:mb-0" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 px-1 font-bold">
                                    {msg.role === 'user' ? 'You' : 'Assistant'}
                                </span>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="self-start items-start flex flex-col max-w-[85%]">
                                <div className="p-3 bg-muted border border-border rounded-2xl rounded-bl-sm flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin text-emerald-500" />
                                    <span className="text-xs text-muted-foreground">Typing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-card border-t border-border">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask a question..."
                                className="w-full bg-background border border-border rounded-full pl-5 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 p-2 bg-emerald-500 text-black rounded-full disabled:opacity-50 transition-all hover:bg-emerald-400"
                            >
                                <Send size={14} className="ml-0.5" />
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </>
    );
};

export default ProductChatbot;

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { agentService } from './AgentService';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
}

export function FamBotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: "Hi! I'm FamBot. I can help you manage your family data. Try saying 'Add my son Bob born on 2020-01-01'." }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsThinking(true);

        try {
            // Small artificial delay for UX if LLM is too fast (unlikely for local LLM but good for feel)
            // await new Promise(resolve => setTimeout(resolve, 600)); 

            const response = await agentService.sendMessage(userMsg);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <div
                className={`bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 w-80 sm:w-96 mb-4 transition-all duration-300 origin-bottom-right pointer-events-auto flex flex-col ${isOpen ? 'opacity-100 scale-100 translate-y-0 h-[500px]' : 'opacity-0 scale-95 translate-y-10 h-0 overflow-hidden'
                    }`}
            >
                {/* Header */}
                <div className="p-4 bg-primary-600 rounded-t-2xl flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">FamBot AI</h3>
                            <p className="text-xs text-primary-100 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                Online (Local)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-neutral-900/50">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user'
                                        ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                    }`}
                            >
                                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                            </div>
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-700 rounded-tl-none shadow-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isThinking && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0 text-primary-600 dark:text-primary-400">
                                <Loader2 size={16} className="animate-spin" />
                            </div>
                            <div className="bg-white dark:bg-neutral-800 text-gray-500 text-xs py-2 px-4 rounded-2xl rounded-tl-none border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-2">
                                Thinking...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 rounded-b-2xl">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me to add a child..."
                            className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-neutral-900 border-transparent focus:bg-white dark:focus:bg-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl text-sm transition-all dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-xl transition-all duration-300 pointer-events-auto ${isOpen
                        ? 'bg-neutral-800 text-white rotate-90 scale-0 opacity-0 absolute'
                        : 'bg-primary-600 hover:bg-primary-700 text-white scale-100 opacity-100'
                    }`}
            >
                <MessageSquare size={24} />
            </button>

            {/* Close Button when open (Clean swap effect) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-xl transition-all duration-300 pointer-events-auto bg-neutral-800 hover:bg-neutral-900 text-white ${isOpen
                        ? 'scale-100 opacity-100 rotate-0'
                        : 'scale-0 opacity-0 -rotate-90 absolute'
                    }`}
            >
                <X size={24} />
            </button>
        </div>
    );
}

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ChatBox({ messages, onSendMessage, loading }) {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim() && onSendMessage) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <div className="glass-card p-6 flex flex-col h-[500px]">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Chat</h3>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse-slow text-gray-400">Loading messages...</div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwnMessage = msg.senderId === user?.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwnMessage
                                            ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                                            : 'bg-white border-2 border-gray-200 text-gray-800'
                                        }`}
                                >
                                    <p className="text-xs font-semibold mb-1 opacity-80">
                                        {msg.senderName}
                                    </p>
                                    <p className="text-sm">{msg.message}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="input-field flex-1"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

import axios from 'axios';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const BACKEND_ERROR =
    "I'm sorry, I'm having trouble connecting to the FamLink AI backend. Is the backend running on port 8000?";

export class AgentService {
    private apiBaseUrl = import.meta.env.VITE_FAMLINK_RAG_API_URL || 'http://localhost:8000/api';
    private sessionId = crypto.randomUUID();
    private history: Message[] = [];

    public getHistory(): Message[] {
        return this.history;
    }

    public clearHistory() {
        this.history = [];
        this.sessionId = crypto.randomUUID();
    }

    async sendMessage(userContent: string): Promise<string> {
        const userMessage: Message = { role: 'user', content: userContent };
        const priorHistory = this.history.slice(-8);
        this.history.push(userMessage);

        try {
            const response = await axios.post(`${this.apiBaseUrl}/chat`, {
                message: userContent,
                history: priorHistory,
                session_id: this.sessionId
            });

            const answer = response.data.answer || '';
            this.history.push({ role: 'assistant', content: answer });
            return answer;
        } catch (error) {
            console.error('FamLink AI backend error:', error);
            return BACKEND_ERROR;
        }
    }
}

export const agentService = new AgentService();

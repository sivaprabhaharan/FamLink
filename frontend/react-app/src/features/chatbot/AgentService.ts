import axios from 'axios';
import { childrenService } from '../children/ChildrenService';

// Types for OpenAI-compatible API
interface Message {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
    name?: string;
}

interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

interface ToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: object;
    };
}

const SYSTEM_PROMPT = `You are FamBot, a helpful family assistant. 
You can help manage family data using the available tools.
When a user asks to perform an action (like adding a child), use the appropriate tool.
Always verify the result of the tool call before confirming to the user.
If you need more information to call a tool, ask the user for it.
Current Date: ${new Date().toISOString().split('T')[0]}
`;

const TOOLS: ToolDefinition[] = [
    {
        type: 'function',
        function: {
            name: 'getChildren',
            description: 'Get the list of all children in the family family',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'addChild',
            description: 'Add a new child to the family',
            parameters: {
                type: 'object',
                properties: {
                    firstName: { type: 'string', description: 'First name of the child' },
                    lastName: { type: 'string', description: 'Last name of the child' },
                    dateOfBirth: { type: 'string', description: 'Date of birth in YYYY-MM-DD format' },
                    gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
                    notes: { type: 'string', description: 'Optional notes about the child' }
                },
                required: ['firstName', 'lastName', 'dateOfBirth']
            }
        }
    }
];

export class AgentService {
    private baseUrl = 'http://localhost:1234/v1'; // Local LM Studio
    private history: Message[] = [];

    constructor() {
        this.history = [{ role: 'system', content: SYSTEM_PROMPT }];
    }

    public getHistory(): Message[] {
        return this.history;
    }

    public clearHistory() {
        this.history = [{ role: 'system', content: SYSTEM_PROMPT }];
    }

    async sendMessage(userContent: string): Promise<string> {
        // 1. Add user message to history
        this.history.push({ role: 'user', content: userContent });

        try {
            // 2. Call LLM
            const response = await this.callLLM();
            const message = response.choices[0].message;

            // 3. Handle Tool Calls
            if (message.tool_calls && message.tool_calls.length > 0) {
                this.history.push(message); // Add assistant message with tool_calls

                for (const toolCall of message.tool_calls) {
                    const result = await this.executeTool(toolCall);

                    this.history.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        name: toolCall.function.name,
                        content: JSON.stringify(result)
                    });
                }

                // 4. Follow-up call to LLM after tool execution
                const secondResponse = await this.callLLM();
                const finalMessage = secondResponse.choices[0].message;

                if (finalMessage.content) {
                    this.history.push(finalMessage);
                    return finalMessage.content;
                }
                return "Action completed, but I didn't have anything else to say.";

            } else {
                // No tool calls, just text response
                this.history.push(message);
                return message.content || "";
            }

        } catch (error) {
            console.error('LLM Error:', error);
            return "I'm sorry, I'm having trouble connecting to my brain (Local LLM). Is LM Studio running?";
        }
    }

    private async callLLM() {
        const response = await axios.post(`${this.baseUrl}/chat/completions`, {
            messages: this.history,
            tools: TOOLS,
            tool_choice: 'auto',
            model: 'qwen/qwen3-4b-2507', // User specified model
            temperature: 0.7
        });
        return response.data;
    }

    private async executeTool(toolCall: ToolCall): Promise<any> {
        const name = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log(`Executing tool: ${name}`, args);

        switch (name) {
            case 'getChildren':
                return await childrenService.getChildren();
            case 'addChild':
                return await childrenService.addChild(args);
            default:
                return { error: `Tool ${name} not found` };
        }
    }
}

export const agentService = new AgentService();

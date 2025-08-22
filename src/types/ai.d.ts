declare module 'ai' {
  export type MessageRole = 'user' | 'assistant' | 'system';

  export interface Message {
    id: string;
    role: MessageRole;
    content: string;
  }

  export interface UseChatOptions {
    api?: string;
    id?: string;
    initialInput?: string;
    initialMessages?: Message[];
    headers?: Record<string, string> | Headers;
    body?: any;
    onResponse?: (response: Response) => void | Promise<void>;
    onFinish?: (message: Message) => void;
    onError?: (error: Error) => void;
  }

  export interface UseChatHelpers {
    messages: Message[];
    error: Error | undefined;
    append: (
      message: Message | Omit<Message, 'id'>,
      options?: {
        data?: any;
      }
    ) => Promise<string | null | undefined>;
    reload: () => Promise<string | null | undefined>;
    stop: () => void;
    setMessages: (messages: Message[]) => void;
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
  }

  export function useChat(options?: UseChatOptions): UseChatHelpers;
}

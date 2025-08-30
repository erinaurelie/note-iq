import { useMutation } from "@tanstack/react-query";
import React, { createContext, ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

type StreamResponse = {
  addMessage: () => void,
  message: string,
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
  isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: '',
  handleInputChange: () => {},
  isLoading: false
});

interface Props {
  fileId: string,
  children: ReactNode
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileId,
            message,
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        // Handle the streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        let result = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          result += chunk;
        }

        return result;
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Chat error:', error);
      setIsLoading(false);
    },
    onSuccess: () => {
      setMessage('');
    }
  });

  const addMessage = () => {
    if (message.trim() && !isLoading) {
      sendMessage({ message });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
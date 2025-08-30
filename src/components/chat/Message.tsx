import { cn } from "@/lib/utils"
import { ExtendedMessage } from "@/types/message";
import Icons from "../Icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";


interface MessageProps {
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
}

const Message = ({ message, isNextMessageSamePerson }: MessageProps) => {
  return (
    <div className={cn('flex w-full', {
      'justify-end': message.isUserMessage,
      'justify-start': !message.isUserMessage,
    })}>
      <div className={cn('flex items-end gap-2 max-w-[80%]', {
        'flex-row-reverse': message.isUserMessage,
        'flex-row': !message.isUserMessage,
      })}>
        {/* Avatar */}
        <div className={cn('relative flex h-8 w-8 aspect-square items-center justify-center rounded-full', {
          "bg-blue-600": message.isUserMessage,
          "bg-zinc-800": !message.isUserMessage,
          invisible: isNextMessageSamePerson,
        })}>
          {message.isUserMessage ? (
            <Icons.user className="fill-zinc-200 text-zinc-200 h-4 w-4" />
          ) : (
            <Icons.logo className='fill-zinc-300 h-4 w-4' />
          )}
        </div>

        {/* Message Bubble */}
        <div className={cn(
          'flex flex-col space-y-1',
          {
            'items-end': message.isUserMessage,
            'items-start': !message.isUserMessage,
          }
        )}>
          <div 
            className={cn(
              'px-4 py-2 rounded-2xl max-w-full',
              {
                'bg-blue-600 text-white rounded-br-md':
                  message.isUserMessage,
                'bg-gray-200 text-gray-900 rounded-bl-md':
                  !message.isUserMessage,
                'rounded-br-md':
                  !isNextMessageSamePerson && message.isUserMessage,
                'rounded-bl-md':
                  !isNextMessageSamePerson && !message.isUserMessage,
              }
            )}
          >
            {typeof message.text === 'string' ? (
              <div
                className={cn('prose prose-sm max-w-none', {
                  'text-zinc-50': message.isUserMessage,
                  'text-gray-900': !message.isUserMessage,
                })}
              >
                <ReactMarkdown>
                  {message.text}
                </ReactMarkdown>
              </div>
            ) : (
              message.text
            )}
          </div>

          {/* Timestamp */}
          {message.id !== 'loading-message' ? (
            <div
              className={cn(
                'text-xs select-none px-2',
                {
                  'text-zinc-500': !message.isUserMessage,
                  'text-blue-300': message.isUserMessage,
                }
              )}>
              {format(
                new Date(message.createdAt),
                'HH:mm'
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Message
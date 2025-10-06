import React from 'react';

interface MessageBubbleProps {
  message: string;
  sender: string;
  username?: string;
  timestamp: string;
  isMe: boolean;
  isSending?: boolean;
  isError?: boolean;
  error?: string;
  onRetry?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sender,
  username,
  timestamp,
  isMe,
  isSending,
  isError,
  error,
  onRetry,
}) => {
  // Format timestamp
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className={`flex flex-col mb-4 ${isMe ? "items-end" : "items-start"}`}>
      {/* Sender name for received messages */}
      {!isMe && (
        <span className="text-xs text-gray-400 mb-1 ml-1">
          {username || sender}
        </span>
      )}
      
      <div className="flex items-end gap-2 max-w-[80%]">
        {/* Message bubble */}
        <div
          className={`relative p-3 rounded-2xl shadow-md ${
            isMe 
              ? 'bg-blue-500 text-white rounded-br-sm' 
              : 'bg-gray-200 text-gray-800 rounded-bl-sm'
          } ${isError ? 'border border-red-500' : ''} ${
            isSending ? 'opacity-70' : ''
          }`}
        >
          <p className="text-sm break-words">{message}</p>
          
          {/* Timestamp and status */}
          <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
            isMe ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span>{formatTime(timestamp)}</span>
            {isMe && (
              <span>
                {isSending ? (
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : isError ? (
                  <span className="text-red-400">⚠️</span>
                ) : (
                  <span>✓</span>
                )}
              </span>
            )}
          </div>
          
          {/* Error message */}
          {isError && (
            <div className="absolute -bottom-6 right-0 text-xs text-red-400 flex items-center">
              <span>{error}</span>
              {onRetry && (
                <button 
                  onClick={onRetry}
                  className="ml-1 text-blue-300 hover:text-blue-100 font-medium"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

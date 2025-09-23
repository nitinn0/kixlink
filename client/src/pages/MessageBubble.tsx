interface MessageBubbleProps {
  message: string;
  sender: string;
  username?: string;
  timestamp: string;
  isMe: boolean;
  isSending?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sender,
  username,
  timestamp,
  isMe,
  isSending,
}) => {
  return (
    <div
      className={`flex flex-col mb-2 ${isMe ? "items-end" : "items-start"}`}
    >
      <div
        className={`p-3 rounded-lg shadow-md ${
          isMe ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        <p className="text-sm">{message}</p>
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {sender} {isSending ? " • sending..." : ` • ${timestamp}`}
      </span>
    </div>
  );
};

import React from "react";

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <input
      type="text"
      className="message-input"
      placeholder="Type message..."
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
};

export default MessageInput;

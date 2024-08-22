import React from "react";

interface MessageSubmitButtonProps {
  handleSendMessage: () => void;
}

const MessageSubmitButton: React.FC<MessageSubmitButtonProps> = ({
  handleSendMessage,
}) => {
  return (
    <button className="message-submit" onClick={handleSendMessage}>
      Send
    </button>
  );
};

export default MessageSubmitButton;

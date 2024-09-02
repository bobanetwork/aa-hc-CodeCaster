import React from "react";

interface MessageSubmitButtonProps {
  handleSendMessage: () => void;
}

const MessageSubmitButton: React.FC<MessageSubmitButtonProps> = ({
  handleSendMessage,
}) => {
  return (
    <button data-testid="submit-message" className="message-submit" onClick={handleSendMessage}>
      Send
    </button>
  );
};

export default MessageSubmitButton;

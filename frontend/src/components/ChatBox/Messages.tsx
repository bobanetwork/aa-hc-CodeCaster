import React from "react";

interface MessagesProps {
  messages: (string | React.ReactNode)[];
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
  return (
    <div className="messages-content">
      {messages.map((msg, index) => (
        <div key={index} className="message">
          {msg}
        </div>
      ))}
    </div>
  );
};

export default Messages;

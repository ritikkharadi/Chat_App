import React from 'react';

const TypingLoader = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="typing-dot text-black bg-gray-600"> typing</div>
      <div className="typing-dot bg-gray-600"></div>
      <div className="typing-dot bg-gray-600"></div>
      <style jsx>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #333;
          animation: typing 1s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) {
          animation-delay: 0s;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default TypingLoader;
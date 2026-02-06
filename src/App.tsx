import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { cn } from "./lib/utils";
import GroupDetails from "./GroupDetails";
import { AnimatePresence, motion } from "framer-motion";
import { playSentSound, playReceivedSound } from "./lib/sounds";
import "./index.css";

const CHARACTERS = [
  "OJ Simpson",
  "Jeffrey Epstein",
  "Jeffery Dahmer",
  "El Chapo",
  "Joseph Stalin",
];

const AVATARS: Record<string, string> = {
  "Me": "https://api.dicebear.com/9.x/micah/svg?seed=Me&backgroundColor=b6e3f4",
  "OJ Simpson": "/avatars/oj.jpg",
  "Jeffrey Epstein": "/avatars/epstein.jpg",
  "Jeffery Dahmer": "/avatars/dahmer.jpg",
  "El Chapo": "/avatars/chapo.jpg",
  "Joseph Stalin": "/avatars/stalin.jpg",
};

export default function App() {
  const [sessionId] = useState(() => localStorage.getItem("sessionId") || crypto.randomUUID());
  const [showGroupDetails, setShowGroupDetails] = useState(false);

  useEffect(() => {
    localStorage.setItem("sessionId", sessionId);
  }, [sessionId]);

  const messages = useQuery(api.messages.get, { sessionId });
  const typing = useQuery(api.messages.getTyping, { sessionId });
  const sendMessage = useMutation(api.messages.send);
  const clearChat = useMutation(api.messages.clear);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sound effects logic
  const prevMessagesLength = useRef(0);

  useEffect(() => {
    if (messages) {
      if (messages.length > prevMessagesLength.current) {
        // Find the new message(s)
        const newMessagesInfo = messages.slice(prevMessagesLength.current);
        const lastNewMessage = newMessagesInfo[newMessagesInfo.length - 1];

        // If the last new message is NOT from me, play received sound
        if (lastNewMessage && lastNewMessage.author !== "Me") {
          playReceivedSound();
        }
        // Note: Sent sound is played in handleSend for immediate feedback
      }
      prevMessagesLength.current = messages.length;

      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    playSentSound(); // Play immediately for better UX

    await sendMessage({
      body: input,
      author: "Me",
      sessionId,
    });
    setInput("");
  };

  const handleClear = async () => {
    await clearChat({ sessionId });
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black text-black dark:text-white relative overflow-hidden">
      <GroupDetails
        isOpen={showGroupDetails}
        onClose={() => setShowGroupDetails(false)}
        participants={CHARACTERS}
        avatars={AVATARS}
      />

      {/* iOS Header */}
      <header className="ios-header z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <button className="text-[#007AFF] text-lg flex items-center gap-1">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 19L1.5 10L11.5 1" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-normal text-[17px]">Filters</span>
        </button>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => setShowGroupDetails(true)}>
          <div className="flex items-center justify-center -space-x-4 mb-2">
            {CHARACTERS.slice(0, 3).map((char, i) => (
              <div key={char} className={cn("relative z-10", i === 1 && "z-20 -mt-4")}>
                <img
                  src={AVATARS[char]}
                  alt={char}
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-gray-200 object-cover"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-[13px] font-semibold flex items-center gap-1">
              Mediocre Mastermind
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 3L4 4.5L5.5 3" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </h1>
          </div>
        </div>

        <div className="w-[60px] flex justify-end">
          <button
            onClick={handleClear}
            className="text-[#007AFF] text-[17px] font-normal"
          >
            Clear
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-1 hide-scrollbar" ref={scrollRef}>
        <div className="text-center text-[#8E8E93] text-xs font-medium my-4">
          iMessage
        </div>

        <AnimatePresence initial={false}>
          {messages?.map((msg, idx) => {
            const isMe = msg.author === "Me";
            const prevMsg = messages[idx - 1];
            const nextMsg = messages[idx + 1];

            const isFirstInGroup = !prevMsg || prevMsg.author !== msg.author;
            const isLastInGroup = !nextMsg || nextMsg.author !== msg.author;

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "flex w-full flex-col",
                  isMe ? "items-end" : "items-start",
                  isFirstInGroup && "mt-3"
                )}
              >
                {!isMe && isFirstInGroup && (
                  <span className="ml-12 text-[11px] text-[#8E8E93] mb-1 pl-1">
                    {msg.author}
                  </span>
                )}

                <div className="flex items-end gap-2 max-w-[85%]">
                  {!isMe && (
                    <div className="w-8 flex-shrink-0">
                      {isLastInGroup ? (
                        <img
                          src={AVATARS[msg.author]}
                          alt={msg.author}
                          className="w-8 h-8 rounded-full bg-gray-200 object-cover"
                        />
                      ) : <div className="w-8" />}
                    </div>
                  )}

                  <div
                    className={cn(
                      "px-4 py-2 text-[17px] leading-snug break-words shadow-sm",
                      isMe
                        ? "bg-[#007AFF] text-white rounded-2xl rounded-br-md"
                        : "bg-[#E9E9EB] dark:bg-[#262628] text-black dark:text-white rounded-2xl rounded-bl-md",
                      !isLastInGroup && isMe && "rounded-br-2xl",
                      !isLastInGroup && !isMe && "rounded-bl-2xl",
                      isLastInGroup && isMe && "rounded-br-sm",
                      isLastInGroup && !isMe && "rounded-bl-sm"
                    )}
                  >
                    {msg.body}
                  </div>
                </div>

                {isMe && isLastInGroup && idx === messages.length - 1 && (
                  <span className="text-[10px] text-[#8E8E93] font-medium mt-1 mr-1">Delivered</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicators */}
        <AnimatePresence>
          {typing?.map((t) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 max-w-[85%] mt-2"
            >
              <div className="w-8 flex-shrink-0">
                <img
                  src={AVATARS[t.author]}
                  alt={t.author}
                  className="w-8 h-8 rounded-full bg-gray-200 object-cover"
                />
              </div>
              <div className="bg-[#E9E9EB] dark:bg-[#262628] px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
                <div className="typing-dot" />
                <div className="typing-dot delay-100" />
                <div className="typing-dot delay-200" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Input Area */}
      <div className="ios-input-container">
        <form onSubmit={handleSend} className="flex gap-3 items-center max-w-4xl mx-auto py-2">
          <button type="button" className="text-[#8E8E93] transition-colors">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 5.5a1 1 0 10-2 0v3.5H7.5a1 1 0 10 0 2h3.5v3.5a1 1 0 10 2 0v-3.5h3.5a1 1 0 10 0-2h-3.5V7.5z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex-1 relative">
            <input
              autoFocus
              type="text"
              className="w-full rounded-full border border-[#C6C6C6] dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] pl-4 pr-10 py-1.5 text-[17px] text-black dark:text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#8E8E93]"
              placeholder="iMessage"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {input.trim() && (
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-[#007AFF] text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>
          {!input.trim() && (
            <button type="button" className="text-[#8E8E93]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="16" y2="12" />
                <line x1="12" y1="16" x2="8" y2="12" />
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

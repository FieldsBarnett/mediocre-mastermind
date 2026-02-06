import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { cn } from "./lib/utils";
import "./index.css";

const CHARACTERS = [
  "OJ Simpson",
  "Jeffrey Epstein",
  "Jeffery Dahmer",
  "El Chapo",
  "Joseph Stalin",
];

const AVATARS: Record<string, string> = {
  "Me": "https://api.dicebear.com/7.x/avataaars/svg?seed=Me",
  "OJ Simpson": "https://api.dicebear.com/7.x/avataaars/svg?seed=OJ",
  "Jeffrey Epstein": "https://api.dicebear.com/7.x/avataaars/svg?seed=Jeffrey",
  "Jeffery Dahmer": "https://api.dicebear.com/7.x/avataaars/svg?seed=Dahmer",
  "El Chapo": "https://api.dicebear.com/7.x/avataaars/svg?seed=Chapo",
  "Joseph Stalin": "https://api.dicebear.com/7.x/avataaars/svg?seed=Stalin",
};

export default function App() {
  const [sessionId] = useState(() => localStorage.getItem("sessionId") || crypto.randomUUID());

  useEffect(() => {
    localStorage.setItem("sessionId", sessionId);
  }, [sessionId]);

  const messages = useQuery(api.messages.get, { sessionId });
  const sendMessage = useMutation(api.messages.send);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage({
      body: input,
      author: "Me",
      sessionId,
    });
    setInput("");
  };

  return (
    <div className="flex h-screen w-full flex-col bg-black text-white font-sans antialiased overflow-hidden">
      {/* Header */}
      <header className="flex flex-col items-center justify-center border-b border-gray-800 bg-gray-900/50 p-4 backdrop-blur-md sticky top-0 z-10">
        <div className="flex -space-x-2 overflow-hidden mb-2">
          {CHARACTERS.map(char => (
            <img
              key={char}
              src={AVATARS[char]}
              alt={char}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-900"
            />
          ))}
        </div>
        <h1 className="text-sm font-semibold text-gray-200">
          Mediocre Mastermind
          <span className="block text-xs font-normal text-gray-500 text-center">5 people &gt;</span>
        </h1>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages?.map((msg, idx) => {
          const isMe = msg.author === "Me";
          const showAvatar = !isMe && (idx === 0 || messages[idx - 1].author !== msg.author);

          return (
            <div
              key={msg._id}
              className={cn(
                "flex w-full items-end gap-2 fade-in",
                isMe ? "justify-end" : "justify-start"
              )}
            >
              {!isMe && (
                <div className="w-8 flex-shrink-0">
                  {showAvatar ? (
                    <img
                      src={AVATARS[msg.author]}
                      alt={msg.author}
                      className="h-8 w-8 rounded-full bg-gray-700"
                    />
                  ) : <div className="w-8" />}
                </div>
              )}

              <div
                className={cn(
                  "relative max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-800 text-gray-100 rounded-bl-none"
                )}
              >
                {!isMe && showAvatar && (
                  <div className="mb-1 text-xs font-bold text-gray-400 select-none">
                    {msg.author}
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
              </div>
            </div>
          );
        })}
      </main>

      {/* Input Area */}
      <footer className="border-t border-gray-800 bg-gray-900/50 p-4 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex gap-2 items-center max-w-4xl mx-auto">
          <input
            autoFocus
            type="text"
            className="flex-1 rounded-full border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            placeholder="iMessage"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}

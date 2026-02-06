import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./lib/utils";

interface GroupDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    participants: string[];
    avatars: Record<string, string>;
}

export default function GroupDetails({ isOpen, onClose, participants, avatars }: GroupDetailsProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
                    />

                    {/* Details Panel */}
                    <motion.div
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 top-0 z-50 bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-b-3xl shadow-xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header Drag/Tap Handle Area */}
                        <div
                            className="absolute top-0 inset-x-0 h-14 flex items-center justify-center cursor-pointer"
                            onClick={onClose}
                        >
                            <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mt-3" />
                        </div>

                        {/* Done Button */}
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={onClose}
                                className="text-[#007AFF] font-semibold text-[17px] py-2 px-1"
                            >
                                Done
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pt-10 pb-6 hide-scrollbar">
                            <div className="p-4 flex flex-col items-center">
                                <div className="mt-8 flex items-center justify-center -space-x-4 mb-4">
                                    {participants.slice(0, 3).map((char, i) => (
                                        <div key={char} className={cn("relative z-10", i === 1 && "z-20 -mt-2")}>
                                            <img
                                                src={avatars[char]}
                                                alt={char}
                                                className="w-16 h-16 rounded-full border-2 border-white dark:border-black bg-gray-200 object-cover shadow-sm"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    {participants.length} People
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                                        <path d="M2 3L5 6L8 3" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </h2>

                                {/* Actions Grid */}
                                <div className="flex gap-4 mb-8 w-full justify-center px-4">
                                    <ActionButton icon="message" label="message" active />
                                    <ActionButton icon="call" label="audio" />
                                    <ActionButton icon="video" label="video" />
                                    <ActionButton icon="mail" label="mail" />
                                </div>

                                {/* Participants List */}
                                <div className="w-full">
                                    <div className="bg-white dark:bg-[#2C2C2E] rounded-xl overflow-hidden mb-8">
                                        {participants.map((person, i) => (
                                            <div key={person} className="relative">
                                                <div className="flex items-center gap-3 p-3 z-10 relative bg-white dark:bg-[#2C2C2E]">
                                                    <img src={avatars[person]} alt={person} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-[17px]">{person}</div>
                                                        <div className="text-[13px] text-[#8E8E93]">mobile</div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <ActionIcon type="message" />
                                                        <ActionIcon type="video" />
                                                    </div>
                                                </div>
                                                {i !== participants.length - 1 && (
                                                    <div className="absolute bottom-0 right-0 left-16 h-[1px] bg-gray-100 dark:bg-[#3A3A3C]" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="px-0">
                                        <button onClick={onClose} className="w-full bg-white dark:bg-[#2C2C2E] text-[#FF3B30] font-medium py-3 rounded-xl text-[17px]">
                                            Leave this Conversation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function ActionButton({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
    return (
        <div className={cn("flex flex-col items-center gap-1 flex-1 min-w-[70px]", !active && "opacity-50")}>
            <div className="w-[50px] h-[50px] rounded-full bg-[#F2F2F7] dark:bg-[#3A3A3C] flex items-center justify-center text-[#007AFF]">
                {icon === 'message' && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4a2 2 0 00-2 2v12a2 2 0 002 2h14l4 4V4a2 2 0 00-2-2zM4 16V4h16v12H4z" />
                    </svg>
                )}
                {icon === 'call' && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.161 15.161 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 13.81 13.81 0 0014.62 14.62c.55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                    </svg>
                )}
                {icon === 'video' && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                    </svg>
                )}
                {icon === 'mail' && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                )}
            </div>
            <span className="text-[11px] text-[#007AFF] font-medium">{label}</span>
        </div>
    )
}

function ActionIcon({ type }: { type: 'message' | 'video' }) {
    return (
        <div className="w-8 h-8 rounded-full bg-[#F2F2F7] dark:bg-[#3A3A3C] flex items-center justify-center text-[#007AFF]">
            {type === 'message' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                </svg>
            )}
            {type === 'video' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
            )}
        </div>
    )
}

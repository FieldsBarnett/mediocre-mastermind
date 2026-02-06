// Short "pop" sound for sending
// const SENT_SOUND = ... (currently using mixkit URL)

// Short "ding" sound for receiving
// const RECEIVED_SOUND = ... (currently using mixkit URL)

export const playSentSound = () => {
    try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"); // Using a real URL for now for demo purposes
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed (interaction needed first?):", e));
    } catch (e) {
        console.error("Error playing sent sound", e);
    }
};

export const playReceivedSound = () => {
    try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"); // Using a real URL for now for demo purposes
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed:", e));
    } catch (e) {
        console.error("Error playing received sound", e);
    }
};

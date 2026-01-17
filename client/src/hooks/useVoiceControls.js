import { useCallback } from 'react';
import { showAlert } from '../utils/utils';

/**
 * Voice control hook for participant calendar
 *
 * Exposes `speak` and `startVoiceRecognition` while encapsulating command processing.
 */
export function useVoiceControls({
    events,
    basket,
    validateCommitments,
    onCheckout,
    showOnlyWheelchairAccessible,
    setShowOnlyWheelchairAccessible,
    setAlert,
    setIsListening,
    setVoiceCommand,
    setIsBasketOpen,
}) {
    const speak = useCallback((text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }, []);

    const processVoiceCommand = useCallback((command) => {
        const c = command.toLowerCase();

        // Toggle wheelchair accessible events
        if (c.includes('wheelchair') || c.includes('accessible')) {
            setShowOnlyWheelchairAccessible(!showOnlyWheelchairAccessible);
            speak(showOnlyWheelchairAccessible ? 'Showing all events' : 'Showing only wheelchair accessible events');
            return;
        }

        // Show basket
        if (c.includes('show basket') || c.includes('my selection')) {
            if (basket.length > 0) {
                setIsBasketOpen(true);
                speak(`You have ${basket.length} activities in your selection`);
            } else {
                speak('Your basket is empty');
            }
            return;
        }

        // Confirm and checkout
        if (c.includes('confirm') || c.includes('checkout') || c.includes('check out')) {
            if (basket.length > 0) {
                const validation = validateCommitments(basket);
                if (!validation.valid) {
                    speak(`Sorry, ${validation.msg}. Please adjust your selection.`);
                    return;
                }
                onCheckout();
                speak('Please review your selection');
            } else {
                speak('Your basket is empty. Please select activities first.');
            }
            return;
        }

        // Read available events
        if (c.includes('read events') || c.includes('detail events')) {
            const eventTitles = (events || []).slice(0, 5).map(e => e.title).join(', ');
            speak(eventTitles ? `Available events include: ${eventTitles}` : 'No events available to read');
            return;
        }

        // Help command
        if (c.includes('help')) {
            speak('You can say: show wheelchair events, show basket, confirm registration, or detail events.');
            return;
        }

        // Default
        speak("Sorry, I didn't understand that command. Say help for available commands.");
    }, [events, basket, onCheckout, showOnlyWheelchairAccessible, setShowOnlyWheelchairAccessible, setIsBasketOpen, speak, validateCommitments]);

    const startVoiceRecognition = useCallback(() => {
        const hasRecognition = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
        if (!hasRecognition) {
            showAlert(setAlert, 'Voice recognition not supported in this browser. Please use Chrome or Edge.', 'error');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            speak('Listening for your command');
        };

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            setVoiceCommand(command);
            processVoiceCommand(command);
        };

        recognition.onerror = () => {
            setIsListening(false);
            showAlert(setAlert, 'Voice recognition error. Please try again.', 'error');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [processVoiceCommand, setIsListening, setAlert, speak, setVoiceCommand]);

    return { speak, startVoiceRecognition };
}

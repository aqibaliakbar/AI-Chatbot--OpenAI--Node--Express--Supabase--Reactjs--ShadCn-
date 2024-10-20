import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, VolumeX, Volume2 } from "lucide-react";

export const VoiceInterface = ({ onSpeechRecognized, onTextToSpeech }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        onSpeechRecognized(transcript);
      };
      setSpeechRecognition(recognition);
    }
  }, [onSpeechRecognized]);

  const toggleListening = () => {
    if (isListening) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
    }
    setIsListening(!isListening);
  };

  const speak = (text) => {
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "default"}
        className="flex items-center"
      >
        {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
        {isListening ? "Stop" : "Start"} Listening
      </Button>
      <Button
        onClick={() => onTextToSpeech(speak)}
        variant="outline"
        className="flex items-center"
        disabled={isSpeaking}
      >
        {isSpeaking ? (
          <VolumeX className="mr-2" />
        ) : (
          <Volume2 className="mr-2" />
        )}
        {isSpeaking ? "Speaking..." : "Speak Last Response"}
      </Button>
    </div>
  );
};

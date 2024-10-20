import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAI } from "../hooks/useAI";
import { useChatSessions } from "../contexts/ChatSessionsContext";

const personalities = [
  { id: "analyst", name: "Data Analyst" },
  { id: "teacher", name: "Teacher" },
  { id: "creative", name: "Creative Writer" },
  { id: "coder", name: "Programmer" },
];

export const PersonalitySelector = () => {
  const { setCurrentPersonality, currentPersonality } = useAI();
  const { currentSession, setSessionPersonality } = useChatSessions();

  const handlePersonalityChange = (personalityId) => {
    setCurrentPersonality(personalityId);
    if (currentSession) {
      setSessionPersonality(currentSession.id, personalityId);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={currentPersonality}
      onValueChange={handlePersonalityChange}
      className="flex flex-wrap justify-center gap-2"
    >
      {personalities.map((personality) => (
        <ToggleGroupItem
          key={personality.id}
          value={personality.id}
          className="px-3 py-2 text-sm"
        >
          {personality.name}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

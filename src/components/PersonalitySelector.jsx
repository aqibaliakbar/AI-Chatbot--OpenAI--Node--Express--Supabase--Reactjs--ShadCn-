import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useChatSessions } from "../contexts/ChatSessionsContext";
import { useAI } from "../hooks/useAI";

export const PersonalitySelector = () => {
  const { currentSession, updateSessionPersonality } = useChatSessions();
  const { setCurrentPersonality } = useAI();

  const handlePersonalityChange = (value) => {
    if (currentSession) {
      console.log(`Changing personality to: ${value}`);
      updateSessionPersonality(currentSession.id, value);
      setCurrentPersonality(value);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">AI Personality:</span>
      <Select
        value={currentSession?.personality || "default"}
        onValueChange={handlePersonalityChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select personality" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default Assistant</SelectItem>
          <SelectItem value="analyst">Data Analyst</SelectItem>
          <SelectItem value="teacher">Teacher</SelectItem>
          <SelectItem value="creative">Creative Writer</SelectItem>
          <SelectItem value="programmer">Programmer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

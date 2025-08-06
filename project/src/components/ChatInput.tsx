import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 자동완성 API 호출
  const fetchAutocomplete = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`/api/keywords/autocomplete?q=${encodeURIComponent(query)}`);
      const data = res.data;
      if (Array.isArray(data)) {
        setSuggestions(data);
      } else if (Array.isArray(data?.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("자동완성 API 실패", error);
      setSuggestions([]);
    }
  };

  // 메시지 입력시 자동완성 호출
  useEffect(() => {
    fetchAutocomplete(message);
  }, [message]);

  // 검색 실행 함수 (직접 입력 or 자동완성 클릭)
  const executeSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed || disabled) return;

    try {
      await axios.get(`/api/search?q=${encodeURIComponent(trimmed)}`);
    } catch (error) {
      console.error("검색 API 실패", error);
    }

    // 메시지 부모 컴포넌트로 전달
    onSendMessage(trimmed);
    setMessage("");
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      executeSearch(message);
    }
  };

  const handleSuggestionClick = (word: string) => {
    executeSearch(word);
  };

  // 자동완성 영역 외 클릭 시 닫기 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-4 border-t border-border bg-background/95 backdrop-blur" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="무엇이든 물어보세요..."
              className="min-h-[44px] max-h-32 resize-none pr-12 py-3 bg-input border-border focus:ring-primary focus:border-primary transition-smooth rounded-xl"
              disabled={disabled}
              autoComplete="off"
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent/50"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent/50"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>

            {/* 자동완성 리스트 */}
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white rounded-md shadow-lg z-50 text-left">
                {suggestions.map((word, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(word)}
                  >
                    {word}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="h-11 w-11 p-0 bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-soft rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;

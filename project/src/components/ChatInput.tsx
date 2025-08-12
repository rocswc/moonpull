import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios, { CancelTokenSource } from "axios";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const DEBOUNCE_MS = 250;   // 과호출 방지
const MIN_LEN = 1;         // edge_ngram min_gram=1이면 1도 OK (원하면 2로 올리세요)

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false); // 한글 조합 중
  const containerRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<CancelTokenSource | null>(null);
  const timerRef = useRef<number | null>(null);

  const fetchAutocomplete = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < MIN_LEN) {
      setSuggestions([]);
      setHighlighted(-1);
      return;
    }
    // 직전 요청 취소
    cancelRef.current?.cancel("new request");
    cancelRef.current = axios.CancelToken.source();

    try {
      setLoading(true);
      const res = await axios.get(
        `/api/keywords/autocomplete?q=${encodeURIComponent(query)}`,
        { cancelToken: cancelRef.current.token }
      );
      const data = res.data;
      const list = Array.isArray(data) ? data :
                   Array.isArray(data?.suggestions) ? data.suggestions : [];
      setSuggestions(list);
      setHighlighted(list.length > 0 ? 0 : -1);
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error("자동완성 API 실패", err);
        setSuggestions([]);
        setHighlighted(-1);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 디바운스 + 한글 조합 중에는 호출 안 함
  useEffect(() => {
    if (isComposing) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      fetchAutocomplete(message);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [message, isComposing, fetchAutocomplete]);

  // 자동완성 영역 외 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const executeSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed || disabled) return;

    try {
      await axios.get(`/api/search?q=${encodeURIComponent(trimmed)}`);
    } catch (error) {
      console.error("검색 API 실패", error);
    }

    onSendMessage(trimmed);
    setMessage("");
    setSuggestions([]);
    setHighlighted(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 하이라이트 항목이 있으면 그걸 사용
    if (highlighted >= 0 && suggestions[highlighted]) {
      executeSearch(suggestions[highlighted]);
    } else {
      executeSearch(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isComposing) return; // 조합 중에는 키 처리 안 함

    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Escape") {
        setSuggestions([]);
        setHighlighted(-1);
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (highlighted >= 0 && suggestions[highlighted]) {
          executeSearch(suggestions[highlighted]);
          return;
        }
      }
    }
    // 제안이 없을 때 기본 Enter 처리
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      executeSearch(message);
    }
  };

  const handleSuggestionClick = (word: string) => {
    executeSearch(word);
  };

  return (
    <div className="p-4 border-t border-border bg-background/95 backdrop-blur" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="무엇이든 물어보세요..."
              className="min-h-[44px] max-h-32 resize-none pr-12 py-3 bg-input border-border focus:ring-primary focus:border-primary transition-smooth rounded-xl"
              disabled={disabled}
              autoComplete="off"
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/50">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/50">
                <Mic className="h-4 w-4" />
              </Button>
            </div>

            {/* 자동완성 리스트 */}
			{(suggestions.length > 0 || loading) && (
			  <ul
			    className="
			      absolute left-0 right-0 bottom-full mb-2  /* 위로 뜨게 */
			      max-h-60 overflow-y-auto                 /* 너무 길면 스크롤 */
			      bg-white rounded-md shadow-lg z-50 text-left border border-border
			      overscroll-contain
			    "
			    style={{ minHeight: suggestions.length >= 3 ? 132 : undefined }} // 3행 ≈ 132px
			  >
			    {loading && (
			      <li className="px-4 py-2 text-sm text-muted-foreground">불러오는 중…</li>
			    )}
			    {!loading &&
			      suggestions.map((word, idx) => (
			        <li
			          key={`${word}-${idx}`}
			          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
			          onClick={() => handleSuggestionClick(word)}
			        >
			          {word}
			        </li>
			      ))
			    }
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

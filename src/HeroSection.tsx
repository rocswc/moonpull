import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, UploadCloud, Globe } from "lucide-react";
import { useKeywordStore } from "@/store/useKeywordStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useTranslation } from "@/hooks/useTranslation";
import axios from "axios";

const HeroSection = () => {
  const [keyword, setKeyword] = useState("");
  const [fileText, setFileText] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { trendingKeywords, fetchTrending } = useKeywordStore();
  const { language, setLanguage } = useLanguageStore();
  const { t, loading } = useTranslation(language);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const handleSearch = async (customKeyword?: string) => {
    const base = customKeyword ?? keyword;
    const fullText = `${base} ${fileText}`.trim();

    if (!fullText) return;

    navigate(`/chat-interface`, { state: { initialMessage: fullText } });
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setFileText(text);
      setPreviewText(text.slice(0, 500));
    };

    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      alert("텍스트 파일(.txt)만 업로드 가능합니다.");
    }
  };

  const handleKeywordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);

    if (value.trim()) {
      try {
        const res = await axios.get(`/api/keywords/autocomplete?q=${encodeURIComponent(value)}`);
        const data = res.data;

        if (Array.isArray(data)) {
          setSuggestions(data);
        } else if (Array.isArray(data?.suggestions)) {
          setSuggestions(data.suggestions);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("자동완성 실패", err);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleKeywordClick = (word: string) => {
    setKeyword(word);
    setFileText("");
    handleSearch(word);
  };

  // 입력창 클릭 시도 chat-interface로 이동, 기본 메시지 전달
  const handleInputClick = () => {
    navigate("/chat-interface", { state: { initialMessage: "배우고 싶은 분야에 대해 알려주세요" } });
  };

  // 언어 변경 핸들러
  const handleLanguageChange = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  if (loading) {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary-glow to-accent">
        <div className="text-white text-xl">로딩 중...</div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary-glow to-accent">
      <div className="absolute inset-0 bg-gradient-subtle opacity-30" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl w-full px-6 py-20 text-center">
        {/* 언어 변경 버튼 */}
        <div className="absolute top-4 right-4">
          <Button
            onClick={handleLanguageChange}
            variant="outline"
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
          >
            <Globe className="h-4 w-4 mr-2" />
            {language === 'ko' ? '한국어' : 'English'}
          </Button>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              {t("mainHeading")}
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {t("subHeading1")}
            </p>
            <p className="text-lg text-white/70">{t("subHeading2")}</p>
          </div>

          <div className="max-w-2xl mx-auto pt-8 relative">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={keyword}
                onChange={handleKeywordChange}
                onKeyDown={handleKeyDown}
                onClick={handleInputClick}
                className="flex-1 px-6 py-4 text-lg rounded-full border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20 bg-white/95 backdrop-blur-sm"
              />
              <Button
                size="icon"
                onClick={() => handleSearch()}
                className="rounded-full w-12 h-12 bg-gradient-primary hover:scale-105"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                onClick={handleFileButtonClick}
                className="rounded-full w-12 h-12 bg-gradient-primary hover:scale-105"
              >
                <UploadCloud className="h-5 w-5" />
              </Button>
              <input
                type="file"
                accept=".txt"
                ref={fileInputRef}
                onChange={handleFileUpload}
                hidden
              />
            </div>

            {Array.isArray(suggestions) && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white shadow-lg rounded-xl z-50 text-left">
                <ul className="max-h-60 overflow-y-auto">
                  {suggestions.map((word, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleKeywordClick(word)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {word}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {previewText && (
            <div className="mt-4 bg-white/90 rounded-xl p-4 text-sm text-left shadow-md max-h-60 overflow-y-auto">
              <p className="font-bold mb-2 text-gray-800">파일 미리보기</p>
              <pre className="whitespace-pre-wrap text-gray-600">{previewText}</pre>
            </div>
          )}

          {Array.isArray(trendingKeywords) && trendingKeywords.length > 0 && (
            <div className="mt-6">
              <p className="text-white/80 mb-2 text-sm">🔥 {t("popularSearches")}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {trendingKeywords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeywordClick(word)}
                    className="px-4 py-2 text-sm bg-white/80 text-gray-800 rounded-full hover:bg-white shadow-sm transition"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-5xl mx-auto">
            <CategoryCard
              icon="📚"
              title={t("subjectHistory")}
              description={t("historyDescription")}
              onClick={() => navigate("/chat-interface", { state: { initialMessage: "한국사에 대해 알려주세요" } })}
            />
            <CategoryCard
              icon="✏️"
              title={t("subjectKorean")}
              description={t("koreanDescription")}
              onClick={() => navigate("/chat-interface", { state: { initialMessage: "국어에 대해 알려주세요" } })}
            />
            <CategoryCard
              icon="🔢"
              title={t("subjectMath")}
              description={t("mathDescription")}
              onClick={() => navigate("/chat-interface", { state: { initialMessage: "수학에 대해 알려주세요" } })}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const CategoryCard = ({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 hover:transform hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
    >
      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-3xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default HeroSection;

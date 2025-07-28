import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ axios 추가

const FeatureSection = () => {
  const navigate = useNavigate();

  // ✅ 실시간 인기 검색어 상태 추가
  const [popularSearches, setPopularSearches] = useState<string[]>([]);

  useEffect(() => {
    axios.get("/api/keywords/trending")
      .then(res => {
        if (Array.isArray(res.data)) {
          setPopularSearches(res.data);
        } else {
          setPopularSearches([]);
        }
      })
      .catch(err => {
        console.error("실시간 인기검색어 불러오기 실패", err);
        setPopularSearches([]);
      });
  }, []);

  const topMentors = [
    { name: "김철수 멘토", rating: 4.9, avatar: "김", subject: "한국사" },
    { name: "이영희 멘토", rating: 4.8, avatar: "이", subject: "국어" },
    { name: "박민수 멘토", rating: 4.7, avatar: "박", subject: "수학" },
    { name: "정지우 멘토", rating: 4.6, avatar: "정", subject: "과학" },
    { name: "최수진 멘토", rating: 4.5, avatar: "최", subject: "영어" }
  ];

  const handleKeywordClick = (word: string) => {
    const encoded = encodeURIComponent(word.trim());
    navigate(`/search?query=${encoded}`);
  };

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">

        {/* Real-time Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">

          {/* Popular Searches */}
          <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-2xl">🔥</div>
              <h3 className="text-2xl font-bold text-foreground">실시간 인기검색어</h3>
            </div>
            <div className="space-y-3">
              {popularSearches.map((search, index) => (
                <div
                  key={index}
                  onClick={() => handleKeywordClick(search)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-gradient-primary text-primary-foreground">
                    {index + 1}
                  </Badge>
                  <span className="text-foreground font-medium">{search}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Mentors */}
          <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-2xl">⭐</div>
              <h3 className="text-2xl font-bold text-foreground">실시간 멘토 랭킹</h3>
            </div>
            <div className="space-y-3">
              {topMentors.map((mentor, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-gradient-primary text-primary-foreground">
                      {index + 1}
                    </Badge>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        {mentor.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{mentor.name}</div>
                        <div className="text-sm text-muted-foreground">{mentor.subject}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{mentor.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Matching Service Section (기존 그대로 유지) */}
        {/* ... 생략 ... */}
        
      </div>
    </section>
  );
};

export default FeatureSection;

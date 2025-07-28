import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ 추가

const FeatureSection = () => {
  const navigate = useNavigate(); // ✅ 추가

  const popularSearches = [
    "한국사 조선시대", "수학 미적분", "국어 문법", "한국사 근현대사",
    "수학 확률과 통계", "국어 독해", "한국사 고대사"
  ];

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
                  onClick={() => handleKeywordClick(search)} // ✅ 클릭 시 검색 페이지로 이동
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

        {/* Matching Service Section */}
        <div className="bg-gradient-to-br from-muted/50 via-background to-primary/5 rounded-3xl p-12">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-3">Custom AI Matching Service</p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              멘토 멘티 1대1 질문을 실시간으로<br />
              <span className="text-primary">오직 문풀에서만</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Korean History */}
            <div className="bg-gradient-to-br from-primary via-primary-glow to-accent rounded-2xl p-8 text-white hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer shadow-lg">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-3">한국사</h3>
              <p className="mb-4 opacity-90">조선시대부터 현대사까지<br />체계적인 한국사 학습</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">퀴즈 챗봇</Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">오답 노트</Badge>
              </div>
            </div>

            {/* Korean Language */}
            <div className="bg-gradient-to-br from-pink-400 via-pink-500 to-red-500 rounded-2xl p-8 text-white hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer shadow-lg">
              <div className="text-5xl mb-4">✏️</div>
              <h3 className="text-2xl font-bold mb-3">국어</h3>
              <p className="mb-4 opacity-90">문법, 독해, 작문까지<br />국어 실력 향상 코칭</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">퀴즈 챗봇</Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">오답 노트</Badge>
              </div>
            </div>

            {/* Math */}
            <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 rounded-2xl p-8 text-white hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer shadow-lg">
              <div className="text-5xl mb-4">🔢</div>
              <h3 className="text-2xl font-bold mb-3">수학</h3>
              <p className="mb-4 opacity-90">기초부터 심화까지<br />단계별 수학 학습</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">퀴즈 챗봇</Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">오답 노트</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;

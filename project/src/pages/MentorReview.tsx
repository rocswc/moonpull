import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, User } from "lucide-react";

const MentorReview = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [mentorInfo, setMentorInfo] = useState({
    id: 201, // 실제 존재하는 이재건 멘토 ID
    name: "",
    introduction: "",
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  const menteeId = 2;

  // 멘토 정보 가져오기
  useEffect(() => {
    const fetchMentorInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/mentor-review/mentor/${mentorInfo.id}`, {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setMentorInfo({
            id: data.mentor_id,
            name: data.name,
            introduction: data.introduction,
            averageRating: data.averageRating,
          });
        } else {
          console.error("멘토 정보 조회 실패");
          alert("멘토 정보를 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("멘토 정보 조회 중 오류:", error);
        alert("멘토 정보 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMentorInfo();
  }, []);

  // 피드백 입력 핸들러
  const handleFeedbackChange = (e) => {
    const value = e.target.value;
    console.log("피드백 입력:", value); // 디버깅용
    setFeedback(value);
  };

  //API 경로 
  const submitReview = async () => {
    if (rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }

    if (!feedback.trim()) {
      alert("피드백을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/mentor-review/insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating,
          feedback,
          menteeId,
          mentorId: mentorInfo.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`리뷰 저장 실패: ${errorData}`);
      }

      alert("리뷰가 성공적으로 저장되었습니다!");
      setRating(0);
      setFeedback("");
    } catch (error) {
      console.error("리뷰 저장 오류:", error);
      alert("리뷰 저장 중 오류 발생: " + error.message);
    }
  };

  useEffect(() => {
    console.log("=== MentorReview 컴포넌트 마운트됨 ===");
    console.log("멘토 정보:", mentorInfo);
    console.log("별점 상태:", rating);
    console.log("피드백 내용:", feedback);
  }, [mentorInfo, rating, feedback]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <Navigation />
        <div className="flex max-w-7xl mx-auto px-6 py-10 gap-8 min-h-[900px]">
          <aside className="w-64 bg-background/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 space-y-4 min-h-full border border-border/50">
            <h2 className="text-xl font-bold mb-4 text-foreground">마이페이지</h2>
            <nav className="flex flex-col gap-3">
              <Link to="/profileEdit">
                <Button variant="outline" className="justify-start w-full">정보 수정</Button>
              </Link>
              <Link to="/subscription">
                <Button variant="outline" className="justify-start w-full">구독 현황</Button>
              </Link>
              <Link to="/mypage">
                <Button variant="outline" className="justify-start w-full">학습 현황</Button>
              </Link>
              <Link to="/mentorReview">
                <Button variant="outline" className="justify-start w-full">멘토 평가하기</Button>
              </Link>
            </nav>
          </aside>
          <main className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">멘토 정보를 불러오는 중...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="flex max-w-7xl mx-auto px-6 py-10 gap-8 min-h-[900px]">
        {/* 사이드바 */}
        <aside className="w-64 bg-background/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 space-y-4 min-h-full border border-border/50">
          <h2 className="text-xl font-bold mb-4 text-foreground">마이페이지</h2>
          <nav className="flex flex-col gap-3">
            <Link to="/profileEdit">
              <Button variant="outline" className="justify-start w-full">정보 수정</Button>
            </Link>
            <Link to="/subscription">
              <Button variant="outline" className="justify-start w-full">구독 현황</Button>
            </Link>
            <Link to="/mypage">
              <Button variant="outline" className="justify-start w-full">학습 현황</Button>
            </Link>
            <Link to="/mentorReview">
              <Button variant="outline" className="justify-start w-full">멘토 평가하기</Button>
            </Link>
          </nav>
        </aside>

        {/* 본문 */}
        <main className="flex-1 flex justify-center items-center">
          <div className="w-full max-w-2xl space-y-6 text-center bg-background/80 backdrop-blur-sm rounded-2xl shadow-lg p-10 border border-border/50">
            <h1 className="text-3xl font-bold text-foreground">멘토 평가하기</h1>
            <p className="text-muted-foreground">멘토에게 별점과 피드백을 남겨주세요.</p>

            {/* 멘토 정보 카드 */}
            <Card className="mb-6 border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <User className="w-5 h-5 text-primary" />
                  멘토 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-left text-red-500">
                    ��‍🏫 이름: {mentorInfo.name || "멘토 정보 없음"}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  {mentorInfo.introduction || "멘토 소개 정보가 없습니다."}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">⭐ 평균 평점:</span>
                  <span className="text-sm font-bold text-primary">{mentorInfo.averageRating}</span>
                </div>
              </CardContent>
            </Card>

            {/* 별점 선택 */}
            <div className="flex justify-center space-x-2 mt-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    (hover || rating) >= star ? "text-yellow-400" : "text-muted-foreground"
                  }`}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  fill={(hover || rating) >= star ? "currentColor" : "none"}
                />
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                선택한 별점: {rating}점
              </p>
            )}

            {/* 피드백 작성 */}
            <div className="mt-4">
              <Textarea
                placeholder="멘토에게 전하고 싶은 말을 입력하세요..."
                value={feedback}
                onChange={handleFeedbackChange}
                className="w-full bg-background/50 border-border/50 resize-none"
                rows={4}
                style={{ minHeight: "100px" }}
              />
              {feedback && (
                <p className="text-xs text-muted-foreground mt-1 text-left">
                  입력된 글자 수: {feedback.length}자
                </p>
              )}
            </div>

            {/* 제출 버튼 */}
            <Button 
              onClick={submitReview} 
              className="mt-6 w-full"
              disabled={rating === 0 || !feedback.trim()}
            >
              평가 제출
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MentorReview;
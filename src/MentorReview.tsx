import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MentoringProgress {
  mentoring_progress_id: number;
  mentor_id: number;
  mentor_name: string;
  chat_id: number | null;
  connection_status: string;
  start_date: string;
  end_date: string | null;
}

const MentorReview = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [mentorInfo, setMentorInfo] = useState({
    id: 0,
    name: "",
    introduction: "",
    experienceYears: 0,
    specialties: "",
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mentoringList, setMentoringList] = useState<MentoringProgress[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null);
  const [menteeInfo, setMenteeInfo] = useState<{menteeId: number, name: string} | null>(null);

  // 멘티 정보 가져오기
  const fetchMenteeInfo = async () => {
    try {
      const response = await fetch("/api/mentee/my-info", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setMenteeInfo(data);
        console.log("✅ 멘티 정보 조회 성공:", data);
      } else {
        console.error("멘티 정보 조회 실패");
      }
    } catch (error) {
      console.error("멘티 정보 조회 중 오류:", error);
    }
  };

  // 멘토링 중인 멘토 목록 가져오기
  const fetchMentoringList = async () => {
    if (!menteeInfo) return;

    try {
      const response = await fetch(`/api/mentoring/progress?menteeId=${menteeInfo.menteeId}`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        const activeMentorings = data.filter((item: MentoringProgress) => 
          item.connection_status !== "ended"
        );
        setMentoringList(activeMentorings);
        console.log("✅ 멘토링 목록 조회 성공:", activeMentorings);
      } else {
        console.error("멘토링 목록 조회 실패");
      }
    } catch (error) {
      console.error("멘토링 목록 조회 중 오류:", error);
    }
  };

  // 멘토 정보 가져오기
  const fetchMentorInfo = async (mentorId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mentor-review/mentor/${mentorId}`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setMentorInfo({
          id: data.mentor_id,
          name: data.name,
          introduction: data.introduction,
          experienceYears: data.experienceYears || 0,
          specialties: data.specialties || "",
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

  // 멘티 정보와 멘토링 목록 초기 로드
  useEffect(() => {
    const initializeData = async () => {
      await fetchMenteeInfo();
    };
    initializeData();
  }, []);

  // 멘티 정보가 로드되면 멘토링 목록 가져오기
  useEffect(() => {
    if (menteeInfo) {
      fetchMentoringList();
    }
  }, [menteeInfo]);

  // 선택된 멘토가 변경되면 멘토 정보 가져오기
  useEffect(() => {
    if (selectedMentorId) {
      fetchMentorInfo(selectedMentorId);
    } else {
      setMentorInfo({
        id: 0,
        name: "",
        introduction: "",
        experienceYears: 0,
        specialties: "",
        averageRating: 0,
      });
    }
  }, [selectedMentorId]);

  // 피드백 입력 핸들러
  const handleFeedbackChange = (e) => {
    const value = e.target.value;
    console.log("피드백 입력:", value);
    setFeedback(value);
  };

  // 멘토 선택 핸들러
  const handleMentorSelect = (mentorId: string) => {
    const id = parseInt(mentorId);
    setSelectedMentorId(id);
    setRating(0);
    setFeedback("");
  };

  // 리뷰 제출
  const submitReview = async () => {
    if (!selectedMentorId) {
      alert("멘토를 선택해주세요.");
      return;
    }

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
          mentorId: selectedMentorId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`리뷰 저장 실패: ${errorData}`);
      }

      alert("리뷰가 성공적으로 저장되었습니다!");
      setRating(0);
      setFeedback("");
      setSelectedMentorId(null);
    } catch (error) {
      console.error("리뷰 저장 오류:", error);
      alert("리뷰 저장 중 오류 발생: " + error.message);
    }
  };

  useEffect(() => {
    console.log("=== MentorReview 컴포넌트 마운트됨 ===");
    console.log("멘티 정보:", menteeInfo);
    console.log("멘토링 목록:", mentoringList);
    console.log("선택된 멘토 ID:", selectedMentorId);
    console.log("멘토 정보:", mentorInfo);
    console.log("별점 상태:", rating);
    console.log("피드백 내용:", feedback);
  }, [menteeInfo, mentoringList, selectedMentorId, mentorInfo, rating, feedback]);

  if (loading && selectedMentorId) {
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
            <p className="text-muted-foreground">멘토링 중인 멘토에게 별점과 피드백을 남겨주세요.</p>

            {/* 멘토 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2 text-left">
                평가할 멘토 선택
              </label>
              <Select onValueChange={handleMentorSelect} value={selectedMentorId?.toString() || ""}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="멘토를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {mentoringList.length === 0 ? (
                    <SelectItem value="no-mentors" disabled>
                      멘토링 중인 멘토가 없습니다
                    </SelectItem>
                  ) : (
                    mentoringList.map((mentoring) => (
                      <SelectItem key={mentoring.mentor_id} value={mentoring.mentor_id.toString()}>
                        {mentoring.mentor_name} (시작일: {mentoring.start_date?.slice(0, 10)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 멘토 정보 카드 */}
            {selectedMentorId && mentorInfo.id > 0 && (
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
                      👨‍🏫 이름: {mentorInfo.name || "멘토 정보 없음"}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <div className="mb-2">
                      <strong>경력:</strong> {mentorInfo.experienceYears}년
                    </div>
                    <div className="mb-2">
                      <strong>전문분야:</strong> {mentorInfo.specialties || "정보 없음"}
                    </div>
                    <div>
                      <strong>소개:</strong> {mentorInfo.introduction || "멘토 소개 정보가 없습니다."}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">⭐ 평균 평점:</span>
                    <span className="text-sm font-bold text-primary">{mentorInfo.averageRating}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 별점 선택 */}
            {selectedMentorId && (
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
            )}
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                선택한 별점: {rating}점
              </p>
            )}

            {/* 피드백 작성 */}
            {selectedMentorId && (
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
            )}

            {/* 제출 버튼 */}
            {selectedMentorId && (
              <Button 
                onClick={submitReview} 
                className="mt-6 w-full"
                disabled={rating === 0 || !feedback.trim()}
              >
                평가 제출
              </Button>
            )}

            {/* 멘토링 중인 멘토가 없는 경우 */}
            {mentoringList.length === 0 && menteeInfo && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  현재 멘토링 중인 멘토가 없습니다.
                </p>
                <Link to="/mypage">
                  <Button variant="outline">
                    멘티 페이지로 돌아가기
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MentorReview;

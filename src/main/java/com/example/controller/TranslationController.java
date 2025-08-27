package com.example.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/translations")
// CORS는 전역(SecurityConfig.cors)에서 관리. 여기서는 명시적 열람 오리진만 허용하고 credentials 허용과 충돌 피함
@CrossOrigin(origins = {
    "http://localhost:8888",
    "https://localhost:8888",
    "http://192.168.56.1:8888",
    "https://192.168.56.1:8888"
}, allowCredentials = "true")
public class TranslationController {

	@GetMapping("/{language}")
	public ResponseEntity<Map<String, Object>> getTranslations(@PathVariable String language) {
	    Map<String, Object> translations = new HashMap<>();
	    
	    if ("ko".equals(language)) {
	        translations.put("common", getKoreanCommon());
	        translations.put("navigation", getKoreanNavigation());
	        translations.put("mentee", getKoreanMentee());
	        translations.put("home", getKoreanHome());
	        translations.put("matching", getKoreanMatching());
	        translations.put("pricing", getKoreanPricing());
	                translations.put("wrongNote", getKoreanWrongNote());
        translations.put("mentor", getKoreanMentor());
    } else if ("en".equals(language)) {
        translations.put("common", getEnglishCommon());
        translations.put("navigation", getEnglishNavigation());
        translations.put("mentee", getEnglishMentee());
        translations.put("home", getEnglishHome());
        translations.put("matching", getEnglishMatching());
        translations.put("pricing", getEnglishPricing());
        translations.put("wrongNote", getEnglishWrongNote());
        translations.put("mentor", getEnglishMentor());
    } else {
        // 기본값 한국어
        translations.put("common", getKoreanCommon());
        translations.put("navigation", getKoreanNavigation());
        translations.put("mentee", getKoreanMentee());
        translations.put("home", getKoreanHome());
        translations.put("matching", getKoreanMatching());
        translations.put("pricing", getKoreanPricing());
        translations.put("wrongNote", getKoreanWrongNote());
        translations.put("mentor", getKoreanMentor());
	    }
	    
	    return ResponseEntity.ok(translations);
	}

    private Map<String, String> getKoreanCommon() {
        Map<String, String> common = new HashMap<>();
        common.put("loading", "로딩 중...");
        common.put("error", "오류가 발생했습니다");
        common.put("success", "성공");
        common.put("cancel", "취소");
        common.put("confirm", "확인");
        common.put("save", "저장");
        common.put("delete", "삭제");
        common.put("edit", "수정");
        return common;
    }

    private Map<String, String> getKoreanNavigation() {
        Map<String, String> navigation = new HashMap<>();
        navigation.put("mentorMatching", "멘토·멘티 매칭");
        navigation.put("subscription", "구독 서비스 안내");
        navigation.put("wrongNote", "오답노트");
        navigation.put("quiz", "퀴즈");
        navigation.put("mentorPage", "멘토페이지");
        navigation.put("menteePage", "멘티페이지");
        navigation.put("chatbot", "챗봇");
        navigation.put("myPage", "마이페이지");
        navigation.put("problemGenerator", "문제생성기");
        navigation.put("opicTest", "오픽테스트");
        navigation.put("chat", "채팅");
        navigation.put("login", "로그인");
        navigation.put("signup", "회원가입");
        navigation.put("logout", "로그아웃");
        navigation.put("welcome", "님 환영합니다");
        navigation.put("admin", "관리자");
        navigation.put("mentor", "멘토");
        navigation.put("mentee", "멘티");
        return navigation;
    }

    private Map<String, String> getKoreanMentee() {
        Map<String, String> mentee = new HashMap<>();
        mentee.put("mentoringStatus", "멘토링 중인 멘토 현황");
        mentee.put("endedMentoring", "종료된 멘토링");
        mentee.put("myQuestionStatus", "내 질문 현황");
        mentee.put("inProgress", "진행중");
        mentee.put("end", "종료하기");
        mentee.put("report", "신고하기");
        mentee.put("career", "경력");
        mentee.put("years", "년");
        mentee.put("answerHistory", "답변 기록");
        mentee.put("questionAnswerStats", "질문/답변 통계");
        
        // 추가 멘티 페이지 번역
        mentee.put("noMatchedMentors", "매칭된 멘토가 없습니다. 멘토를 찾아보세요!");
        mentee.put("noEndedMentoring", "종료된 멘토링이 없습니다.");
        mentee.put("noDate", "날짜 없음");
        mentee.put("inProgressStatus", "진행 중");
        
        // 질문 관련
        mentee.put("enterTitle", "제목을 입력하세요");
        mentee.put("enterContent", "질문 내용을 입력하세요");
        mentee.put("registerQuestion", "질문 등록");
        mentee.put("noRegisteredQuestions", "등록된 질문이 없습니다.");
        mentee.put("answer", "답변");
        mentee.put("noAnsweredQuestions", "답변 받은 질문이 없습니다.");
        mentee.put("answerComplete", "답변 완료");
        
        // 오답노트
        mentee.put("wrongNote", "오답노트");
        mentee.put("noWrongAnswers", "등록된 오답이 없습니다.");
        mentee.put("problem", "문제");
        mentee.put("myAnswer", "내 답");
        mentee.put("correctAnswer", "정답");
        mentee.put("explanation", "해설");
        
        // 통계
        mentee.put("recentStats", "최근 질문/답변 통계");
        mentee.put("questionCount", "질문 수");
        mentee.put("answerCount", "답변 수");
        
        // 알림 메시지
        mentee.put("enterTitleAndContent", "제목과 내용을 입력해주세요.");
        mentee.put("noMentoringMentor", "멘토링 중인 멘토가 없어서 질문을 등록할 수 없습니다.");
        mentee.put("questionRegistered", "질문이 등록되었습니다!");
        mentee.put("questionRegisterFailed", "질문 등록에 실패했습니다. 다시 시도해주세요.");
        mentee.put("mentoringEnded", "멘토링이 종료되었습니다.");
        mentee.put("mentoringEndFailed", "멘토링 종료 중 오류가 발생했습니다.");
        mentee.put("enterReportReason", "멘토를 신고하는 이유를 입력하세요:");
        mentee.put("reportSubmitted", "신고가 정상적으로 접수되었습니다.");
        mentee.put("reportFailed", "신고 처리 중 오류가 발생했습니다.");
        
        return mentee;
    }

    private Map<String, String> getEnglishCommon() {
        Map<String, String> common = new HashMap<>();
        common.put("loading", "Loading...");
        common.put("error", "An error occurred");
        common.put("success", "Success");
        common.put("cancel", "Cancel");
        common.put("confirm", "Confirm");
        common.put("save", "Save");
        common.put("delete", "Delete");
        common.put("edit", "Edit");
        return common;
    }

    private Map<String, String> getEnglishNavigation() {
        Map<String, String> navigation = new HashMap<>();
        navigation.put("mentorMatching", "Mentor-Mentee Matching");
        navigation.put("subscription", "Subscription Service");
        navigation.put("wrongNote", "Wrong Answer Note");
        navigation.put("quiz", "Quiz");
        navigation.put("mentorPage", "Mentor Page");
        navigation.put("menteePage", "Mentee Page");
        navigation.put("chatbot", "Chatbot");
        navigation.put("myPage", "My Page");
        navigation.put("problemGenerator", "Problem Generator");
        navigation.put("opicTest", "OPIc Test");
        navigation.put("chat", "Chat");
        navigation.put("login", "Login");
        navigation.put("signup", "Sign Up");
        navigation.put("logout", "Logout");
        navigation.put("welcome", "Welcome");
        navigation.put("admin", "Admin");
        navigation.put("mentor", "Mentor");
        navigation.put("mentee", "Mentee");
        return navigation;
    }

    private Map<String, String> getEnglishMentee() {
        Map<String, String> mentee = new HashMap<>();
        mentee.put("mentoringStatus", "Mentoring Mentor Status");
        mentee.put("endedMentoring", "Ended Mentoring");
        mentee.put("myQuestionStatus", "My Question Status");
        mentee.put("inProgress", "In Progress");
        mentee.put("end", "End");
        mentee.put("report", "Report");
        mentee.put("career", "Career");
        mentee.put("years", "years");
        mentee.put("answerHistory", "Answer History");
        mentee.put("questionAnswerStats", "Question/Answer Statistics");
        
        // 1Additional mentee page translations
        mentee.put("noMatchedMentors", "No matched mentors. Find a mentor!");
        mentee.put("noEndedMentoring", "No ended mentoring.");
        mentee.put("noDate", "No date");
        mentee.put("inProgressStatus", "In Progress");
        
        // Question related
        mentee.put("enterTitle", "Enter title");
        mentee.put("enterContent", "Enter question content");
        mentee.put("registerQuestion", "Register Question");
        mentee.put("noRegisteredQuestions", "No registered questions.");
        mentee.put("answer", "Answer");
        mentee.put("noAnsweredQuestions", "No answered questions.");
        mentee.put("answerComplete", "Answer Complete");
        
        // Wrong answer note
        mentee.put("wrongNote", "Wrong Answer Note");
        mentee.put("noWrongAnswers", "No registered wrong answers.");
        mentee.put("problem", "Problem");
        mentee.put("myAnswer", "My Answer");
        mentee.put("correctAnswer", "Correct Answer");
        mentee.put("explanation", "Explanation");
        
        // Statistics
        mentee.put("recentStats", "Recent Question/Answer Statistics");
        mentee.put("questionCount", "Question Count");
        mentee.put("answerCount", "Answer Count");
        
        // Alert messages
        mentee.put("enterTitleAndContent", "Please enter title and content.");
        mentee.put("noMentoringMentor", "Cannot register question because there is no mentoring mentor.");
        mentee.put("questionRegistered", "Question has been registered!");
        mentee.put("questionRegisterFailed", "Question registration failed. Please try again.");
        mentee.put("mentoringEnded", "Mentoring has ended.");
        mentee.put("mentoringEndFailed", "An error occurred while ending mentoring.");
        mentee.put("enterReportReason", "Enter the reason for reporting the mentor:");
        mentee.put("reportSubmitted", "Report has been submitted successfully.");
        mentee.put("reportFailed", "An error occurred while processing the report.");
        
        return mentee;
    }

    private Map<String, String> getKoreanHome() {
        Map<String, String> home = new HashMap<>();
        home.put("popularSearches", "실시간 인기검색어");
        home.put("topMentors", "실시간 멘토 랭킹");
        home.put("subjectHistory", "한국사");
        home.put("subjectKorean", "국어");
        home.put("subjectMath", "수학");
        home.put("subjectScience", "과학");
        home.put("subjectEnglish", "영어");
        home.put("mainHeading", "한국사도, 국어도, 수학도, 해설까지 완벽하게");
        home.put("subHeading1", "문풀과 함께 시작하세요");
        home.put("subHeading2", "모든 분야의 전문가와 만나보세요");
        home.put("searchPlaceholder", "배우고 싶은 분야를 검색하세요...");
        home.put("historyDescription", "조선시대부터 현대사까지 체계적인 한국사 학습을 도와드립니다");
        home.put("koreanDescription", "문법, 독해, 작문까지 국어 실력 향상을 위한 맞춤 지도");
        home.put("mathDescription", "기초부터 심화까지 단계별 수학 학습 코칭");
        return home;
    }

    private Map<String, String> getKoreanMatching() {
        Map<String, String> matching = new HashMap<>();
        matching.put("title", "멘토 매칭 서비스");
        matching.put("subtitle1", "원하는 과목을 선택하세요");
        matching.put("subtitle2", "실시간으로 접속한 전문 멘토들과 1대1 매칭됩니다");
        matching.put("subjectHistory", "한국사");
        matching.put("subjectKorean", "국어");
        matching.put("subjectEnglish", "영어");
        matching.put("historyDescription", "조선시대부터 현대사까지 체계적인 한국사 학습");
        matching.put("koreanDescription", "문법, 독해, 작문까지 국어 실력 향상");
        matching.put("englishDescription", "회화, 문법, 독해 등 영어 실력 완성");
        matching.put("onlineMentors", "온라인 멘토");
        matching.put("findMentor", "멘토 찾기");
        matching.put("matchingMethod", "매칭 방법");
        matching.put("step1", "원하는 과목 선택");
        matching.put("step2", "실시간 온라인 멘토 확인");
        matching.put("step3", "매칭 후 즉시 1대1 대화");
        return matching;
    }

    private Map<String, String> getKoreanPricing() {
        Map<String, String> pricing = new HashMap<>();
        pricing.put("upgradeBadge", "QANDA Premium으로 업그레이드 해보세요");
        pricing.put("subtitle", "더 많은 질문과 답변을 얻고 싶다면 프리미엄을 사용해 보세요.");
        pricing.put("basicPlan", "1달 무료체험");
        pricing.put("plusPlan", "월간 플러스");
        pricing.put("premiumPlan", "연간 프리미엄");
        pricing.put("basic", "BASIC");
        pricing.put("plus", "PLUS");
        pricing.put("premium", "PREMIUM");
        pricing.put("free", "무료");
        pricing.put("monthly", "/ 월간");
        pricing.put("yearly", "/ 연간");
        pricing.put("freeTrial", "무료 체험");
        pricing.put("onetimePayment", "일시불 결제");
        pricing.put("subscriptionPayment", "자동결제 구독");
        pricing.put("discount", "₩20,000 할인");
        pricing.put("onetimeInfo", "한 번만 결제하고 1개월 이용");
        pricing.put("subscriptionInfo", "매월 자동 결제 (언제든 해지 가능)");
        pricing.put("cardNotSaved", "카드 정보는 저장되지 않아요");
        pricing.put("cancelAnytime", "구독 관리에서 언제든 해지 가능");
        pricing.put("popular", "인기");
        
        // Features
        pricing.put("feature1Title", "하루에 2번 제 질문 가능");
        pricing.put("feature1Desc", "AI 문제 풀이와 여러 문제 질착 가능을 하루에 2번만 이용할 수 있어요");
        pricing.put("feature2Title", "세 질문 당 2번 추가 질문 가능");
        pricing.put("feature2Desc", "AI 문제 풀이에서 추가 질문은 세 질문 당 2번만 이용할 수 있어요");
        pricing.put("feature3Title", "무제한 질문과 답변");
        pricing.put("feature3Desc", "AI 문제 풀이와 여러 문제 질착 가능을 제한없이 이용할 수 있어요");
        pricing.put("feature4Title", "다양 확장된 답변");
        pricing.put("feature4Desc", "더 독특한 AI 문제 풀이를 이용할 수 있어요");
        pricing.put("feature5Title", "모든 광고 제거");
        pricing.put("feature5Desc", "광고에 방해되는 요소 없이 집중할 수 있어요");
        pricing.put("feature6Title", "1:1 멘토님 선생님 질문");
        pricing.put("feature6Desc", "선생님에게 질문할 수 있는 10,000코인을 드려요");
        pricing.put("feature7Title", "무제한 무료 노트 필기 검화");
        pricing.put("feature7Desc", "자유롭게 필기 및 공재 틀이 적혀을 무료로 사용할 수 있어요!");
        
        // Buttons
        pricing.put("freeTrialButton", "무료 체험");
        pricing.put("monthlyButton", "1개월 이용하기");
        pricing.put("yearlyButton", "연간 구독 시작하기");
        
        // Footer
        pricing.put("footerNote", "질의 여러 문제 질착 / 등등상 풀이 / 1:1 선생님 질문은 량다 앱에서 사용할 수 있어요.");
        pricing.put("onetimeLegend", "일시불: 한 번만 결제");
        pricing.put("subscriptionLegend", "구독: 자동 갱신");
        
        return pricing;
    }

    private Map<String, String> getKoreanWrongNote() {
        Map<String, String> wrongNote = new HashMap<>();
        wrongNote.put("selectSubject", "과목을 선택하세요");
        wrongNote.put("subjectKorean", "국어");
        wrongNote.put("subjectHistory", "한국사");
        wrongNote.put("subjectEnglish", "영어");
        wrongNote.put("wrongNoteTitle", "오답노트");
        wrongNote.put("description", "틀린 문제를 체계적으로 복습하고 반복 학습하여 실력을 향상시켜보세요");
        wrongNote.put("totalQuestions", "총 문제 수");
        wrongNote.put("completedQuestions", "완료된 문제");
        wrongNote.put("accuracyRate", "정답률");
        wrongNote.put("wrongAnswerList", "📚 오답 목록");
        wrongNote.put("retry", "🔁 재도전");
        wrongNote.put("tip", "💡 꾸준한 복습이 실력 향상의 지름길입니다");
        return wrongNote;
    }

    private Map<String, String> getEnglishHome() {
        Map<String, String> home = new HashMap<>();
        home.put("popularSearches", "Trending Searches");
        home.put("topMentors", "Top Mentors");
        home.put("subjectHistory", "History");
        home.put("subjectKorean", "Korean");
        home.put("subjectMath", "Math");
        home.put("subjectScience", "Science");
        home.put("subjectEnglish", "English");
        home.put("mainHeading", "Korean History, Korean Language, Math, even explanations, perfectly");
        home.put("subHeading1", "Start with Munpul");
        home.put("subHeading2", "Meet experts in all fields");
        home.put("searchPlaceholder", "Search for the field you want to learn...");
        home.put("historyDescription", "We help with systematic Korean history learning from the Joseon Dynasty to modern history");
        home.put("koreanDescription", "Customized guidance for improving Korean language skills, including grammar, reading comprehension, and writing");
        home.put("mathDescription", "Step-by-step math learning coaching from basic to advanced");
        return home;
    }

    private Map<String, String> getEnglishMatching() {
        Map<String, String> matching = new HashMap<>();
        matching.put("title", "Mentor Matching Service");
        matching.put("subtitle1", "Select your desired subject");
        matching.put("subtitle2", "You will be matched 1:1 with expert mentors connected in real-time");
        matching.put("subjectHistory", "Korean History");
        matching.put("subjectKorean", "Korean Language");
        matching.put("subjectEnglish", "English");
        matching.put("historyDescription", "Systematic Korean history learning from the Joseon Dynasty to modern times");
        matching.put("koreanDescription", "Improve Korean language skills including grammar, reading comprehension, and writing");
        matching.put("englishDescription", "Complete English skills including conversation, grammar, reading comprehension, etc.");
        matching.put("onlineMentors", "Online Mentors");
        matching.put("findMentor", "Find Mentor");
        matching.put("matchingMethod", "Matching Method");
        matching.put("step1", "Select desired subject");
        matching.put("step2", "Check real-time online mentors");
        matching.put("step3", "Immediate 1:1 chat after matching");
        return matching;
    }

    private Map<String, String> getEnglishPricing() {
        Map<String, String> pricing = new HashMap<>();
        pricing.put("upgradeBadge", "Upgrade to QANDA Premium");
        pricing.put("subtitle", "Try Premium to get more questions and answers.");
        pricing.put("basicPlan", "1 Month Free Trial");
        pricing.put("plusPlan", "Monthly Plus");
        pricing.put("premiumPlan", "Annual Premium");
        pricing.put("basic", "BASIC");
        pricing.put("plus", "PLUS");
        pricing.put("premium", "PREMIUM");
        pricing.put("free", "Free");
        pricing.put("monthly", "/ Monthly");
        pricing.put("yearly", "/ Yearly");
        pricing.put("freeTrial", "Free Trial");
        pricing.put("onetimePayment", "One-time Payment");
        pricing.put("subscriptionPayment", "Auto-subscription");
        pricing.put("discount", "₩20,000 Discount");
        pricing.put("onetimeInfo", "Pay once and use for 1 month");
        pricing.put("subscriptionInfo", "Automatic monthly payment (can cancel anytime)");
        pricing.put("cardNotSaved", "Card information is not saved");
        pricing.put("cancelAnytime", "Can cancel anytime in subscription management");
        pricing.put("popular", "Popular");
        
        // Features
        pricing.put("feature1Title", "Can ask 2 questions per day");
        pricing.put("feature1Desc", "Can use AI problem solving and various problem-solving features only twice a day");
        pricing.put("feature2Title", "Can ask 2 additional questions per three questions");
        pricing.put("feature2Desc", "Additional questions in AI problem solving can only be used twice per three questions");
        pricing.put("feature3Title", "Unlimited questions and answers");
        pricing.put("feature3Desc", "Can use AI problem solving and various problem-solving features without limit");
        pricing.put("feature4Title", "Diverse expanded answers");
        pricing.put("feature4Desc", "Can use more unique AI problem solving");
        pricing.put("feature5Title", "Remove all ads");
        pricing.put("feature5Desc", "Can concentrate without elements interfering with ads");
        pricing.put("feature6Title", "1:1 Mentor teacher questions");
        pricing.put("feature6Desc", "Give 10,000 coins to ask teachers");
        pricing.put("feature7Title", "Unlimited free note-taking review");
        pricing.put("feature7Desc", "Can freely use note-taking and public templates for free!");
        
        // Buttons
        pricing.put("freeTrialButton", "Free Trial");
        pricing.put("monthlyButton", "Use for 1 month");
        pricing.put("yearlyButton", "Start annual subscription");
        
        // Footer
        pricing.put("footerNote", "Various problem-solving questions / etc. problem solving / 1:1 teacher questions can be used in the QANDA app.");
        pricing.put("onetimeLegend", "One-time: Pay once");
        pricing.put("subscriptionLegend", "Subscription: Auto renewal");
        
        return pricing;
    }

    private Map<String, String> getEnglishWrongNote() {
        Map<String, String> wrongNote = new HashMap<>();
        wrongNote.put("selectSubject", "Select a subject");
        wrongNote.put("subjectKorean", "Korean Language");
        wrongNote.put("subjectHistory", "Korean History");
        wrongNote.put("subjectEnglish", "English");
        wrongNote.put("wrongNoteTitle", "Wrong Answer Note");
        wrongNote.put("description", "Systematically review wrong questions and improve your skills through repeated learning");
        wrongNote.put("totalQuestions", "Total Questions");
        wrongNote.put("completedQuestions", "Completed Questions");
        wrongNote.put("accuracyRate", "Accuracy Rate");
        wrongNote.put("wrongAnswerList", "📚 Wrong Answer List");
        wrongNote.put("retry", "🔁 Retry");
        wrongNote.put("tip", "💡 Consistent review is the shortcut to improving your skills");
        return wrongNote;
    }

    private Map<String, String> getKoreanMentor() {
        Map<String, String> mentor = new HashMap<>();
        mentor.put("requestManagement", "멘토 요청 관리");
        mentor.put("noRequests", "들어온 요청이 없습니다.");
        mentor.put("age", "나이");
        mentor.put("accept", "수락");
        mentor.put("reject", "거절");
        mentor.put("mentoringMentees", "멘토링 중인 멘티");
        mentor.put("noMentoringMentees", "멘토링 중인 멘티가 없습니다.");
        mentor.put("accuracy", "정답률");
        mentor.put("wrongRate", "오답률");
        mentor.put("questionsAsked", "질문 횟수");
        mentor.put("inProgress", "진행중");
        mentor.put("report", "신고하기");
        mentor.put("endedMentoring", "종료된 멘토링");
        mentor.put("noEndedMentoring", "종료된 멘토링이 없습니다.");
        mentor.put("inProgressStatus", "진행 중");
        
        // 탭 메뉴
        mentor.put("todaysQuestions", "오늘의 질문");
        mentor.put("answerHistory", "답변 기록");
        mentor.put("notice", "공지사항");
        
        // 질문 관련
        mentor.put("noPendingQuestions", "답변 대기 중인 질문이 없습니다.");
        mentor.put("answerQuestion", "답변하기");
        mentor.put("questionAnswer", "질문 답변");
        mentor.put("enterAnswer", "답변 내용을 입력하세요...");
        mentor.put("register", "등록");
        mentor.put("cancel", "취소");
        mentor.put("noAnsweredQuestions", "답변한 질문이 없습니다.");
        mentor.put("answer", "답변");
        mentor.put("maintenanceMessage", "점검, 운영 메시지");
        
        // 알림 메시지
        mentor.put("acceptFailed", "요청 수락 실패");
        mentor.put("rejectFailed", "요청 거절 실패");
        mentor.put("enterReportReason", "멘티를 신고하는 이유:");
        mentor.put("reportSubmitted", "신고 접수됨");
        mentor.put("reportFailed", "신고 실패");
        mentor.put("answerRegisterFailed", "답변 등록 실패");
        
        return mentor;
    }

    private Map<String, String> getEnglishMentor() {
        Map<String, String> mentor = new HashMap<>();
        mentor.put("requestManagement", "Mentor Request Management");
        mentor.put("noRequests", "No requests have come in.");
        mentor.put("age", "Age");
        mentor.put("accept", "Accept");
        mentor.put("reject", "Reject");
        mentor.put("mentoringMentees", "Mentees in Mentoring");
        mentor.put("noMentoringMentees", "No mentees in mentoring.");
        mentor.put("accuracy", "Accuracy");
        mentor.put("wrongRate", "Wrong Rate");
        mentor.put("questionsAsked", "Questions Asked");
        mentor.put("inProgress", "In Progress");
        mentor.put("report", "Report");
        mentor.put("endedMentoring", "Ended Mentoring");
        mentor.put("noEndedMentoring", "No ended mentoring.");
        mentor.put("inProgressStatus", "In Progress");
        
        // Tab menu
        mentor.put("todaysQuestions", "Today's Questions");
        mentor.put("answerHistory", "Answer History");
        mentor.put("notice", "Notice");
        
        // Question related
        mentor.put("noPendingQuestions", "No questions waiting for answers.");
        mentor.put("answerQuestion", "Answer");
        mentor.put("questionAnswer", "Question Answer");
        mentor.put("enterAnswer", "Enter answer content...");
        mentor.put("register", "Register");
        mentor.put("cancel", "Cancel");
        mentor.put("noAnsweredQuestions", "No answered questions.");
        mentor.put("answer", "Answer");
        mentor.put("maintenanceMessage", "Maintenance, operation message");
        
        // Alert messages
        mentor.put("acceptFailed", "Request acceptance failed");
        mentor.put("rejectFailed", "Request rejection failed");
        mentor.put("enterReportReason", "Reason for reporting mentee:");
        mentor.put("reportSubmitted", "Report submitted");
        mentor.put("reportFailed", "Report failed");
        mentor.put("answerRegisterFailed", "Answer registration failed");
        
        return mentor;
    }
}

// AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
// ... 나머지 import

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/matching" element={<Matching />} />
    <Route path="/matching/:subject" element={<TeacherList />} />
    <Route path="/chat/:teacherId" element={<Chat />} />
    <Route path="/wrong-note" element={<WrongNotePage />} />
    <Route path="/quiz" element={<Quiz />} />
    <Route path="/mypage" element={<MyPage />} />
    <Route path="/profileEdit" element={<ProfileEdit />} />
    <Route path="/subscriptionStatus" element={<SubscriptionStatus />} />
    <Route path="/mentorReview" element={<MentorReview />} />
    <Route path="/search" element={<SearchResultPage />} />
    <Route path="/admin/logs" element={<LogMonitoring />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/mentor" element={<MentorPage />} />
    <Route path="/mentte" element={<MenteePage />} />
    <Route path="/chatbot" element={<MyChatBot />} />
    <Route path="/payment/checkout" element={<Checkout />} />
    <Route path="/payment/success" element={<Success />} />
    <Route path="/payment/fail" element={<Fail />} />
	<Route path="/auth/login" element={<AuthPage />} />
    <Route path="/auth/signup" element={<AuthPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
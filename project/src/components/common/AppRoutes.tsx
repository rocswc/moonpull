// AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Pricing from "@/pages/Pricing";
import Matching from "@/pages/Matching";
import TeacherList from "@/pages/TeacherList";
import Chat from "@/pages/Chat";
import WrongNotePage from "@/pages/WrongNotePage";
import Quiz from "@/pages/Quiz";
import MyPage from "@/pages/MyPage";
import ProfileEdit from "@/pages/ProfileEdit";
import SubscriptionStatus from "@/pages/SubscriptionStatus";
import MentorReview from "@/pages/MentorReview";
import SearchResultPage from "@/pages/SearchResultPage";
import LogMonitoring from "@/components//admin/LogMonitoring"; 
import AdminDashboard from "@/pages/AdminDashboard";
import MentorPage from "@/pages/MentorPage";
import MenteePage from "@/pages/MenteePage";
import MyChatBot from "@/components/MyChatBot"; // ❗주의: 이건 pages 폴더가 아니라 ui 폴더에 있음
import Checkout from "@/pages/Checkout";
import Success from "@/pages/Success";
import Fail from "@/pages/Fail";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
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
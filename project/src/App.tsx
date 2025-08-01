import { Toaster } from "@/components/ui/toaster"; 
import { Toaster as Sonner } from "@/components/ui/sonner"; 
import { TooltipProvider } from "@/components/ui/tooltip";  
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider, useChat } from "@/contexts/ChatContext";


import { AuthProvider } from "@/contexts/AuthContext";

import AdminDashboard from "./pages/AdminDashboard";
import UserListDrawer from "@/components/UserListDrawer";
import ChatRequestNotifications from "@/components/ChatRequestNotification";
import ChatWindow from "@/components/ChatWindow";
import LogMonitoring from "./components/admin/LogMonitoring";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import AuthPage from "./pages/AuthPage";
import Matching from "./pages/Matching";
import TeacherList from "./pages/TeacherList";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import WrongNotePage from "@/pages/WrongNotePage";
import Quiz from "./pages/Quiz";
import MyPage from "./pages/MyPage";
import ProfileEdit from "./pages/ProfileEdit";
import SubscriptionStatus from "./pages/SubscriptionStatus";
import MentorReview from "./pages/MentorReview";  
import SearchResultPage from "@/pages/SearchResultPage"
import MentorPage from "./pages/MentorPage";
import MenteePage from "./pages/MenteePage";
import MyChatBot from "./components/MyChatBot";
import Checkout from "./pages/Checkout"; 
import Success from "./pages/Success"; 
import Fail from "./pages/Fail"; 
const queryClient = new QueryClient();

const ChatComponents = () => {
  const { chatRooms } = useChat();
  
  return (
    <>
      <UserListDrawer />
      <ChatRequestNotifications />
      {chatRooms.map((room) => (
        <ChatWindow key={room.id} room={room} />
      ))}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
  <AuthProvider>
    <ChatProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
		  {/*  로그인/회원가입을 명확하게 나눔 */}
		  <Route path="/auth/login" element={<AuthPage />} />
		  <Route path="/auth/signup" element={<AuthPage />} />
		  
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/mentor" element={<MentorPage />} />
          <Route path="/mentte" element={<MenteePage />} />
          <Route path="/chatbot" element={<MyChatBot />} />       
          <Route path="/payment/checkout" element={<Checkout />} /> {/* 결제화면 호출 페이지 */}
          <Route path="/payment/success" element={<Success />} /> {/* 결제 성공 페이지 */}
          <Route path="/payment/fail" element={<Fail />} /> {/* 결제 실패 페이지 */}
          </Routes>
          <ChatComponents />
        </BrowserRouter>
      </TooltipProvider>
    </ChatProvider>
	</AuthProvider>
  </QueryClientProvider>
);

export default App;

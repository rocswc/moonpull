import { Toaster } from "@/components/ui/toaster"; 
import { Toaster as Sonner } from "@/components/ui/sonner"; 
import { TooltipProvider } from "@/components/ui/tooltip";  
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider, useChat } from "@/contexts/ChatContext";
import PrivateRoute from "@/components/common/PrivateRoute";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
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
import PaymentSubscribe from "./pages/PaymentSubscribe"; 
import ChatInterface from"@/components/ChatInterface"    

import SocialJoinPage from "./components/socialLogin/SocialJoinPage";
import ProblemGeneratorApp from "./pages/ProblemGeneratorApp";
import Opictest from "./pages/Opictest";
import React from "react";
import { useFcm } from "./fcm"; 
import { useAuth } from "@/contexts/AuthContext"; 
const queryClient = new QueryClient();

const ChatComponents = () => {
  const { chatRooms } = useChat();
  const { user  } = useAuth();   // ✅ 로그인된 유저 정보
  useFcm({ currentUser: user });       
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
const App = () => {
  useFcm(); // 👈 여기서 실행 (정상 위치)

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                {/* 로그인/회원가입 */}
                <Route path="/auth/login" element={<AuthPage />} />
                <Route path="/auth/signup" element={<AuthPage />} />
                <Route path="/auth/social-join" element={<SocialJoinPage />} />

                {/* 메인 페이지 */}
                <Route path="/" element={<Index />} />

                {/* 로그인 필요한 페이지들 */}
                <Route path="/pricing" element={<PrivateRoute><Pricing /></PrivateRoute>} />
                <Route path="/matching" element={<PrivateRoute><Matching /></PrivateRoute>} />
                <Route path="/matching/:subject" element={<PrivateRoute><TeacherList /></PrivateRoute>} />
                <Route path="/chat/:teacherId" element={<PrivateRoute><Chat /></PrivateRoute>} />
                <Route path="/wrong-note" element={<PrivateRoute><WrongNotePage /></PrivateRoute>} />
                <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
                <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
                <Route path="/profileEdit" element={<PrivateRoute><ProfileEdit /></PrivateRoute>} />
                <Route path="/subscriptionStatus" element={<PrivateRoute><SubscriptionStatus /></PrivateRoute>} />
                <Route path="/mentorReview" element={<PrivateRoute><MentorReview /></PrivateRoute>} />
                <Route path="/search" element={<PrivateRoute><SearchResultPage /></PrivateRoute>} />
                <Route path="/admin/logs" element={<PrivateRoute><LogMonitoring /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                <Route path="/mentor" element={<PrivateRoute><MentorPage /></PrivateRoute>} />
                <Route path="/mentte" element={<PrivateRoute><MenteePage /></PrivateRoute>} />
                <Route path="/chatbot" element={<PrivateRoute><MyChatBot /></PrivateRoute>} />       
                <Route path="/chat-interface" element={<PrivateRoute><ChatInterface /></PrivateRoute>} />

                {/* 결제 */}
                <Route path="/payment/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                <Route path="/payment/success" element={<PrivateRoute><Success /></PrivateRoute>} />
                <Route path="/payment/fail" element={<PrivateRoute><Fail /></PrivateRoute>} />
                <Route path="/payment/paymentSubscribe" element={<PaymentSubscribe />} />

                {/* 기타 */}
                <Route path="/problemGeneratorApp" element={<ProblemGeneratorApp />} />
                <Route path="/opictest" element={<Opictest />} />
                <Route path="*" element={<NotFound />} />
              </Routes>

              <ChatComponents />
              <Toaster />
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};


export default App;
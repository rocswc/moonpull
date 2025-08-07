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
import OAuthCallbackPage from "./components/socialLogin/OAuthCallbackPage";

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
          
          <BrowserRouter>
            <Routes>
		      {/*  로그인/회원가입을 명확하게 나눔 */}
		      <Route path="/auth/login" element={<AuthPage />} />
		      <Route path="/auth/signup" element={<AuthPage />} />
			  <Route path="/auth/naver/callback" element={<OAuthCallbackPage />} />
			  <Route path="/auth/social-join" element={<SocialJoinPage />} />
			  
			  {/* 메인 페이지는 보호x */}
			  <Route path="/" element={<Index />} /> 
		      {/*  로그인 필요 페이지 보호 시작 */}
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
		      {/* 결제 관련 페이지들도 모두 로그인 필요 */}
		      <Route path="/payment/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} /> {/* 결제화면 호출 페이지 */}
		      <Route path="/payment/success" element={<PrivateRoute><Success /></PrivateRoute>} />   {/* 결제 성공 페이지 */}
		      <Route path="/payment/fail" element={<PrivateRoute><Fail /></PrivateRoute>} />         {/* 결제 실패 페이지 */}
			  <Route path="/payment/paymentSubscribe" element={<PaymentSubscribe />} /> {/* 결제화면 호출 페이지(구독) */}
			  
		      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
			  <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatComponents />
			  <Toaster/>
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
);
export default App;
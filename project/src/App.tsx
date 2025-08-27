import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider, useChat } from "@/contexts/ChatContext";
import PrivateRoute from "@/components/common/PrivateRoute";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import SearchResultPage from "@/pages/SearchResultPage";
import MentorPage from "./pages/MentorPage";
import MenteePage from "./pages/MenteePage";
import MyChatBot from "./components/MyChatBot";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Fail from "./pages/Fail";
import PaymentSubscribe from "./pages/PaymentSubscribe";
import ChatInterface from "@/components/ChatInterface";
import SocialJoinPage from "./components/socialLogin/SocialJoinPage";
import ProblemGeneratorApp from "./pages/ProblemGeneratorApp";
import Opictest from "./pages/Opictest";
import React from "react";
import { useFcm } from "./fcm";
import { pdfjs } from "react-pdf";
import NotificationBell from "@/components/NotificationBell";
import OAuthCallbackPage from "@/components/socialLogin/OAuthCallbackPage";
import SocialLoginWrapper from "@/components/socialLogin/SocialLoginWrapper";
import ResetPasswordRequestPage from "@/pages/ResetPasswordRequestPage";
import ResetPasswordConfirmPage from "@/pages/ResetPasswordConfirmPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";





pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;



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

const AppInner = () => {
  const { user, isLoggedIn, bootstrapped } = useAuth();
  const isAdmin = isLoggedIn && (user?.role === "ADMIN" || user?.role === "ROLE_ADMIN");

  useFcm({ currentUser: isAdmin ? user : null });

  if (!bootstrapped) return null;

  console.log("✅ user:", user);
  console.log("✅ isLoggedIn:", isLoggedIn);
  console.log("✅ isAdmin:", isAdmin);

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인/회원가입 */}
        <Route path="/auth/login" element={<AuthPage />} />
        <Route path="/auth/signup" element={<AuthPage />} />
		<Route path="/auth/:provider/callback" element={<OAuthCallbackPage />} />
		<Route path="/auth/social-join" element={<SocialJoinPage />} />
        <Route path="/auth/social/phone/:provider" element={<SocialLoginWrapper />} />
		
		{/* 비밀번호 재설정 */}
		<Route path="/auth/reset-password/request" element={<ResetPasswordRequestPage />} />
		<Route path="/auth/reset-password/confirm" element={<ResetPasswordConfirmPage />} />
		
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
        <Route path="/auth" element={<AuthPage />} />

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
      {isAdmin && (
        <div className="fixed top-4 right-4 z-[999]">
          <NotificationBell />
        </div>
      )}
	  
	  <ToastContainer
	    position="top-center"
	    autoClose={3000}
	    hideProgressBar={true}
	    newestOnTop={true}
	    closeOnClick
	    pauseOnHover
	    draggable
	    theme="dark"
	    toastStyle={{
	      borderRadius: "12px",
	      background: "#1f1f2f",
	      color: "#fff",
	      fontSize: "0.9rem",
	      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
	    }}
	  />
	  
      <Toaster />
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <TooltipProvider>
            <AppInner />
          </TooltipProvider>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

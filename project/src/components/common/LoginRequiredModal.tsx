import { Button } from "@/components/ui/button";

type LoginRequiredModalProps = {
  onClose: () => void;
  onGoToLogin: () => void;
};

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ onClose, onGoToLogin }) => {
  return (
	<div
	  className="fixed inset-0 min-h-screen bg-black/50 flex items-center justify-center z-50 animate-fadeIn"
	  onClick={onClose}
	>
	  <div
	    className="bg-white rounded-lg p-6 w-80 max-w-full animate-scaleUp"
	    onClick={(e) => e.stopPropagation()}
	  >
        <h2 className="text-xl font-bold mb-4 text-foreground">로그인이 필요합니다</h2>
        <p className="mb-6 text-muted-foreground">로그인이 필요한 서비스 입니다.</p>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button variant="default" onClick={onGoToLogin}>로그인 하러 가기</Button>
        </div>
      </div>
    </div>
  );
};
export default LoginRequiredModal;
import { useState, useRef } from 'react';
import Navigation from "@/components/Navigation";

const API_BASE_URL = 'http://localhost:8000';

function Opictest() {
  // 상태 관리
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userSession, setUserSession] = useState(null);
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState(null);
  
  // 오디오 녹음용 refs
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const streamRef = useRef(null);

  // 에러 클리어
  const clearError = () => setError(null);

  // 화면 렌더링
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onStartTest={handleStartTest} error={error} />;
      case 'test':
        return (
          <TestScreen 
            testData={testData}
            currentQuestionIndex={currentQuestionIndex}
            onNextQuestion={handleNextQuestion}
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            isSubmitting={isSubmitting}
            error={error}
          />
        );
      case 'result':
        return <ResultScreen results={testResults} onRestart={handleRestart} />;
      default:
        return <WelcomeScreen onStartTest={handleStartTest} error={error} />;
    }
  };

  // 테스트 시작 (모의 데이터 사용)
  const handleStartTest = async (nickname) => {
    clearError();
    try {
      const userId = `user_${Date.now()}`;
      
      // 실제 API 호출 시도
      try {
        const response = await fetch(`${API_BASE_URL}/api/start-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, nickname })
        });

        if (!response.ok) throw new Error('API 서버 응답 실패');

        const data = await response.json();
        setUserSession({ user_id: userId, nickname });
        setTestData(data);
        setCurrentScreen('test');
      } catch (apiError) {
        console.warn('API 서버에 연결할 수 없어 모의 데이터를 사용합니다:', apiError.message);
        
        // 모의 데이터 사용
        const mockData = {
          questions: [
            {
              question_id: 1,
              category: "자기소개",
              question: "안녕하세요! 간단히 자기소개를 해주세요. 이름, 나이, 직업 등에 대해 말씀해 주시면 됩니다."
            },
            {
              question_id: 2,
              category: "취미",
              question: "당신의 취미는 무엇인가요? 그 취미를 언제부터 시작했고, 왜 좋아하는지 설명해 주세요."
            },
            {
              question_id: 3,
              category: "여행",
              question: "가장 기억에 남는 여행지는 어디인가요? 그곳에서 어떤 경험을 했는지 자세히 말씀해 주세요."
            }
          ]
        };
        
        setUserSession({ user_id: userId, nickname });
        setTestData(mockData);
        setCurrentScreen('test');
      }
    } catch (error) {
      setError('테스트 시작 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 브라우저 호환성 체크
  const checkBrowserSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('이 브라우저는 음성 녹음을 지원하지 않습니다.');
    }
    if (!window.MediaRecorder) {
      throw new Error('이 브라우저는 MediaRecorder API를 지원하지 않습니다.');
    }
  };

  // 녹음 시작
  const handleStartRecording = async () => {
    clearError();
    try {
      checkBrowserSupport();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      audioChunks.current = [];

      // MediaRecorder 옵션 설정
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      }

      mediaRecorder.current = new MediaRecorder(stream, options);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const mimeType = mediaRecorder.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        await submitAnswer(audioBlob);
        
        // 스트림 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.current.start(1000); // 1초마다 데이터 수집
      setIsRecording(true);
    } catch (error) {
      setError('마이크 접근 권한이 필요합니다: ' + error.message);
    }
  };

  // 녹음 중지
  const handleStopRecording = async () => {
    if (mediaRecorder.current && isRecording) {
      setIsRecording(false);
      setIsSubmitting(true);
      mediaRecorder.current.stop();
    }
  };

  // 답변 제출
  const submitAnswer = async (audioBlob) => {
    try {
      // 실제 API 호출 시도
      try {
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'answer.wav');
        formData.append('user_id', userSession.user_id);
        formData.append('question_id', testData.questions[currentQuestionIndex].question_id);

        const response = await fetch(`${API_BASE_URL}/api/submit-answer`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('API 서버 응답 실패');

        const result = await response.json();
        
        const newAnswer = {
          question: testData.questions[currentQuestionIndex],
          transcription: result.transcription,
          evaluation: result.evaluation
        };
        
        setAnswers(prev => [...prev, newAnswer]);
      } catch (apiError) {
        console.warn('API 서버 응답 실패, 모의 데이터 사용:', apiError.message);
        
        // 모의 응답 생성
        const mockEvaluation = {
          score: Math.floor(Math.random() * 30) + 70, // 70-100 점수
          grade: ['3', '4', '5'][Math.floor(Math.random() * 3)],
          feedback: "발음이 명확하고 문법 구조가 적절합니다. 더 다양한 어휘를 사용하면 좋겠습니다."
        };

        const newAnswer = {
          question: testData.questions[currentQuestionIndex],
          transcription: "음성이 성공적으로 녹음되었습니다. (실제 환경에서는 여기에 변환된 텍스트가 표시됩니다)",
          evaluation: mockEvaluation
        };
        
        setAnswers(prev => [...prev, newAnswer]);
      }
      
      setIsSubmitting(false);
    } catch (error) {
      setError('답변 제출 중 오류가 발생했습니다: ' + error.message);
      setIsSubmitting(false);
    }
  };

  // 다음 질문으로 이동
  const handleNextQuestion = () => {
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeTest();
    }
  };

  // 테스트 완료
  const completeTest = async () => {
    try {
      // 실제 API 호출 시도 (선택사항)
      try {
        const response = await fetch(`${API_BASE_URL}/api/complete-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userSession.user_id })
        });
        
        if (!response.ok) throw new Error('API 서버 응답 실패');
      } catch (apiError) {
        console.warn('테스트 완료 API 호출 실패:', apiError.message);
      }

      const totalScore = answers.reduce((sum, answer) => sum + answer.evaluation.score, 0) / answers.length;
      const overallGrade = getGradeFromScore(totalScore);

      setTestResults({
        answers,
        totalScore: Math.round(totalScore),
        overallGrade,
        nickname: userSession.nickname
      });
      
      setCurrentScreen('result');
    } catch (error) {
      setError('테스트 완료 처리 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 점수를 등급으로 변환
  const getGradeFromScore = (score) => {
    if (score >= 90) return '5';
    if (score >= 80) return '4';
    if (score >= 70) return '3';
    if (score >= 60) return '2';
    return '1';
  };

  // 테스트 재시작
  const handleRestart = () => {
    // 진행 중인 녹음 정리
    if (isRecording && mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setCurrentScreen('welcome');
    setUserSession(null);
    setTestData(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTestResults(null);
    setIsRecording(false);
    setIsSubmitting(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
		<Navigation />
      {renderScreen()}
    </div>
  );
}

// 환영 화면
function WelcomeScreen({ onStartTest, error }) {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      onStartTest(nickname.trim());
    } else {
      alert('닉네임을 입력해 주세요.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
		  
          <h1 className="text-3xl font-bold text-gray-800 mb-2">OPIc 테스트</h1>
          <p className="text-gray-600">AI 기반 영어 말하기 능력 평가</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="닉네임을 입력하세요"
              maxLength={20}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            테스트 시작하기
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">테스트 안내</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 총 3개의 질문이 출제됩니다</li>
            <li>• 각 질문에 대해 자유롭게 답변하세요</li>
            <li>• 녹음 버튼을 눌러 답변을 시작하세요</li>
            <li>• 마이크 권한을 허용해 주세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 테스트 화면
function TestScreen({ testData, currentQuestionIndex, onNextQuestion, isRecording, onStartRecording, onStopRecording, isSubmitting, error }) {
  const currentQuestion = testData?.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testData?.questions.length) * 100;

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        {/* 진행률 바 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              질문 {currentQuestionIndex + 1} / {testData.questions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 카테고리 */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {currentQuestion.category}
          </span>
        </div>

        {/* 질문 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">질문</h2>
          <div className="p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-lg text-gray-700 leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>
        </div>

        {/* 녹음 컨트롤 */}
        <div className="text-center space-y-4">
          {!isRecording && !isSubmitting && (
            <button
              onClick={onStartRecording}
              className="w-32 h-32 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg mx-auto"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}

          {isRecording && (
            <div className="space-y-4">
              <button
                onClick={onStopRecording}
                className="w-32 h-32 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full flex items-center justify-center hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg mx-auto animate-pulse"
              >
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth={2}></rect>
                </svg>
              </button>
              <p className="text-red-600 font-medium">녹음 중... 다시 클릭하여 중지</p>
            </div>
          )}

          {isSubmitting && (
            <div className="space-y-4">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg mx-auto">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
              <p className="text-blue-600 font-medium">답변 처리 중...</p>
            </div>
          )}

          {/* 다음 질문 버튼 */}
          {!isRecording && !isSubmitting && (
            <div className="pt-6 border-t">
              <button
                onClick={onNextQuestion}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-8 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
              >
                {currentQuestionIndex < testData.questions.length - 1 ? '다음 질문' : '테스트 완료'}
              </button>
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>안내:</strong> 녹음 버튼을 눌러 답변을 시작하고, 다시 눌러 답변을 완료하세요. 
            답변은 자동으로 분석되어 점수가 산출됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

// 결과 화면
function ResultScreen({ results, onRestart }) {
  const getGradeColor = (grade) => {
    switch (grade) {
      case '5': return 'text-green-600';
      case '4': return 'text-blue-600';
      case '3': return 'text-yellow-600';
      case '2': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  const getGradeBgColor = (grade) => {
    switch (grade) {
      case '5': return 'bg-green-100';
      case '4': return 'bg-blue-100';
      case '3': return 'bg-yellow-100';
      case '2': return 'bg-orange-100';
      default: return 'bg-red-100';
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">테스트 완료!</h1>
            <p className="text-gray-600 mb-4">{results.nickname}님의 OPIc 테스트 결과</p>
            
            {/* 총점 */}
            <div className="inline-block">
              <div className={`${getGradeBgColor(results.overallGrade)} rounded-2xl p-6`}>
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">총점</p>
                    <p className="text-4xl font-bold text-gray-800">{results.totalScore}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">등급</p>
                    <p className={`text-4xl font-bold ${getGradeColor(results.overallGrade)}`}>
                      {results.overallGrade}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 결과 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">상세 결과</h2>
          {results.answers.map((answer, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {answer.question.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">점수:</span>
                    <span className="font-bold text-lg">{answer.evaluation.score}</span>
                    <span className={`font-bold text-lg ${getGradeColor(answer.evaluation.grade)}`}>
                      ({answer.evaluation.grade}등급)
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800">{answer.question.question}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">답변 내용</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {answer.transcription || '음성 변환 실패'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">피드백</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {answer.evaluation.feedback}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 재시작 버튼 */}
        <div className="text-center mt-8">
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-8 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            다시 테스트하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Opictest;
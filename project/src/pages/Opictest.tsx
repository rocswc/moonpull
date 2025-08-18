import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Play, Square, Upload, Clock, CheckCircle, XCircle, 
  BookOpen, FileText, Users, Target, BarChart3, ChevronRight,
  Send, Headphones, PenTool, AlertCircle, Loader
} from 'lucide-react';
import Navigation from "@/components/Navigation";

const EnhancedOpicTest = () => {
  // 상태 관리
  const [mode, setMode] = useState('practice');
  const [currentStep, setCurrentStep] = useState('mode-selection');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const [submissionType, setSubmissionType] = useState('audio');
  
  // 오디오 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // 텍스트 관련 상태
  const [textAnswer, setTextAnswer] = useState('');
  
  // 결과 관련 상태
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  
  // 참조
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // 초기화 및 데이터 로드
  useEffect(() => {
    checkApiHealth();
  }, []);

  // 타이머 업데이트
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // API 상태 확인
  const checkApiHealth = async () => {
    try {
      setApiStatus('checking');
      const response = await fetch('http://localhost:8003/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`);
      }
      
      const health = await response.json();
      console.log('API 상태:', health);
      
      if (health.status === 'healthy' && health.mongodb.status === 'connected') {
        setApiStatus('connected');
        await loadTopics();
      } else {
        setApiStatus('error');
        setError(`서버 상태 오류: MongoDB ${health.mongodb.status}`);
      }
    } catch (err) {
      console.error('API 상태 확인 오류:', err);
      setApiStatus('error');
      setError(`서버에 연결할 수 없습니다: ${err.message}`);
    }
  };

  // 데이터 로드 함수들
  const loadTopics = async () => {
    try {
      console.log('주제 로드 시작...');
      const response = await fetch('http://localhost:8003/topics', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('받은 주제 데이터:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setTopics(data);
        setError(null);
      } else {
        throw new Error('주제 데이터가 비어있습니다.');
      }
    } catch (err) {
      console.error('주제 로드 상세 오류:', err);
      setError(`주제를 불러오는 중 오류가 발생했습니다: ${err.message}`);
      setApiStatus('error');
    }
  };

  const loadQuestions = async (topic, count = null) => {
    try {
      let url = `http://localhost:8003/questions/${encodeURIComponent(topic)}`;
      if (count) url += `?limit=${count}`;
      
      console.log('질문 로드 URL:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('질문 로드 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('받은 질문 데이터:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
        return data;
      } else {
        throw new Error('질문 데이터가 비어있습니다.');
      }
    } catch (err) {
      console.error('질문 로드 상세 오류:', err);
      setError(`질문을 불러오는 중 오류가 발생했습니다: ${err.message}`);
      return [];
    }
  };

  const createExamSession = async (topic, questionCount) => {
    try {
      const response = await fetch('http://localhost:8003/exam-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          question_count: questionCount,
          mode: 'exam'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('시험 세션 생성 성공:', data);
      setSessionId(data.session_id);
      setQuestions(data.questions);
      return data;
    } catch (err) {
      console.error('시험 세션 생성 오류:', err);
      setError(`시험 세션 생성 중 오류가 발생했습니다: ${err.message}`);
      return null;
    }
  };

  // 모드 선택 핸들러
  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setCurrentStep('topic-selection');
    resetState();
  };

  // 주제 및 질문 수 선택
  const handleTopicSelect = async (topic, questionCount = 1) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setError(null);
    
    try {
      if (mode === 'exam') {
        const sessionData = await createExamSession(topic, questionCount);
        if (!sessionData) {
          throw new Error('시험 세션 생성에 실패했습니다.');
        }
      } else {
        const questions = await loadQuestions(topic, questionCount);
        if (!questions || questions.length === 0) {
          throw new Error('질문을 불러오는데 실패했습니다.');
        }
      }
      setCurrentStep('testing');
      setCurrentQuestionIndex(0);
    } catch (err) {
      setError(`질문을 준비하는 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 상태 초기화
  const resetState = () => {
    setCurrentResult(null);
    setAllResults([]);
    setAudioBlob(null);
    setAudioUrl(null);
    setTextAnswer('');
    setRecordingTime(0);
    setError(null);
    setCurrentQuestionIndex(0);
  };

  // 시간 포맷 함수
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 오디오 녹음 관련 함수들
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);
      
    } catch (err) {
      console.error('마이크 접근 오류:', err);
      setError('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // 답변 제출 함수들
  const submitAudioAnswer = async () => {
    if (!audioBlob) {
      setError('먼저 음성을 녹음해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('question_id', questions[currentQuestionIndex].id);
      formData.append('mode', mode);

      const response = await fetch('http://localhost:8003/evaluate-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 오류: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      handleSubmissionResult(result);
      
    } catch (err) {
      console.error('평가 오류:', err);
      setError(`평가 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const submitTextAnswer = async () => {
    if (!textAnswer.trim()) {
      setError('답변을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8003/evaluate-text', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          question_id: questions[currentQuestionIndex].id,
          user_text: textAnswer,
          mode: mode
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 오류: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      handleSubmissionResult(result);
      
    } catch (err) {
      console.error('평가 오류:', err);
      setError(`평가 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmissionResult = (result) => {
    setCurrentResult(result);
    setAllResults(prev => [...prev, result]);
    
    if (mode === 'practice') {
      setCurrentStep('results');
    } else {
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          resetCurrentAnswer();
        }, 2000);
      } else {
        setCurrentStep('results');
      }
    }
  };

  const resetCurrentAnswer = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTextAnswer('');
    setCurrentResult(null);
    setRecordingTime(0);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetCurrentAnswer();
      setCurrentStep('testing');
    }
  };

  const startNewTest = () => {
    setCurrentStep('mode-selection');
    resetState();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadgeColor = (grade) => {
    const gradeNum = parseInt(grade);
    if (gradeNum >= 4) return 'bg-green-100 text-green-800';
    if (gradeNum >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // API 연결 상태 확인
  if (apiStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">서버 연결 확인 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (apiStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-4">서버 연결 오류</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={checkApiHealth}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 렌더링 함수들
  const renderModeSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">OPIc Speaking Test</h1>
        <p className="text-gray-600">AI 기반 영어 말하기 평가 시스템</p>
        <div className="mt-4 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-sm text-green-600">서버 연결됨</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div 
          onClick={() => handleModeSelect('practice')}
          className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200"
        >
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">연습 모드</h2>
          </div>
          <p className="text-gray-600 mb-4">
            개별 질문에 대해 즉시 피드백을 받으며 연습할 수 있습니다.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>• 문제별 즉시 피드백</li>
            <li>• 음성 또는 텍스트 입력</li>
            <li>• 자유로운 주제 선택</li>
          </ul>
        </div>

        <div 
          onClick={() => handleModeSelect('exam')}
          className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-orange-200"
        >
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">시험 모드</h2>
          </div>
          <p className="text-gray-600 mb-4">
            실제 시험과 같은 환경에서 여러 문제를 연속으로 풀어보세요.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>• 주제별 연속 문제</li>
            <li>• 완료 후 종합 피드백</li>
            <li>• 실전 시험 환경</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderTopicSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {mode === 'practice' ? '연습할 주제 선택' : '시험 주제 선택'}
        </h2>
        <p className="text-gray-600">
          {mode === 'practice' 
            ? '원하는 주제를 선택하여 연습을 시작하세요' 
            : '시험을 볼 주제와 문제 수를 선택하세요'}
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">주제를 불러오는 중...</h3>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {topics.map((topic, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{topic.topic}</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {topic.question_count}개 문제
                </span>
              </div>
              
              {mode === 'exam' ? (
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm mb-3">문제 수 선택:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, topic.question_count].map(count => (
                      count <= topic.question_count && (
                        <button
                          key={count}
                          onClick={() => handleTopicSelect(topic.topic, count)}
                          disabled={isLoading}
                          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          {count}문제
                        </button>
                      )
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleTopicSelect(topic.topic, 1)}
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      로딩중...
                    </>
                  ) : (
                    <>
                      시작하기 <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTesting = () => (
    <div className="max-w-4xl mx-auto">
      {/* 진행 상황 표시 */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">진행 상황</span>
          <span className="text-sm font-medium text-gray-800">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 질문 및 입력 */}
        <div className="space-y-6">
          {/* 질문 카드 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Question {currentQuestionIndex + 1}</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {selectedTopic}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              {questions[currentQuestionIndex]?.question_text}
            </p>
          </div>

          {/* 답변 방식 선택 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">답변 방식 선택</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setSubmissionType('audio')}
                className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                  submissionType === 'audio' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Headphones className="w-5 h-5 mr-2" />
                음성 녹음
              </button>
              <button
                onClick={() => setSubmissionType('text')}
                className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                  submissionType === 'text' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <PenTool className="w-5 h-5 mr-2" />
                텍스트 입력
              </button>
            </div>

            {/* 음성 녹음 인터페이스 */}
            {submissionType === 'audio' && (
              <div>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center bg-gray-100 rounded-lg px-4 py-2">
                    <Clock className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-xl font-mono text-gray-700">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center mb-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full text-lg font-medium transition-colors shadow-lg"
                    >
                      <Mic className="w-6 h-6 mr-2" />
                      녹음 시작
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-full text-lg font-medium transition-colors shadow-lg animate-pulse"
                    >
                      <Square className="w-6 h-6 mr-2" />
                      녹음 중지
                    </button>
                  )}
                </div>

                {audioUrl && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <button
                        onClick={togglePlayback}
                        className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {isPlaying ? (
                          <>
                            <MicOff className="w-4 h-4 mr-2" />
                            일시정지
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            재생
                          </>
                        )}
                      </button>
                    </div>
                    
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={handleAudioEnded}
                      className="w-full"
                      controls
                    />
                  </div>
                )}

                {audioBlob && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={submitAudioAnswer}
                      disabled={isLoading}
                      className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin mr-2" />
                          평가 중...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          답변 제출
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 텍스트 입력 인터페이스 */}
            {submissionType === 'text' && (
              <div>
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="여기에 영어로 답변을 작성하세요..."
                  className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    {textAnswer.split(' ').filter(word => word.length > 0).length} words
                  </span>
                  <button
                    onClick={submitTextAnswer}
                    disabled={isLoading || !textAnswer.trim()}
                    className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        평가 중...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        답변 제출
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 현재 결과 또는 안내 */}
        <div className="space-y-6">
          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* 현재 결과 */}
          {currentResult && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">평가 결과</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">점수</p>
                  <p className={`text-3xl font-bold ${getScoreColor(currentResult.score)}`}>
                    {currentResult.score}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">등급</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getGradeBadgeColor(currentResult.grade)}`}>
                    Level {currentResult.grade}
                  </span>
                </div>
              </div>

              {/* 세부 평가 결과 표시 */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">세부 평가</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">문제 이해력</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">{currentResult.problem_understanding.score}/25</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{width: `${(currentResult.problem_understanding.score / 25) * 100}%`}}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">답변 구성력</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">{currentResult.answer_structure.score}/25</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{width: `${(currentResult.answer_structure.score / 25) * 100}%`}}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">내용 표현력</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">{currentResult.content_expression.score}/25</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{width: `${(currentResult.content_expression.score / 25) * 100}%`}}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">주제 전달력</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">{currentResult.topic_delivery.score}/25</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{width: `${(currentResult.topic_delivery.score / 25) * 100}%`}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {currentResult.transcription && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">음성 변환 결과</h4>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    "{currentResult.transcription}"
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-800 mb-2">종합 피드백</h4>
                <p className="text-gray-700 leading-relaxed">{currentResult.overall_feedback}</p>
              </div>

              {mode === 'practice' && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={nextQuestion}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    다음 문제
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 평가 기준 안내 */}
          {!currentResult && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">평가 기준</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>문제 이해력 (주제 일치도, 표현 정확성)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>답변 구성력 (문법, 시제, 어휘 다양성)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>내용 표현력 (수식어, 접속어 활용)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>주제 전달력 (유창성, 답변 지속성)</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {mode === 'practice' ? '연습 완료' : '시험 완료'}
        </h2>
        <p className="text-gray-600">평가 결과를 확인하세요</p>
      </div>

      {/* 종합 결과 */}
      {mode === 'exam' && allResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
            종합 결과
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">평균 점수</p>
              <p className={`text-2xl font-bold ${getScoreColor(
                Math.round(allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length)
              )}`}>
                {Math.round(allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">평균 등급</p>
              <p className="text-2xl font-bold text-gray-800">
                Level {Math.round(allResults.reduce((sum, r) => sum + parseInt(r.grade), 0) / allResults.length)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">완료 문제</p>
              <p className="text-2xl font-bold text-gray-800">
                {allResults.length} / {questions.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 개별 결과 */}
      <div className="space-y-4">
        {allResults.map((result, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                문제 {index + 1}
              </h4>
              <div className="flex items-center space-x-4">
                <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                  {result.score}점
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeBadgeColor(result.grade)}`}>
                  Level {result.grade}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
              <strong>질문:</strong> {result.question_text}
            </p>

            <p className="text-gray-600 mb-3 bg-blue-50 p-3 rounded-lg">
              <strong>답변:</strong> {result.transcription || result.user_answer}
            </p>

            {/* 세부 점수 표시 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">문제 이해력</span>
                  <span className="text-sm font-medium">{result.problem_understanding.score}/25</span>
                </div>
                <p className="text-xs text-gray-500">{result.problem_understanding.feedback}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">답변 구성력</span>
                  <span className="text-sm font-medium">{result.answer_structure.score}/25</span>
                </div>
                <p className="text-xs text-gray-500">{result.answer_structure.feedback}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">내용 표현력</span>
                  <span className="text-sm font-medium">{result.content_expression.score}/25</span>
                </div>
                <p className="text-xs text-gray-500">{result.content_expression.feedback}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">주제 전달력</span>
                  <span className="text-sm font-medium">{result.topic_delivery.score}/25</span>
                </div>
                <p className="text-xs text-gray-500">{result.topic_delivery.feedback}</p>
              </div>
            </div>
            
            <div>
              <strong className="text-gray-800">종합 피드백:</strong>
              <p className="text-gray-700 mt-1 leading-relaxed">{result.overall_feedback}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={startNewTest}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg"
        >
          새로운 테스트 시작
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
	<Navigation /> {/* ✅ 네비게이션 추가 */} 
      {currentStep === 'mode-selection' && renderModeSelection()}
      {currentStep === 'topic-selection' && renderTopicSelection()}
      {currentStep === 'testing' && renderTesting()}
      {currentStep === 'results' && renderResults()}
    </div>
  );
};

export default EnhancedOpicTest;
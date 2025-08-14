import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Square, Upload, Clock, CheckCircle, XCircle } from 'lucide-react';
import Navigation from "@/components/Navigation";

const Opictest = () => {
  // 상태 관리
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // 참조
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  
  // 샘플 질문들
  const sampleQuestions = [
    "Tell me about your favorite hobby and why you enjoy it.",
    "Describe your typical day from morning to evening.",
    "What kind of music do you like and how does it make you feel?",
    "Tell me about a memorable trip or vacation you've taken.",
    "Describe your ideal weekend and what you would do."
  ];
  
  const [currentQuestion, setCurrentQuestion] = useState(sampleQuestions[0]);

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

  // 시간 포맷 함수
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 녹음 시작
  const startRecording = async () => {
    try {
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // MediaRecorder 설정
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // 데이터 수집
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // 녹음 완료 시 처리
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        // 스트림 정리
        stream.getTracks().forEach(track => track.stop());
      };
      
      // 녹음 시작
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);
      setResult(null);
      
    } catch (err) {
      console.error('마이크 접근 오류:', err);
      setError('마이크 접근 권한이 필요합니다.');
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 오디오 재생/일시정지
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

  // 오디오 재생 이벤트 처리
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // 서버로 오디오 전송 및 평가
  const submitAudio = async () => {
    if (!audioBlob) {
      setError('먼저 음성을 녹음해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('question', currentQuestion);

      // FastAPI 서버로 전송
      const response = await fetch('http://localhost:8000/evaluate-opic', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      console.error('평가 오류:', err);
      setError('평가 중 오류가 발생했습니다. 서버 연결을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 새 질문 선택
  const selectRandomQuestion = () => {
    const availableQuestions = sampleQuestions.filter(q => q !== currentQuestion);
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setCurrentQuestion(randomQuestion);
    
    // 상태 초기화
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
    setError(null);
    setRecordingTime(0);
  };

  // 점수에 따른 색상 반환
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 등급에 따른 배지 색상
  const getGradeBadgeColor = (grade) => {
    const gradeNum = parseInt(grade);
    if (gradeNum >= 4) return 'bg-green-100 text-green-800';
    if (gradeNum >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
	
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
	<Navigation /> {/* ✅ 네비게이션 추가 */} 
      <div className="max-w-4xl mx-auto">
	  
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">OPIc Speaking Test</h1>
          <p className="text-gray-600">AI 기반 영어 말하기 평가 시스템</p>
        </div>

        {/* 메인 컨테이너 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 질문 및 녹음 */}
          <div className="space-y-6">
            {/* 질문 카드 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Question</h2>
                <button
                  onClick={selectRandomQuestion}
                  className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors"
                >
                  New Question
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">{currentQuestion}</p>
            </div>

            {/* 녹음 컨트롤 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recording</h3>
              
              {/* 타이머 */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center bg-gray-100 rounded-lg px-4 py-2">
                  <Clock className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-xl font-mono text-gray-700">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              </div>

              {/* 녹음 버튼 */}
              <div className="flex justify-center mb-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full text-lg font-medium transition-colors shadow-lg"
                  >
                    <Mic className="w-6 h-6 mr-2" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-full text-lg font-medium transition-colors shadow-lg animate-pulse"
                  >
                    <Square className="w-6 h-6 mr-2" />
                    Stop Recording
                  </button>
                )}
              </div>

              {/* 재생 컨트롤 */}
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
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
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

              {/* 제출 버튼 */}
              {audioBlob && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={submitAudio}
                    disabled={isLoading}
                    className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit for Evaluation
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 결과 */}
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

            {/* 평가 결과 */}
            {result && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800">Evaluation Results</h3>
                </div>

                {/* 점수 및 등급 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Score</p>
                    <p className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Grade</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getGradeBadgeColor(result.grade)}`}>
                      Level {result.grade}
                    </span>
                  </div>
                </div>

                {/* 피드백 */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Detailed Feedback</h4>
                  <p className="text-gray-700 leading-relaxed">{result.feedback}</p>
                </div>
              </div>
            )}

            {/* 평가 기준 안내 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Evaluation Criteria</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Fluency and naturalness of speech</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Grammar accuracy</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Logic and completeness of answer</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Creativity and engagement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Opictest;
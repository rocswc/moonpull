import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RotateCcw, BookOpen, TrendingUp, Award, Clock, ChevronRight, Wifi, WifiOff, AlertCircle, Hash, ChevronUp, ChevronDown } from "lucide-react";
import Navigation from "@/components/Navigation";


// API Base URL
const API_BASE_URL = 'https://localhost:5001/api';

// 실제 API 함수들
const api = {
  async getSubjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      throw error;
    }
  },

  async getGrades(subject, school) {
    try {
      const params = new URLSearchParams({ subject, school });
      const response = await fetch(`${API_BASE_URL}/grades?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      throw error;
    }
  },

  async getQuestions(subject, school, grade, mode, count) {
    try {
      const params = new URLSearchParams({ 
        subject, 
        school, 
        grade: grade.toString(), 
        mode,
        count: count.toString()
      });
      const response = await fetch(`${API_BASE_URL}/questions?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      throw error;
    }
  },

  async getRandomQuestion(subject, school, grade, excludeIds = []) {
    try {
      const params = new URLSearchParams({ 
        subject, 
        school, 
        grade: grade.toString(),
        exclude: excludeIds.join(',')
      });
      const response = await fetch(`${API_BASE_URL}/question/random?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch random question:', error);
      throw error;
    }
  },

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

const CBTQuizSystem = () => {
  // Connection state
  const [isConnected, setIsConnected] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  
  // State management
  const [currentStep, setCurrentStep] = useState('connection');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);
  
  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [timeLeft, setTimeLeft] = useState(0);
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);
  const [currentRandomQuestion, setCurrentRandomQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [practiceQuestionsAnswered, setPracticeQuestionsAnswered] = useState(0);
  
  // Results state for exam mode
  const [examResults, setExamResults] = useState([]);

  // Connection check on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const healthCheck = await api.checkHealth();
      console.log('✅ 서버 연결 성공:', healthCheck);
      setIsConnected(true);
      setConnectionError('');
      
      await loadSubjects();
      setCurrentStep('subjects');
    } catch (error) {
      console.error('❌ 서버 연결 실패:', error);
      setIsConnected(false);
      setConnectionError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Timer effect for exam mode
  useEffect(() => {
    if (currentStep === 'quiz' && selectedMode === 'exam' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, selectedMode, timeLeft]);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const subjectsData = await api.getSubjects();
      console.log('📚 과목 데이터:', subjectsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setConnectionError('과목 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = async (subject) => {
    setSelectedSubject(subject);
    setSchools(subject.schools);
    console.log('🎯 선택된 과목:', subject);
    setCurrentStep('schools');
  };

  const handleSchoolSelect = async (school) => {
    setSelectedSchool(school);
    setLoading(true);
    try {
      const gradesData = await api.getGrades(selectedSubject.id, school);
      console.log('📊 학년 데이터:', gradesData);
      setGrades(gradesData);
      setCurrentStep('grades');
    } catch (error) {
      console.error('Failed to load grades:', error);
      setConnectionError('학년 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
    console.log('🎓 선택된 학년:', grade);
    setCurrentStep('mode');
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    console.log('🎯 선택된 모드:', mode);
    setCurrentStep('questionCount');
  };

  const handleQuestionCountSelect = async (count) => {
    setQuestionCount(count);
    setLoading(true);
    
    console.log('선택된 문제 수:', count);
    
    try {
      if (selectedMode === 'exam') {
        const questionsData = await api.getQuestions(
          selectedSubject.id, 
          selectedSchool, 
          selectedGrade, 
          selectedMode,
          count
        );
        console.log('📝 시험 문제 데이터:', questionsData);
        
        // 실제 가져온 문제 수를 기준으로 설정
        const actualQuestionCount = Math.min(questionsData.length, count);
        setQuestions(questionsData.slice(0, actualQuestionCount));
        setSelectedAnswers(new Array(actualQuestionCount).fill(null));
        setTimeLeft(actualQuestionCount * 60);
        
        console.log(`⏰ 시간 설정: ${actualQuestionCount}분 (${actualQuestionCount * 60}초)`);
      } else {
        await loadRandomQuestion();
        setPracticeQuestionsAnswered(0);
      }
      
      setCurrentStep('quiz');
    } catch (error) {
      console.error('Failed to load questions:', error);
      setConnectionError('문제를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadRandomQuestion = async () => {
    setLoading(true);
    try {
      const question = await api.getRandomQuestion(
        selectedSubject.id,
        selectedSchool, 
        selectedGrade,
        usedQuestionIds
      );
      
      console.log('🔀 랜덤 문제:', question);
      
      if (question) {
        setCurrentRandomQuestion(question);
        setUsedQuestionIds(prev => [...prev, question.id]);
      } else {
        // 더 이상 문제가 없으면 결과 페이지로
        setCurrentStep('results');
      }
    } catch (error) {
      console.error('Failed to load random question:', error);
      setConnectionError('문제를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedMode === 'exam') {
      const newAnswers = [...selectedAnswers];
      newAnswers[currentQuestionIndex] = answerIndex;
      setSelectedAnswers(newAnswers);
    } else {
      setCurrentAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedMode === 'practice') {
      const isCorrect = currentAnswer === currentRandomQuestion.answer;
      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong: prev.wrong + (!isCorrect ? 1 : 0)
      }));
      
      const newAnsweredCount = practiceQuestionsAnswered + 1;
      setPracticeQuestionsAnswered(newAnsweredCount);
      
      setShowExplanation(true);
      
      console.log(`완료된 문제: ${newAnsweredCount} / ${questionCount}`);
    }
  };

  const handleNextQuestion = async () => {
    if (selectedMode === 'exam') {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleSubmitExam();
      }
    } else {
      // 연습 모드: 설정한 문제 수를 다 풀었는지 확인
      if (practiceQuestionsAnswered >= questionCount) {
        console.log('✅ 설정한 문제 수 완료! 결과 화면으로 이동');
        setCurrentStep('results');
        return;
      }
      
      // 다음 문제 로드
      setCurrentAnswer(null);
      setShowExplanation(false);
      await loadRandomQuestion();
    }
  };

  const handleSubmitExam = () => {
    let correct = 0;
    const results = [];
    
    questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index];
      const isCorrect = userAnswer === question.answer;
      
      if (isCorrect) correct++;
      
      results.push({
        questionIndex: index + 1,
        question: question.question,
        choices: question.choices,
        userAnswer: userAnswer,
        correctAnswer: question.answer,
        isCorrect: isCorrect,
        explanation: question.explanation || ''
      });
    });
    
    setScore({
      correct,
      wrong: questions.length - correct
    });
    
    setExamResults(results);
    setCurrentStep('results');
  };

  const handleRestart = () => {
    setCurrentStep('subjects');
    setSelectedSubject(null);
    setSelectedSchool(null);
    setSelectedGrade(null);
    setSelectedMode(null);
    setQuestionCount(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setCurrentAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, wrong: 0 });
    setTimeLeft(0);
    setUsedQuestionIds([]);
    setCurrentRandomQuestion(null);
    setConnectionError('');
    setPracticeQuestionsAnswered(0);
    setExamResults([]);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = () => {
    return selectedMode === 'exam' ? questions[currentQuestionIndex] : currentRandomQuestion;
  };

  // Connection status component
  const renderConnectionStatus = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="flex justify-center">
          {isConnected === null ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          ) : isConnected ? (
            <Wifi className="w-12 h-12 text-green-500" />
          ) : (
            <WifiOff className="w-12 h-12 text-red-500" />
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {loading ? '연결 확인 중...' : 
             isConnected === null ? '서버 연결 확인 중...' :
             isConnected ? '✅ 서버 연결 성공!' : '❌ 서버 연결 실패'}
          </h1>
          
          {isConnected && (
            <p className="text-green-600 mt-2">MongoDB와 Flask API가 정상 작동 중입니다</p>
          )}
          
          {connectionError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">연결 오류</p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{connectionError}</p>
              <div className="mt-3 text-xs text-red-500">
                <p>• Flask 서버가 실행 중인지 확인하세요 (python app.py)</p>
                <p>• MongoDB가 실행 중인지 확인하세요</p>
                <p>• 브라우저 개발자 도구에서 네트워크 탭을 확인하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {!isConnected && (
        <Button onClick={checkConnection} disabled={loading}>
          {loading ? '재연결 시도 중...' : '다시 연결 시도'}
        </Button>
      )}
    </div>
  );

  const renderSubjectSelection = () => (
    <div className="text-center space-y-6">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Wifi className="w-5 h-5 text-green-500" />
        <span className="text-sm text-green-600">서버 연결됨</span>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">과목을 선택하세요</h1>
        <p className="text-muted-foreground">MongoDB에서 불러온 실제 데이터입니다</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all duration-200 min-h-[8rem] flex items-center justify-center group"
              onClick={() => handleSubjectSelect(subject)}
            >
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl font-semibold">
                  {subject.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {subject.schools.join(', ')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {connectionError && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">{connectionError}</p>
        </div>
      )}
    </div>
  );

  const renderSchoolSelection = () => (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">학교를 선택하세요</h1>
        <p className="text-muted-foreground">{selectedSubject.name} 과목의 학교급을 선택해주세요</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {schools.map((school) => (
            <Card
              key={school}
              className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all duration-200 min-h-[6rem] flex items-center justify-center"
              onClick={() => handleSchoolSelect(school)}
            >
              <CardTitle className="text-xl font-semibold">{school}</CardTitle>
            </Card>
          ))}
        </div>
      )}
      
      <Button variant="outline" onClick={() => setCurrentStep('subjects')}>
        이전 단계
      </Button>
    </div>
  );

  const renderGradeSelection = () => (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">학년을 선택하세요</h1>
        <p className="text-muted-foreground">{selectedSchool} {selectedSubject.name}의 학년을 선택해주세요</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {grades.map((grade) => (
            <Card
              key={grade}
              className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all duration-200 min-h-[5rem] flex items-center justify-center"
              onClick={() => handleGradeSelect(grade)}
            >
              <CardTitle className="text-lg font-semibold">{grade}학년</CardTitle>
            </Card>
          ))}
        </div>
      )}
      
      <Button variant="outline" onClick={() => setCurrentStep('schools')}>
        이전 단계
      </Button>
    </div>
  );

  const renderModeSelection = () => (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">모드를 선택하세요</h1>
        <p className="text-muted-foreground">{selectedSchool} {selectedGrade}학년 {selectedSubject.name}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Card
          className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all duration-200 min-h-[10rem] flex flex-col items-center justify-center p-6"
          onClick={() => handleModeSelect('exam')}
        >
          <Award className="w-12 h-12 text-blue-500 mb-3" />
          <CardTitle className="text-xl font-semibold mb-2">시험 모드</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            모든 문제를 순서대로 풀고<br />마지막에 결과를 확인합니다
          </p>
        </Card>
        
        <Card
          className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all duration-200 min-h-[10rem] flex flex-col items-center justify-center p-6"
          onClick={() => handleModeSelect('practice')}
        >
          <TrendingUp className="w-12 h-12 text-green-500 mb-3" />
          <CardTitle className="text-xl font-semibold mb-2">한 문제씩 풀기</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            문제를 하나씩 랜덤으로<br />즉시 피드백을 받습니다
          </p>
        </Card>
      </div>
      <Button variant="outline" onClick={() => setCurrentStep('grades')}>
        이전 단계
      </Button>
    </div>
  );

  const renderQuestionCountSelection = () => (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">몇 문제를 풀까요?</h1>
        <p className="text-muted-foreground">
          {selectedMode === 'exam' ? '시험 모드' : '연습 모드'} - {selectedSchool} {selectedGrade}학년 {selectedSubject.name}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {[10,20,30,50].map((count) => (
          <Card
            key={count}
            className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all duration-200 min-h-[6rem] flex flex-col items-center justify-center p-4 group"
            onClick={() => handleQuestionCountSelect(count)}
          >
            <Hash className="w-8 h-8 text-primary group-hover:scale-110 transition-transform mb-2" />
            <CardTitle className="text-xl font-semibold">{count}문제</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedMode === 'exam' ? `약 ${count}분` : '랜덤 출제'}
            </p>
          </Card>
        ))}
      </div>
      
      <div className="space-y-2">
        <Button variant="outline" onClick={() => setCurrentStep('mode')}>
          이전 단계
        </Button>
        <p className="text-xs text-muted-foreground">
          {selectedMode === 'exam' 
            ? '시험 모드에서는 문제당 1분씩 시간이 주어집니다' 
            : '연습 모드에서는 설정한 문제 수만큼 랜덤으로 출제됩니다'}
        </p>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      return (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>문제를 불러오는 중...</p>
        </div>
      );
    }

    const progress = selectedMode === 'exam' 
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : (practiceQuestionsAnswered / questionCount) * 100;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
	  
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl p-4 border">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{selectedSubject.name} - {selectedMode === 'exam' ? '시험 모드' : '연습 모드'}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedSchool} {selectedGrade}학년 • 총 {questionCount}문제 • MongoDB 실제 데이터
              </p>
            </div>
            
            {selectedMode === 'exam' && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className={timeLeft < 300 ? 'text-red-500 font-bold' : ''}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Badge variant="secondary">
                  {currentQuestionIndex + 1} / {questions.length}
                </Badge>
              </div>
            )}
            
            {selectedMode === 'practice' && (
              <div className="text-right space-y-1">
                <div className="text-sm text-muted-foreground">
                  {practiceQuestionsAnswered} / {questionCount}
                </div>
                <div className="space-x-2">
                  <span className="text-green-600 font-semibold">정답 {score.correct}</span>
                  <span className="text-red-600 font-semibold">오답 {score.wrong}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              {selectedMode === 'exam' 
                ? `문제 ${currentQuestionIndex + 1}` 
                : `문제 ${practiceQuestionsAnswered + 1}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion.passage && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-l-4 border-blue-500">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">📖 지문</p>
                <p className="leading-relaxed">{currentQuestion.passage}</p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
              
              <div className="space-y-3">
                {currentQuestion.choices.map((choice, index) => {
                  const isSelected = selectedMode === 'exam' 
                    ? selectedAnswers[currentQuestionIndex] === index
                    : currentAnswer === index;
                  const isCorrect = currentQuestion.answer === index;
                  
                  let cardStyle = "cursor-pointer border-2 p-4 rounded-xl transition-all duration-200 ";
                  
                  if (showExplanation && selectedMode === 'practice') {
                    if (isCorrect) {
                      cardStyle += "border-green-500 bg-green-50 dark:bg-green-900/20";
                    } else if (isSelected && !isCorrect) {
                      cardStyle += "border-red-500 bg-red-50 dark:bg-red-900/20";
                    } else {
                      cardStyle += "border-muted";
                    }
                  } else {
                    cardStyle += isSelected 
                      ? "border-primary bg-primary/10" 
                      : "border-muted hover:border-primary/50";
                  }

                  return (
                    <div
                      key={index}
                      className={cardStyle}
                      onClick={() => !showExplanation && handleAnswerSelect(index)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          {index + 1}.
                        </span>
                        <span>{choice}</span>
                        {showExplanation && selectedMode === 'practice' && (
                          <>
                            {isCorrect && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                            {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 ml-auto" />}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {showExplanation && selectedMode === 'practice' && currentQuestion.explanation && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border-l-4 border-purple-500">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">💡 해설</p>
                <p className="leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={handleRestart}>
                처음으로
              </Button>
              
              <div className="space-x-3">
                {selectedMode === 'exam' && (
                  <>
                    {currentQuestionIndex > 0 && (
                      <Button 
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      >
                        이전 문제
                      </Button>
                    )}
                    {currentQuestionIndex < questions.length - 1 ? (
                      <Button onClick={handleNextQuestion}>
                        다음 문제 <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmitExam} variant="destructive">
                        시험 제출
                      </Button>
                    )}
                  </>
                )}
                
                {selectedMode === 'practice' && (
                  <>
                    {!showExplanation ? (
                      <Button 
                        onClick={handleSubmitAnswer}
                        disabled={currentAnswer === null}
                      >
                        정답 제출
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion} disabled={loading}>
                        {practiceQuestionsAnswered >= questionCount 
                          ? (loading ? '결과 확인 중...' : '결과 확인') 
                          : (loading ? '다음 문제 로딩 중...' : '다음 문제')} 
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderResults = () => {
    const totalQuestions = selectedMode === 'exam' ? questions.length : score.correct + score.wrong;
    const percentage = totalQuestions > 0 ? Math.round((score.correct / totalQuestions) * 100) : 0;
    
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 결과 요약 */}
        <div className="text-center space-y-4">
          <Award className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">
            {selectedMode === 'exam' ? '시험 완료!' : '연습 완료!'}
          </h1>
          <p className="text-muted-foreground">
            {selectedSubject.name} ({selectedSchool} {selectedGrade}학년)
          </p>
          <p className="text-sm text-green-600">총 {totalQuestions}문제 • MongoDB 실제 데이터로 완료</p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{percentage}%</div>
              <p className="text-muted-foreground">정답률</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{score.correct}</div>
                <p className="text-sm text-muted-foreground">정답</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{score.wrong}</div>
                <p className="text-sm text-muted-foreground">오답</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg">
                총 <span className="font-semibold">{totalQuestions}</span>문제 중 
                <span className="font-semibold text-primary"> {score.correct}</span>문제 정답
              </div>
            </div>
          </div>
        </Card>

        {/* 시험 모드일 때만 상세 결과 표시 */}
        {selectedMode === 'exam' && examResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                문제별 상세 결과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {examResults.map((result, index) => (
                <ExamResultItem key={index} result={result} />
              ))}
            </CardContent>
          </Card>
        )}

        <div className="space-y-4 text-center">
          <Button onClick={handleRestart} size="lg" className="w-full max-w-md mx-auto">
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 시작하기
          </Button>
        </div>
      </div>
    );
  };

  // 시험 결과 개별 문제 컴포넌트
  const ExamResultItem = ({ result }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-medium text-sm text-muted-foreground">
              문제 {result.questionIndex}
            </span>
            {result.isCorrect ? (
              <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                정답
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                <XCircle className="w-3 h-3 mr-1" />
                오답
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="text-sm font-medium">
          {result.question}
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-2 border-t">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">선택지:</p>
              {result.choices.map((choice, choiceIndex) => {
                const isUserAnswer = result.userAnswer === choiceIndex;
                const isCorrectAnswer = result.correctAnswer === choiceIndex;
                
                let choiceStyle = "p-2 rounded text-sm ";
                
                if (isCorrectAnswer) {
                  choiceStyle += "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300";
                } else if (isUserAnswer && !isCorrectAnswer) {
                  choiceStyle += "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300";
                } else {
                  choiceStyle += "bg-muted/50";
                }
                
                return (
                  <div key={choiceIndex} className={choiceStyle}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{choiceIndex + 1}.</span>
                      <span>{choice}</span>
                      {isCorrectAnswer && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      )}
                      {isUserAnswer && !isCorrectAnswer && (
                        <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">내 답안:</p>
                <p className="font-medium">
                  {result.userAnswer !== null ? `${result.userAnswer + 1}번` : '미선택'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">정답:</p>
                <p className="font-medium text-green-600">
                  {result.correctAnswer + 1}번
                </p>
              </div>
            </div>

            {result.explanation && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border-l-4 border-purple-500">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">💡 해설</p>
                <p className="text-sm leading-relaxed">{result.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
	<Navigation /> {/* ✅ 네비게이션 추가 */} 
	 <div className="container mx-auto px-4 py-8">
        {currentStep === 'connection' && renderConnectionStatus()}
        {currentStep === 'subjects' && renderSubjectSelection()}
        {currentStep === 'schools' && renderSchoolSelection()}
        {currentStep === 'grades' && renderGradeSelection()}
        {currentStep === 'mode' && renderModeSelection()}
        {currentStep === 'questionCount' && renderQuestionCountSelection()}
        {currentStep === 'quiz' && renderQuiz()}
        {currentStep === 'results' && renderResults()}
      </div>
    </div>
  );
};

export default CBTQuizSystem;
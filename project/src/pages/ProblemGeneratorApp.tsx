import React, { useState } from 'react';
import { Upload, FileText, Image, BookOpen, Download, X, Check, Settings } from 'lucide-react';
import Navigation from "@/components/Navigation";

const ProblemGeneratorApp = () => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState('객관식');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [fileNames, setFileNames] = useState(null);
  const [error, setError] = useState('');

  const allowedExtensions = ['pdf', 'txt', 'docx', 'png', 'jpg', 'jpeg', 'img'];

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setError('지원되지 않는 파일 형식입니다.');
      return;
    }

    setFile(selectedFile);
    setError('');

    // 파일 미리보기 생성
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview({
          type: 'image',
          content: e.target.result
        });
      };
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type === 'application/pdf') {
      setFilePreview({
        type: 'pdf',
        content: selectedFile.name
      });
    } else if (selectedFile.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview({
          type: 'text',
          content: e.target.result
        });
      };
      reader.readAsText(selectedFile);
    } else {
      setFilePreview({
        type: 'document',
        content: selectedFile.name
      });
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('num_questions', numQuestions);
      formData.append('question_type', questionType);

      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        setFileNames(data.files);
      } else {
        setError(data.error || '문제 생성 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('서버와의 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleMCQ = (num) => {
    let content = '';
    let problemsOnly = '';
    for (let i = 1; i <= num; i++) {
      const fullContent = `## 문제 ${i}\n질문: 다음 중 올바른 설명은?\nA) 선택지 A\nB) 선택지 B\nC) 선택지 C\nD) 선택지 D\n정답: A\n해설: 정답은 A입니다.\n\n`;
      const problemOnlyContent = `## 문제 ${i}\n질문: 다음 중 올바른 설명은?\nA) 선택지 A\nB) 선택지 B\nC) 선택지 C\nD) 선택지 D\n\n`;
      
      content += fullContent;
      problemsOnly += problemOnlyContent;
    }
    return { full: content, problemsOnly };
  };

  const generateSampleSubjective = (num) => {
    let content = '';
    let problemsOnly = '';
    for (let i = 1; i <= num; i++) {
      const fullContent = `## 문제 ${i}\n질문: 주요 개념에 대해 설명하시오.\n정답: 상세한 설명이 여기에 들어갑니다.\n해설: 추가적인 해설이 제공됩니다.\n\n`;
      const problemOnlyContent = `## 문제 ${i}\n질문: 주요 개념에 대해 설명하시오.\n\n`;
      
      content += fullContent;
      problemsOnly += problemOnlyContent;
    }
    return { full: content, problemsOnly };
  };

  const handleDownload = async (format, includeAnswers = true) => {
    if (!results || !fileNames) return;
    
    try {
      let filename;
      
      // 백엔드에서 생성된 실제 파일명 사용
      if (includeAnswers) {
        filename = format === 'pdf' ? fileNames.full_pdf : fileNames.full_txt;
      } else {
        filename = format === 'pdf' ? fileNames.problems_only_pdf : fileNames.problems_only_txt;
      }
      
      const response = await fetch(`http://localhost:5000/api/download/${encodeURIComponent(filename)}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.href = url;
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        setError(errorData.error || '파일 다운로드에 실패했습니다.');
      }
    } catch (err) {
      setError('다운로드 중 오류가 발생했습니다.');
    }
  };

  const resetApp = () => {
    setFile(null);
    setFilePreview(null);
    setResults(null);
    setFileNames(null);
    setError('');
    setNumQuestions(5);
    setQuestionType('객관식');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
	  <Navigation /> {/* ✅ 네비게이션 추가 */}
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI 문제 생성기</h1>
              <p className="text-sm text-gray-600 mt-1">파일을 업로드하고 자동으로 문제를 생성하세요</p>
            </div>
            {file && !results && (
              <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Check className="w-4 h-4 mr-1" />
                {file.name}
              </div>
            )}
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 p-6">
          {!file && !results ? (
            /* 초기 파일 업로드 화면 */
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">파일을 업로드하세요</h2>
                <p className="text-gray-600">PDF, 텍스트 파일, 이미지를 지원합니다</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fileInput"
                />
                <label htmlFor="fileInput" className="cursor-pointer block">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">클릭하여 파일을 선택하세요</p>
                  <p className="text-sm text-gray-500">또는 파일을 드래그 앤 드롭하세요</p>
                  <div className="mt-4 flex justify-center space-x-4 text-xs text-gray-400">
                    <span>PDF</span>
                    <span>•</span>
                    <span>TXT</span>
                    <span>•</span>
                    <span>DOCX</span>
                    <span>•</span>
                    <span>이미지</span>
                  </div>
                </label>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
                  {error}
                </div>
              )}
            </div>
          ) : results ? (
            /* 결과 화면 */
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  생성된 문제 ({numQuestions}개 {questionType})
                </h2>
                <button
                  onClick={resetApp}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleDownload('txt', false)}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      문제만 (TXT)
                    </button>
                    <button
                      onClick={() => handleDownload('txt', true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      정답포함 (TXT)
                    </button>
                    <button
                      onClick={() => handleDownload('pdf', false)}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      문제만 (PDF)
                    </button>
                    <button
                      onClick={() => handleDownload('pdf', true)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      정답포함 (PDF)
                    </button>
                  </div>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                    {results.full}
                  </pre>
                </div>
              </div>
            </div>
          ) : filePreview ? (
            /* 파일 미리보기 화면 */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="font-medium text-gray-900 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      {file.name}
                    </h2>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {file.size < 1024 * 1024 
                        ? `${(file.size / 1024).toFixed(1)}KB` 
                        : `${(file.size / (1024 * 1024)).toFixed(1)}MB`}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {filePreview.type === 'image' && (
                    <div className="text-center">
                      <img
                        src={filePreview.content}
                        alt="업로드된 이미지"
                        className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                  
                  {filePreview.type === 'text' && (
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                        {filePreview.content}
                      </pre>
                    </div>
                  )}
                  
                  {(filePreview.type === 'pdf' || filePreview.type === 'document') && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-red-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{filePreview.content}</h3>
                      <p className="text-gray-600">
                        {filePreview.type === 'pdf' ? 'PDF 문서' : '문서 파일'}가 업로드되었습니다
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        우측 사이드바에서 문제를 생성해보세요
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* 우측 사이드바 - 파일이 있을 때만 표시 */}
      {(file && !results) && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              문제 생성 설정
            </h3>
          </div>

          <div className="flex-1 p-4 space-y-6">
            {/* 문제 수 설정 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                문제 수
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 10, 15, 20].map(num => (
                  <button
                    key={num}
                    onClick={() => setNumQuestions(num)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      numQuestions === num
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* 문제 유형 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                문제 유형
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="객관식"
                    checked={questionType === '객관식'}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">객관식</div>
                    <div className="text-sm text-gray-500">5지선다형 문제</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="주관식"
                    checked={questionType === '주관식'}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">주관식</div>
                    <div className="text-sm text-gray-500">서술형 문제</div>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* 생성 버튼 */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleGenerate}
              disabled={!file || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  문제를 생성중이에요...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  문제 생성하기
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemGeneratorApp;
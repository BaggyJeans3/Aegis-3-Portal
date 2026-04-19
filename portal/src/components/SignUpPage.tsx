import React, { useState, useRef } from 'react';

const SignUpPage: React.FC = () => {
  const [textSpec, setTextSpec] = useState('');
  const [urlSpec, setUrlSpec] = useState('');
  const [fileSpec, setFileSpec] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileSpec(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFileSpec(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSignUp = () => {
    // API 연결 가입 기능: 여기에서 API 명세서를 처리하세요.
    console.log('API 명세서 (URL):', urlSpec);
    console.log('API 명세서 (File):', fileSpec?.name);
    console.log('API 명세서 (Text):', textSpec);

    alert(
      'API 명세서가 성공적으로 등록되었습니다. Aegis-3가 분석을 시작합니다.'
    );
    // 실제로는 백엔드 API 호출 등 추가
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-6 py-12 lg:py-20">
      <div className="absolute inset-0 bg-violet-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative rounded-3xl border border-white/5 bg-zinc-900/60 p-8 sm:p-14 shadow-2xl backdrop-blur-2xl">
        <div className="mb-12 space-y-5 text-center flex flex-col items-center">
          <p className="inline-flex px-5 py-2 rounded-full bg-white/5 text-xs font-bold uppercase tracking-[0.2em] text-blue-400 border border-white/5 shadow-sm">
            API 관리/등록
          </p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl drop-shadow-sm">
            API 명세서 등록/관리
          </h1>
          <p className="max-w-xl text-zinc-400 text-lg leading-relaxed">
            원하는 방식(URL, 파일, 텍스트)으로 API 명세서를 입력하고 가입을
            진행하세요.
          </p>
        </div>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-400">
                <svg
                  className="w-6 h-6 text-violet-400 shadow-sm"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              API 명세서 입력
            </h2>
            <p className="mt-3 text-base text-zinc-400 text-center">
              OpenAPI, Swagger, 또는 원하는 API 문서를 제공해주세요.
            </p>
          </div>

          <div className="space-y-8 mt-6">
            {/* URL Input */}
            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">
                API 명세서 URL
              </label>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-[1.5rem] blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
              <input
                type="text"
                value={urlSpec}
                onChange={(e) => setUrlSpec(e.target.value)}
                placeholder="https://api.example.com/docs"
                className="relative w-full rounded-[1.5rem] border border-white/10 bg-black/80 px-6 py-4 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-mono text-sm transition-all"
              />
            </div>

            {/* File Input */}
            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">
                API 명세서 파일
              </label>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-[1.5rem] blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
              <div className="relative flex items-center justify-between w-full rounded-[1.5rem] border border-white/10 bg-black/80 px-6 py-4 text-zinc-200 shadow-inner focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-500/10 file:text-violet-400 hover:file:bg-violet-500/20 transition-all cursor-pointer focus:outline-none"
                />
                {fileSpec && (
                  <button
                    onClick={clearFile}
                    className="ml-4 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="파일 삭제"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Textarea */}
            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">
                API 명세서 텍스트
              </label>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-[2rem] blur-md opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
              <textarea
                value={textSpec}
                onChange={(e) => setTextSpec(e.target.value)}
                placeholder="API 명세서(JSON, YAML 등)를 텍스트로 입력하세요."
                rows={8}
                className="relative w-full rounded-[2rem] border border-white/10 bg-black/80 px-8 py-6 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-mono text-sm leading-relaxed transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <button
              onClick={handleSignUp}
              className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 px-10 py-5 text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]"
            >
              <span>등록</span>
              <svg
                className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignUpPage;

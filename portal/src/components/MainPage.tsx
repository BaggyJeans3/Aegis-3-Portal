import React from 'react';

const MainPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#0b0c10] px-6 sm:px-12 lg:px-24 pt-20 pb-16">
      <div className="max-w-[1200px] mx-auto space-y-24">
        {/* Hero Section */}
        <section className="relative w-full">
          {/* Subtle right glow (matching image) */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-start gap-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-500/30 bg-[#1e293b]/30 px-5 py-2 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
              <span className="text-[15px] font-bold tracking-wide text-blue-400">
                중부대학교 정보보호학 졸업작품 프로젝트
              </span>
            </div>

            {/* Heading */}
            <h1 className="flex flex-col gap-1 tracking-tight font-black">
              <span className="text-[4rem] sm:text-[5rem] lg:text-[6.5rem] leading-[1.1] text-slate-100 drop-shadow-sm">
                Aegis-3를
              </span>
              <span className="text-[4rem] sm:text-[5rem] lg:text-[6.5rem] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                소개합니다
              </span>
            </h1>

            {/* Features List */}
            <div className="mt-6 flex flex-col gap-7">
              <div className="flex items-center gap-5">
                <div className="flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl text-slate-300 font-medium tracking-tight">
                  개발 단계(Shift-Left)에서 자동생성되는 SHADOW API로 단순
                  스캐닝 차단
                </p>
              </div>

              <div className="flex items-center gap-5">
                <div className="flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl text-slate-300 font-medium tracking-tight">
                  내부로 침투한 정교한 위협은 LLM기반 SOAR가 분석 및 대응
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="space-y-8">
          <div className="flex flex-col gap-8 sm:flex-row">
            <article className="flex-1 group rounded-[2rem] border border-white/10 bg-[#12131a] p-8 hover:bg-[#161720] transition-all duration-300 w-full overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Aegis-3란?
                </h2>
                <p className="text-slate-400 leading-relaxed font-light">
                  Aegis-3는 클라우드 환경에서 Shadow API를 공격 유인용으로
                  역이용하여 기업의 자산을 보호하고, 트래픽을 지능적으로
                  관리하는 SaaS형 차세대 API 보안 솔루션입니다. 직관적인 통합
                  대시보드를 통해 관리자가 위협 상황을 실시간으로 감시하고 전체
                  API 생태계를 한눈에 파악하며 완벽하게 통제할 수 있는 환경을
                  제공합니다.
                </p>
              </div>
            </article>
            <article className="flex-1 group rounded-[2rem] border border-white/10 bg-[#12131a] p-8 hover:bg-[#161720] transition-all duration-300 w-full overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-4">
                  왜 이 서비스인가?
                </h2>
                <p className="text-slate-400 leading-relaxed font-light">
                  API 명세서 업로드로 보안 라우팅을 자동화하며, LLM 기반
                  에이전트가 공격 리스크를 실시간 분석합니다. 탐지된 위협에 대한
                  대응책을 격리된 EC2 가상 서버에서 검증한 후 최적의 방어 룰을
                  제안하고 주입합니다. 단순 차단을 넘어 공격자를 기만하는 트랩과
                  지능형 자가 학습 엔진을 통해, 관리 공백 없는 자율형 API 보안
                  생태계를 구현합니다.
                </p>
              </div>
            </article>
          </div>

          {/* Dashboard Preview Section */}
          <div className="mt-16 border-t border-white/5 pt-16">
            <div className="text-center mb-16">
              <p className="inline-flex px-4 py-1.5 mb-4 rounded-full bg-violet-500/10 text-xs font-bold uppercase tracking-widest text-violet-400 border border-violet-500/20">
                Preview
              </p>
              <h2 className="text-3xl font-bold text-white mb-4">
                API 등록 후 제공되는{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                  지능형 대시보드
                </span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                등록된 명세서를 바탕으로 LLM 에이전트가 실시간으로 위협을
                분석하고, 로그와 함께 최적의 기만 및 방어 전략을 직관적으로
                제안합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {/* Terminal Logs & LLM Conversation */}
              <div className="relative rounded-[2rem] border border-white/10 bg-[#0d0e12] p-6 shadow-2xl flex flex-col h-[500px] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-12 bg-white/5 border-b border-white/10 flex items-center px-5 gap-2 backdrop-blur-md z-10">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="ml-3 text-xs text-zinc-400 font-sans tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-violet-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    Aegis-3 LLM Agent & Terminal
                  </span>
                </div>

                <div className="mt-10 space-y-4 flex-1 overflow-y-auto pr-2 font-mono text-sm custom-scrollbar pb-4">
                  <div className="text-zinc-500">
                    [{new Date().toLocaleTimeString()}] System Initialized.
                  </div>
                  <div className="text-blue-400/90">
                    [SYS] API 명세서 분석 시작 (45개 엔드포인트)
                  </div>
                  <div className="text-yellow-400/90">
                    [WARN] Shadow API 탐지:{' '}
                    <span className="text-white">
                      /api/v1/internal/debug-user
                    </span>{' '}
                    (미등록)
                  </div>

                  {/* LLM Interaction Bubble 1 */}
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-5 my-6 font-sans relative shadow-lg shadow-violet-500/5 ml-4">
                    <div className="absolute -left-[21px] top-5 w-2 h-2 bg-violet-500 rounded-full ring-4 ring-[#0d0e12]"></div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-violet-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="font-bold text-violet-300 text-xs tracking-wide">
                        LLM 위협 분석
                      </span>
                    </div>
                    <p className="text-[15px] text-slate-300 leading-relaxed font-light">
                      "미등록 엔드포인트인{' '}
                      <code className="bg-black/40 px-1.5 py-0.5 rounded text-violet-200 text-sm font-mono border border-white/5">
                        debug-user
                      </code>
                      로 비정상 접근 패턴이 관측되었습니다. 해당 경로는 내부
                      정보를 노출할 위험(Risk Score: 87/100)이 매의 큽니다. 단순
                      차단 대신 자사의 <strong>그림자 트랩(HoneyPot)</strong>
                      으로 우회시켜 공격자의 의도를 파악하는 것을 제안합니다."
                    </p>
                  </div>

                  <div className="text-blue-400/90">
                    [SYS] LLM 제안 승인. SOAR 방어 룰 생성 중...
                  </div>
                  <div className="text-green-400/90">
                    [SUCCESS] 방어 룰 자동 적용 완료 (Shadow Trap 라우팅 활성화)
                  </div>
                  <div className="text-yellow-400/90">
                    [WARN] 취약한 인증 구간 탐지:{' '}
                    <span className="text-white">/api/v2/payment/process</span>
                  </div>

                  {/* LLM Interaction Bubble 2 */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 my-6 font-sans relative shadow-lg shadow-blue-500/5 ml-4">
                    <div className="absolute -left-[21px] top-5 w-2 h-2 bg-blue-500 rounded-full ring-4 ring-[#0d0e12]"></div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-blue-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <span className="font-bold text-blue-300 text-xs tracking-wide">
                        LLM 대응 제안
                      </span>
                    </div>
                    <p className="text-[15px] text-slate-300 leading-relaxed font-light">
                      "추가적인 스캐닝 공격에 대응하기 위해 트랩 구성을
                      완료했습니다. 또한,{' '}
                      <code className="bg-black/40 px-1.5 py-0.5 rounded text-blue-200 text-sm font-mono border border-white/5">
                        /payment/process
                      </code>{' '}
                      구간의 취약한 인증을 보호하기 위해{' '}
                      <strong>다중 인증(MFA) 요구 및 Rate Limiting</strong> 방어
                      정책 삽입을 제안합니다. 이를 통해 서비스 중단 없이 위협을
                      통제할 수 있습니다."
                    </p>
                  </div>
                  <div className="text-zinc-500 animate-pulse mt-4 flex items-center gap-2">
                    _{' '}
                    <span className="text-xs font-sans">
                      Awaiting next event...
                    </span>
                  </div>
                </div>
              </div>

              {/* Solutions List (Right side) */}
              <div className="flex flex-col gap-5 justify-center">
                <div className="group rounded-[1.5rem] border border-white/5 bg-[#12131a] p-8 hover:bg-[#161720] transition-all duration-500 shadow-xl hover:-translate-x-2 border-l-4 border-l-transparent hover:border-l-violet-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-colors"></div>
                  <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors flex items-center gap-3 relative z-10">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]"></span>
                    안보이는 트랩 구축
                  </h3>
                  <p className="mt-4 text-[15px] text-slate-400 leading-relaxed font-light relative z-10">
                    대시보드에서 LLM의 제안을 승인하면, 미등록 API에 접근하는
                    악의적 트래픽을 가상의 샌드박스로 자동 라우팅합니다. 정상
                    서비스의 타격 없이 공격자의 데이터와 패턴을 안전하게
                    수집합니다.
                  </p>
                </div>

                <div className="group rounded-[1.5rem] border border-white/5 bg-[#12131a] p-8 hover:bg-[#161720] transition-all duration-500 shadow-xl hover:-translate-x-2 border-l-4 border-l-transparent hover:border-l-blue-400 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-3 relative z-10">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]"></span>
                    지능형 방어 룰(SOAR) 자동 적용
                  </h3>
                  <p className="mt-4 text-[15px] text-slate-400 leading-relaxed font-light relative z-10">
                    분석된 로그에 따라 즉각적인 대응 규칙이 생성됩니다. LLM
                    에이전트가 제안한 Rate Limiting 및 임계치 기반 차단 규칙이
                    WAF에 실시간 주입되어 보안 운영자의 개입을 최소화합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MainPage;

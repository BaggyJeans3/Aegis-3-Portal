import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { registerCustomer } from '../lib/api';

/**
 * API 명세서(고객사) 등록 페이지.
 *
 * 흐름:
 *   1. Supabase 로그인 확인
 *   2. registerCustomer() 가 자동으로 Authorization 헤더에 토큰 첨부
 *   3. 백엔드가 토큰을 검증하고 sub 클레임에서 supabase_user_id 추출
 *   4. PostgreSQL tenants + routers 테이블에 INSERT
 */
const ApiManagePage: React.FC = () => {
  // tenants 로 갈 값
  const [companyName, setCompanyName] = useState('');
  const [planType, setPlanType] = useState('FREE');
  const [specText, setSpecText] = useState('');
  // routers 로 갈 값
  const [inboundDomain, setInboundDomain] = useState('');
  const [targetOrigin, setTargetOrigin] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegisterApi = async () => {
    if (!companyName.trim()) {
      alert('고객사명을 입력해주세요.');
      return;
    }
    if (!specText.trim()) {
      alert('API 명세서 내용을 입력해주세요.');
      return;
    }
    if (!inboundDomain.trim()) {
      alert('보호 대상 도메인을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 로그인 확인 (실제 토큰 첨부는 registerCustomer 내부에서)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        alert('로그인이 필요합니다.');
        setIsSubmitting(false);
        return;
      }

      const customer = await registerCustomer({
        company_name: companyName.trim(),
        plan_type: planType,
        spec_text: specText.trim(),
        inbound_domain: inboundDomain.trim(),
        target_origin: targetOrigin.trim(),
      });

      alert(`고객사가 등록되었습니다.\n발급된 API Key: ${customer.api_key}`);
      navigate('/customer-dashboard');
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      alert('오류가 발생했습니다: ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-6 py-12 lg:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
            고객사 정보와 API 명세서를 입력하면 보호 대상 고객사로 등록됩니다.
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
              고객사 / API 명세서 입력
            </h2>
            <p className="mt-3 text-base text-zinc-400 text-center">
              OpenAPI, Swagger 등 API 명세서를 텍스트로 입력해주세요.
            </p>
          </div>

          <div className="space-y-8 mt-6">
            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">
                고객사명 <span className="text-violet-400">*</span>
              </label>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-[1.5rem] blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="예: 머쉬옵 주식회사"
                className="relative w-full rounded-[1.5rem] border border-white/10 bg-black/80 px-6 py-4 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-sans text-sm transition-all"
              />
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">
                요금제
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="relative w-full rounded-[1.5rem] border border-white/10 bg-black/80 px-6 py-4 text-zinc-200 shadow-inner focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-sans text-sm transition-all appearance-none cursor-pointer"
              >
                <option value="FREE" className="bg-zinc-900">
                  FREE
                </option>
                <option value="PRO" className="bg-zinc-900">
                  PRO
                </option>
                <option value="ENTERPRISE" className="bg-zinc-900">
                  ENTERPRISE
                </option>
              </select>
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">
                보호 대상 도메인 <span className="text-violet-400">*</span>
              </label>
              <input
                type="text"
                value={inboundDomain}
                onChange={(e) => setInboundDomain(e.target.value)}
                placeholder="예: api.customer.com (요청이 들어오는 도메인)"
                className="relative w-full rounded-[1.5rem] border border-white/10 bg-black/80 px-6 py-4 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-mono text-sm transition-all"
              />
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">
                실제 서버 주소 (Origin)
              </label>
              <input
                type="text"
                value={targetOrigin}
                onChange={(e) => setTargetOrigin(e.target.value)}
                placeholder="예: http://168.110.101.66:81 (보호할 실제 서버 주소)"
                className="relative w-full rounded-[1.5rem] border border-white/10 bg-black/80 px-6 py-4 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-mono text-sm transition-all"
              />
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">
                API 명세서 내용 <span className="text-violet-400">*</span>
              </label>
              <textarea
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                placeholder="API 명세서(OpenAPI/Swagger JSON, YAML 등)를 텍스트로 붙여넣으세요."
                rows={10}
                className="relative w-full rounded-[2rem] border border-white/10 bg-black/80 px-8 py-6 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-mono text-sm leading-relaxed transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <button
              onClick={handleRegisterApi}
              disabled={isSubmitting}
              className={`group relative inline-flex items-center justify-center gap-3 rounded-full px-10 py-5 text-lg font-bold text-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                isSubmitting
                  ? 'bg-zinc-600 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-br from-blue-500 to-violet-600 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]'
              }`}
            >
              <span>{isSubmitting ? '등록 중...' : '등록하기'}</span>
              {!isSubmitting && (
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
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ApiManagePage;

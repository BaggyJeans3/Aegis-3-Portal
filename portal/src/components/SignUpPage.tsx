import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    userName: '',
    password: '',
    securityManagerEmail: '',
    companyPhone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.companyName) {
      alert('필수 정보를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          company_name: formData.companyName,
          user_name: formData.userName,
          security_manager_email: formData.securityManagerEmail,
          company_phone: formData.companyPhone,
        },
      },
    });

    setIsLoading(false);

    // [추가된 코드] 콘솔창에 가입 결과를 띄워줍니다 (테스트/디버깅용)
    console.log('🎉 [테스트용] 프론트엔드로 전달된 가입 결과 데이터:', data);

    if (error) {
      alert(`회원가입 실패: ${error.message}`);
      return;
    }

    alert('회원가입 성공! 가입하신 메일로 인증 링크가 발송되었을 수 있습니다.');
    navigate('/login');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto px-6 py-12 lg:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative rounded-3xl border border-white/5 bg-zinc-900/60 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
        <div className="mb-10 text-center flex flex-col items-center">
          <p className="inline-flex px-4 py-1.5 mb-4 rounded-full bg-violet-500/10 text-xs font-bold uppercase tracking-widest text-violet-400 border border-violet-500/20">
            Create Account
          </p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            회원가입
          </h1>
          <p className="mt-3 text-zinc-400 text-sm">
            Aegis-3 서비스를 이용하기 위한 기업 정보를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">회사명 *</label>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="애지스보안(주)"
                className="relative w-full rounded-2xl border border-white/10 bg-black/80 px-5 py-3 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none"
              />
            </div>
            
            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">이름 (담당자) *</label>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="홍길동"
                className="relative w-full rounded-2xl border border-white/10 bg-black/80 px-5 py-3 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">회사 기업 이메일 *</label>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="company@example.com (로그인 아이디)"
              className="relative w-full rounded-2xl border border-white/10 bg-black/80 px-5 py-3 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none"
            />
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">비밀번호 *</label>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="relative w-full rounded-2xl border border-white/10 bg-black/80 px-5 py-3 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">보안담당자 이메일</label>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
              <input
                type="email"
                name="securityManagerEmail"
                value={formData.securityManagerEmail}
                onChange={handleChange}
                placeholder="security@example.com"
                className="relative w-full rounded-2xl border border-white/10 bg-black/80 px-5 py-3 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none"
              />
            </div>
            
            <div className="relative group">
              <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">회사 전화번호</label>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
              <input
                type="tel"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="02-1234-5678"
                className="relative w-full rounded-2xl border border-white/10 bg-black/80 px-5 py-3 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? '가입 처리 중...' : '가입하기'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-400">
          이미 계정이 있으신가요?{' '}
          <Link
            to="/login"
            className="text-blue-400 font-medium hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

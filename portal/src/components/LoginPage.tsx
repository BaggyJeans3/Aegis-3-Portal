import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      alert(`로그인 실패: ${error.message}`);
      return;
    }

    // 로그인 성공 시 API 관리 페이지로 이동
    navigate('/api-manage');
  };

  return (
    <div className="relative w-full max-w-md mx-auto px-6 py-12 lg:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="absolute inset-0 bg-violet-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative rounded-3xl border border-white/5 bg-zinc-900/60 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-6">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            로그인
          </h1>
          <p className="mt-3 text-zinc-400 text-sm">
            Aegis-3 관리자 계정에 로그인하세요.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <label className="block text-sm font-medium text-zinc-300 mb-2 ml-2">
              회사 기업 이메일
            </label>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="company@example.com"
              className="relative w-full rounded-2xl border border-white/10 bg-black/80 px-5 py-3.5 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-sans transition-all"
            />
          </div>

          <div className="relative group">
            <div className="flex justify-between items-center mb-2 ml-2 mr-2">
              <label className="block text-sm font-medium text-zinc-300">
                비밀번호
              </label>
              
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="relative w-full rounded-2xl border border-white/10 bg-black/80 px-5 py-3.5 text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-sans transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? '로그인 중...' : '로그인'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-400">
          계정이 없으신가요?{' '}
          <Link
            to="/signup"
            className="text-violet-400 font-medium hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            회원가입하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';
import MainPage from './components/MainPage';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import ApiManagePage from './components/ApiManagePage';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 1. 첫 로딩 시 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. 로그인/로그아웃 등 인증 상태 변경 감지 리스너 등록
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0b0c10] text-zinc-300 font-sans selection:bg-violet-500/30 flex flex-col">
        <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
          <div className="mx-auto flex max-w-6xl w-full items-center justify-between px-6 py-5">
            <Link to="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              SHADOW API 기만 기술과 LLM 기반의 지능형 심층 보안 자동 대응 시스템 Aegis-3
            </Link>
            <nav>
              <ul className="flex gap-2 text-sm font-medium items-center">
                <li>
                  <Link
                    className="rounded-full px-5 py-2.5 transition-all duration-300 hover:bg-white/10 hover:text-white"
                    to="/"
                  >
                    메인 페이지
                  </Link>
                </li>
                {!session ? (
                  <li>
                    <Link
                      className="rounded-full px-5 py-2.5 transition-all duration-300 bg-violet-500/10 text-violet-400 hover:bg-violet-500 hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                      to="/login"
                    >
                      로그인
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link
                        className="rounded-full px-5 py-2.5 transition-all duration-300 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                        to="/api-manage"
                      >
                        API 관리
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="rounded-full px-5 py-2.5 transition-all duration-300 hover:bg-red-500/10 text-zinc-400 hover:text-red-400"
                      >
                        로그아웃
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </header>

        <main className="w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col pt-4">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/api-manage" element={<ApiManagePage />} />
          </Routes>
        </main>

        <footer className="mt-auto border-t border-white/5 bg-black/20 px-6 py-8">
          <div className="mx-auto w-full flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between text-zinc-500">
            <p className="text-sm">
              © 2026 SHADOW API 기만 기술과 LLM 기반의 지능형 심층 보안 자동 대응 시스템 Aegis-3
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <a className="transition hover:text-violet-400" href="#">서비스 소개</a>
              <a className="transition hover:text-violet-400" href="#">문의</a>
              <a className="transition hover:text-violet-400" href="#">개인정보처리방침</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

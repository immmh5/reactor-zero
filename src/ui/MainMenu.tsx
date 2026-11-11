/**
 * LAB GUARDIAN: REACTOR ZERO - Main Menu & Title Screen
 * Bespoke title lockup, live 3D preview backdrop, and accessible game actions
 */

import React, { useEffect } from 'react';
import { Play, ShieldAlert, Sliders, Info } from 'lucide-react';
import { sounds } from '../game/audio/SoundEffects';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenControls: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenControls,
  onOpenSettings,
}) => {
  // Allow starting game with Enter or Space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        sounds.playSuccess();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-12 bg-gradient-to-t from-[#050811]/90 via-[#050811]/50 to-transparent pointer-events-none select-none">
      {/* Top Banner / Security Status */}
      <header className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>FACILITY SECTOR 07 // DEEP CORE RESEARCH LAB</span>
        </div>

        <div className="text-right font-mono text-[11px] text-slate-400">
          <span className="text-amber-400 font-bold ml-1">تنبيه أمان:</span>
          المفاعل في حالة عدم استقرار حراري
        </div>
      </header>

      {/* Hero Title & Actions Center (RTL aligned) */}
      <main className="max-w-xl flex flex-col gap-6 my-auto pointer-events-auto text-right">
        {/* Bespoke Sci-Fi Title Lockup */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold tracking-widest uppercase">
            <span className="w-8 h-[2px] bg-cyan-400" />
            <span>محاكاة علمية وأكشن ثلاثية الأبعاد</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white font-sans drop-shadow-[0_4px_24px_rgba(0,240,255,0.25)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">
              LAB GUARDIAN
            </span>
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-wider font-mono">
              REACTOR ZERO
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              المفاعل صفر
            </span>
          </div>

          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            حدث تسارع غير منضبط في قلب مفاعل الاندماج النظيف. بصفتك حارس المختبر وكبير أخصائيي الأمان الكيميائي، تحكم في بذلة العزل وانزل إلى غرفة المفاعل لمنع الانهيار الحراري.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              sounds.playSuccess();
              onStartGame();
            }}
            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-cyan-300/40"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>ابدأ المهمة (Enter)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playInteract();
              onOpenControls();
            }}
            className="py-3 px-5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center gap-2 transition-all"
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span>دليل التحكم</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playInteract();
              onOpenSettings();
            }}
            className="py-3 px-5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center gap-2 transition-all"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>الإعدادات</span>
          </button>
        </div>
      </main>

      {/* Flat Control Legend Line */}
      <footer className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono border-t border-slate-800/80 pt-4 pointer-events-auto">
        <div>
          <span>WASD التحرك · SHIFT الركض · SPACE القفز · E التفاعل مع المحطات · ESC الإيقاف</span>
        </div>
        <div className="text-slate-500 text-[11px] mt-2 sm:mt-0">
          SECURE PROTOCOL V1.0 // 3D BABYLON ENGINE
        </div>
      </footer>
    </div>
  );
};

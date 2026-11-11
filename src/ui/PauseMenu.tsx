/**
 * LAB GUARDIAN - Pause Menu Component
 */

import React from 'react';
import { Play, RotateCcw, Info, Sliders, Home, X, Compass, MapPin, GraduationCap } from 'lucide-react';
import { sounds } from '../game/audio/SoundEffects';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenControls: () => void;
  onOpenSettings: () => void;
  onReturnToMenu: () => void;
  onOpenCampaignMap?: () => void;
  onOpenAcademy?: () => void;
  onReturnToHub?: () => void;
  onResetCampaign?: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onOpenControls,
  onOpenSettings,
  onReturnToMenu,
  onOpenCampaignMap,
  onOpenAcademy,
  onReturnToHub,
  onResetCampaign,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#080d1a] border-2 border-cyan-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-xl font-black text-white tracking-wide">تم إيقاف المحاكاة مؤقتاً</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playInteract();
              onResume();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buttons List */}
        <div className="flex flex-col gap-2.5">
          {/* Resume */}
          <button
            type="button"
            onClick={() => {
              sounds.playSuccess();
              onResume();
            }}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>استئناف اللعب</span>
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={() => {
              sounds.playInteract();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>إعادة تشغيل المحاكاة</span>
          </button>

          {/* Sector Map */}
          {onOpenCampaignMap && (
            <button
              type="button"
              onClick={() => {
                sounds.playInteract();
                onOpenCampaignMap();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 hover:text-white font-semibold text-sm border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>خريطة قطاعات الحملة (M)</span>
            </button>
          )}

          {/* Stoichiometry Academy */}
          {onOpenAcademy && (
            <button
              type="button"
              onClick={() => {
                sounds.playInteract();
                onOpenAcademy();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-200 hover:text-white font-semibold text-sm border border-indigo-500/40 hover:border-indigo-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>أكاديمية الحسابات الكيميائية (Stoichiometry Academy)</span>
            </button>
          )}

          {/* Return to Hub */}
          {onReturnToHub && (
            <button
              type="button"
              onClick={() => {
                sounds.playInteract();
                onReturnToHub();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>العودة إلى المقر الرئيسي (HUB)</span>
            </button>
          )}

          {/* Controls */}
          <button
            type="button"
            onClick={() => {
              sounds.playInteract();
              onOpenControls();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span>دليل التحكم</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              sounds.playInteract();
              onOpenSettings();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>الإعدادات الصوتية والتأثيرات</span>
          </button>

          {/* Reset Campaign Progress */}
          {onResetCampaign && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('هل أنت متأكد من رغبتك في إعادة تعيين تقدم الحملة وبدء لعبة جديدة؟')) {
                  sounds.playImpact();
                  onResetCampaign();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-amber-950/20 hover:bg-amber-900/30 text-amber-300 hover:text-amber-100 font-semibold text-xs border border-amber-800/40 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>إعادة تعيين تقدم الحملة (Reset Campaign)</span>
            </button>
          )}

          {/* Return to Menu */}
          <button
            type="button"
            onClick={() => {
              sounds.playInteract();
              onReturnToMenu();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 hover:text-rose-100 font-semibold text-sm border border-rose-800/50 flex items-center justify-center gap-2 transition-colors mt-1 cursor-pointer"
          >
            <Home className="w-4 h-4 text-rose-400" />
            <span>العودة للقائمة الرئيسية</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center font-mono text-[11px] text-slate-500 pt-2 border-t border-slate-800">
          <span>LAB GUARDIAN // REACTOR ZERO MISSION</span>
        </div>
      </div>
    </div>
  );
};

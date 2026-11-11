/**
 * LAB GUARDIAN - Advanced Settings Modal Component
 * Features:
 * - 4 independent audio sliders (Music, Ambience, SFX, Hazard Alarms)
 * - Master mute toggle
 * - Mouse Aiming Sensitivity slider (0.5x to 2.5x)
 * - Screen Danger Effects toggle (Vignette & Camera Trauma Shake)
 */

import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, Waves, Zap, Radio, BellRing, MousePointer, Sparkles } from 'lucide-react';
import { sounds } from '../game/audio/SoundEffects';

interface SettingsModalProps {
  isMuted: boolean;
  onToggleMute: () => void;
  mouseSensitivity?: number;
  onSensitivityChange?: (val: number) => void;
  screenEffectsEnabled?: boolean;
  onToggleScreenEffects?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isMuted,
  onToggleMute,
  mouseSensitivity = 1.0,
  onSensitivityChange,
  screenEffectsEnabled = true,
  onToggleScreenEffects,
  onClose,
}) => {
  const [musicVol, setMusicVol] = useState<number>(Math.round(sounds.musicVolume * 100));
  const [ambienceVol, setAmbienceVol] = useState<number>(Math.round(sounds.ambienceVolume * 100));
  const [sfxVol, setSfxVol] = useState<number>(Math.round(sounds.sfxVolume * 100));
  const [warningVol, setWarningVol] = useState<number>(Math.round(sounds.warningVolume * 100));
  const [sensitivity, setSensitivity] = useState<number>(mouseSensitivity);

  const handleMusicChange = (val: number) => {
    setMusicVol(val);
    sounds.setMusicVolume(val / 100);
  };

  const handleAmbienceChange = (val: number) => {
    setAmbienceVol(val);
    sounds.setAmbienceVolume(val / 100);
  };

  const handleSfxChange = (val: number) => {
    setSfxVol(val);
    sounds.setSfxVolume(val / 100);
  };

  const handleWarningChange = (val: number) => {
    setWarningVol(val);
    sounds.setWarningVolume(val / 100);
  };

  const handleSensChange = (val: number) => {
    setSensitivity(val);
    if (onSensitivityChange) {
      onSensitivityChange(val);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#080d1a] border-2 border-slate-700 rounded-3xl shadow-2xl p-5 flex flex-col gap-4 text-right max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="text-base font-black text-white">إعدادات المحاكاة والتحكم</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Mute & Screen Effects Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Master Mute */}
          <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span className="font-bold text-white text-xs">كتم الصوت العام</span>
            </div>
            <button
              type="button"
              onClick={onToggleMute}
              className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-colors ${
                isMuted
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                  : 'bg-cyan-950/60 text-cyan-300 border border-cyan-700'
              }`}
            >
              {isMuted ? 'مكتوم' : 'مفعّل'}
            </button>
          </div>

          {/* Screen Effects Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-xs">مؤثرات الخطر البصرية</span>
            </div>
            <button
              type="button"
              onClick={onToggleScreenEffects}
              className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-colors ${
                screenEffectsEnabled
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-700'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {screenEffectsEnabled ? 'مفعلة' : 'معطلة'}
            </button>
          </div>
        </div>

        {/* Mouse Sensitivity Slider */}
        <div className="flex flex-col gap-1.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 text-xs">
          <div className="flex justify-between items-center text-slate-200 font-bold">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <MousePointer className="w-4 h-4" />
              حساسية حركة الماوس والتصويب
            </span>
            <span className="font-mono text-cyan-300">{sensitivity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.2"
            step="0.1"
            value={sensitivity}
            onChange={(e) => handleSensChange(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* 4 Independent Volume Sliders */}
        <div className="flex flex-col gap-3 bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
          {/* Music Bus Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-slate-200 font-bold">
              <span className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-cyan-400" />
                الموسيقى التصويرية التخليقية
              </span>
              <span className="font-mono text-cyan-300">{musicVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVol}
              onChange={(e) => handleMusicChange(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Ambience Bus Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-slate-200 font-bold">
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-sky-400" />
                المؤثرات المحيطية للمفاعل (همس هادئ)
              </span>
              <span className="font-mono text-sky-300">{ambienceVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={ambienceVol}
              onChange={(e) => handleAmbienceChange(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          {/* SFX Bus Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-slate-200 font-bold">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                مؤثرات المعركة وإطلاق الليزر
              </span>
              <span className="font-mono text-amber-300">{sfxVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVol}
              onChange={(e) => handleSfxChange(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Warning & Hazard Alarm Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-slate-200 font-bold">
              <span className="flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-rose-400" />
                صفارات الإنذار ونبضات الخطر
              </span>
              <span className="font-mono text-rose-300">{warningVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={warningVol}
              onChange={(e) => handleWarningChange(Number(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Audio Test Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playPickup('keycard');
            setTimeout(() => sounds.playDamageImpact(), 180);
          }}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>اختبار صوت المؤثرات والإنذار</span>
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-lg shadow-cyan-600/30"
        >
          حفظ وإغلاق
        </button>
      </div>
    </div>
  );
};

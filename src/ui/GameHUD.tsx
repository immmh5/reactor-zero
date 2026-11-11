/**
 * LAB GUARDIAN - High-Tech Immersive Game HUD
 * Featuring:
 * - Upper compact Boss Health & Shield HUD (no screen occlusion)
 * - Centered Sci-Fi Crosshair & Reticle for Pointer Lock & First-Person Aiming
 * - Pointer Lock status toggle button (L) with ESC release indicator
 * - Camera Mode indicator badge (V) (First-Person / Third-Person)
 * - Dynamic Low-Health and Reactor Danger screen edge vignettes
 * - Animated floating pickup notification toast banners with Lucide icons
 * - Sleek, compact Arabic RTL typography
 */

import React from 'react';
import { InteractiveStation } from '../game/interaction/InteractionManager';
import { PickupNotificationEvent } from '../game/combat/CombatTypes';
import {
  Volume2,
  VolumeX,
  Pause,
  Shield,
  Zap,
  BatteryCharging,
  Flame,
  Clock,
  Crosshair,
  Lock,
  Unlock,
  Eye,
  HeartPulse,
  KeyRound,
  AlertTriangle,
  Bot,
  MapPin,
  Compass,
  GraduationCap,
} from 'lucide-react';

interface GameHUDProps {
  health: number;
  energy: number;
  stability: number;
  timerSeconds: number;
  score: number;
  combo: number;
  activeMissionIndex: number;
  bossHealth: number;
  bossMaxHealth: number;
  bossShield: number;
  promptStation: InteractiveStation | null;
  cameraMode: 'third-person' | 'first-person';
  isPointerLocked: boolean;
  pickupToasts: PickupNotificationEvent[];
  currentLocationNameAr?: string;
  currentLocationCodenameAr?: string;
  onOpenCampaignMap?: () => void;
  onOpenAcademy?: () => void;
  onTogglePointerLock: () => void;
  onToggleCameraMode: () => void;
  onPause: () => void;
  onInteract: () => void;
  onFire: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  health,
  energy,
  stability,
  timerSeconds,
  score,
  combo,
  activeMissionIndex,
  bossHealth,
  bossMaxHealth,
  bossShield,
  promptStation,
  cameraMode,
  isPointerLocked,
  pickupToasts,
  currentLocationNameAr,
  currentLocationCodenameAr,
  onOpenCampaignMap,
  onOpenAcademy,
  onTogglePointerLock,
  onToggleCameraMode,
  onPause,
  onInteract,
  onFire,
  isMuted,
  onToggleMute,
}) => {
  // Format MM:SS
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const isModerateHealth = health <= 50 && health > 30;
  const isLowHealth = health <= 30;
  const isCriticalHealth = health <= 15;

  const isModerateStability = stability <= 50 && stability > 30;
  const isLowStability = stability <= 30;
  const isMeltdownRisk = stability <= 15;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden select-none">
      {/* ======================================================== */}
      {/* 1. DYNAMIC DANGER SCREEN VIGNETTES                       */}
      {/* ======================================================== */}

      {/* Low Health Screen Vignette (Red Pulse) */}
      {isLowHealth && (
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            isCriticalHealth
              ? 'bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(225,29,72,0.45)_100%)] animate-pulse'
              : 'bg-[radial-gradient(ellipse_at_center,_transparent_65%,_rgba(225,29,72,0.22)_100%)]'
          }`}
        />
      )}

      {/* Reactor Instability Screen Edge Glow (Amber Pulse) */}
      {isLowStability && (
        <div
          className={`absolute inset-0 pointer-events-none border-2 transition-all duration-300 ${
            isMeltdownRisk
              ? 'border-rose-500/80 shadow-[inset_0_0_60px_rgba(244,63,94,0.35)] animate-pulse'
              : 'border-amber-500/60 shadow-[inset_0_0_40px_rgba(245,158,11,0.22)]'
          }`}
        />
      )}

      {/* Critical Alarm Banner when Health or Reactor is in Extreme Meltdown Risk */}
      {(isCriticalHealth || isMeltdownRisk || isLowStability) && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-950/90 border border-rose-600 text-rose-200 text-[11px] font-bold shadow-2xl animate-pulse pointer-events-auto">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>
            {isCriticalHealth
              ? 'تحذير أمني: طاقة درع بذلة العزل في مستوى حرج جداً (دون 15%)!'
              : isMeltdownRisk
              ? 'إنذار طوارئ أقصى: خطر وشيك لانهيار استقرار المفاعل النووي (دون 15%)!'
              : 'تحذير: هبوط استقرار المفاعل دون 30%! أنجز حسابات المحطات لإعادة التبريد'}
          </span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TOP HEADER ROW (Vitals, Reactor, Quick Tools)        */}
      {/* ======================================================== */}
      <header className="flex items-start justify-between gap-2.5 relative z-20">
        {/* Right Side: Operative Vitals Cluster (Compact, 20% reduced padding) */}
        <div className="flex flex-col gap-1 bg-[#080d1a]/95 border border-cyan-500/40 p-2 rounded-xl shadow-xl pointer-events-auto min-w-[170px]">
          <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold border-b border-cyan-900/60 pb-0.5">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-cyan-400" />
              بذلة العزل
            </span>
            <span className="font-mono text-slate-400 text-[9px] tabular-nums">OPERATIVE-01</span>
          </div>

          {/* Health Gauge */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-300 flex items-center gap-1">
                درع الحماية
                {isModerateHealth && <span className="text-amber-400 text-[9px] font-mono">(50%)</span>}
              </span>
              <span
                className={`font-mono tabular-nums ${
                  isCriticalHealth
                    ? 'text-rose-400 font-black animate-pulse'
                    : isLowHealth
                    ? 'text-amber-400'
                    : isModerateHealth
                    ? 'text-amber-300'
                    : 'text-cyan-400'
                }`}
              >
                {Math.round(health)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded overflow-hidden p-0.5 border border-cyan-950">
              <div
                className={`h-full transition-all duration-200 rounded ${
                  isCriticalHealth
                    ? 'bg-rose-500 animate-pulse'
                    : isLowHealth
                    ? 'bg-amber-500'
                    : isModerateHealth
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-l from-cyan-400 to-blue-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
              />
            </div>
          </div>

          {/* Energy Gauge */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                طاقة السلاح (F)
              </span>
              <span className="font-mono tabular-nums text-amber-400">{Math.round(energy)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded overflow-hidden p-0.5 border border-amber-950">
              <div
                className="h-full bg-gradient-to-l from-amber-400 to-yellow-500 transition-all duration-200 rounded"
                style={{ width: `${Math.max(0, Math.min(100, energy))}%` }}
              />
            </div>
          </div>

          {/* Current Sector Location Badge */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-cyan-950/80">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] text-slate-400 font-mono truncate">{currentLocationCodenameAr || 'المقر الرئيسي'}</span>
                <span className="text-[10px] font-bold text-white truncate">{currentLocationNameAr || 'المختبر المركزي: نقطة الصفر'}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onOpenAcademy && (
                <button
                  type="button"
                  onClick={onOpenAcademy}
                  className="px-1.5 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  title="فتح أكاديمية الحسابات الكيميائية واختبار التأهيل"
                  aria-label="أكاديمية الحسابات الكيميائية"
                >
                  <GraduationCap className="w-2.5 h-2.5 text-indigo-400" />
                  <span>الأكاديمية</span>
                </button>
              )}
              {onOpenCampaignMap && (
                <button
                  type="button"
                  onClick={onOpenCampaignMap}
                  className="px-1.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  title="فتح خريطة قطاعات الحملة (M)"
                  aria-label="خريطة القطاعات"
                >
                  <Compass className="w-2.5 h-2.5" />
                  <span>الخريطة (M)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center: Reactor Stability, Countdown & Upper Compact Boss HUD */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Reactor & Score Box (Compact padding) */}
          <div className="hidden sm:flex items-center justify-between gap-2.5 bg-[#080d1a]/95 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-xl pointer-events-auto min-w-[270px]">
            {/* Reactor Stability */}
            <div className="flex items-center gap-1.5">
              <Flame
                className={`w-3.5 h-3.5 ${
                  isLowStability ? 'text-rose-500 animate-bounce' : isModerateStability ? 'text-amber-400' : 'text-cyan-400'
                }`}
              />
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-semibold leading-none">
                  استقرار المفاعل
                </span>
                <span
                  className={`font-mono text-xs font-black tabular-nums ${
                    isLowStability
                      ? 'text-rose-400 animate-pulse'
                      : isModerateStability
                      ? 'text-amber-400'
                      : 'text-cyan-300'
                  }`}
                >
                  {Math.round(stability)}%
                </span>
              </div>
            </div>

            {/* Mission Timer */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
                {timeString}
              </span>
            </div>

            {/* Score & Combo */}
            <div className="text-left font-mono">
              <div className="text-[9px] text-slate-400 leading-none">النقاط</div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-white tabular-nums">{score}</span>
                {combo > 1 && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                    {combo}x
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Upper Compact Boss Health HUD (Top region, unobtrusive, no center occlusion) */}
          {bossHealth > 0 && (
            <aside
              aria-label="شريط طاقة الزعيم"
              className="flex flex-col gap-1 bg-[#080d1a]/95 border border-rose-500/50 px-2.5 py-1 rounded-xl shadow-2xl w-full max-w-[280px] pointer-events-auto"
            >
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-200">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <Bot className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>حارس المختبر الآلي (الزعيم)</span>
                </span>
                <span className="font-mono tabular-nums text-slate-300 text-[9px]">
                  {bossHealth} / {bossMaxHealth}
                </span>
              </div>

              {/* Boss Health Bar */}
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-rose-950">
                <div
                  className="h-full bg-gradient-to-l from-rose-500 to-red-600 transition-all duration-200 rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, (bossHealth / bossMaxHealth) * 100))}%`,
                  }}
                />
              </div>

              {/* Phase / Shield Indicator */}
              <div className="flex items-center justify-between text-[9px] font-mono leading-none">
                {bossShield > 0 ? (
                  <>
                    <span className="text-amber-400">المرحلة 1: درع حركي</span>
                    <span className="text-amber-300 font-bold">{bossShield}%</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-400 font-bold">المرحلة 2: الدرع معطل</span>
                    <span className="text-rose-400 font-bold">مكشوف للهجوم!</span>
                  </>
                )}
              </div>
            </aside>
          )}
        </div>

        {/* Left Side: Pointer Lock, Camera Mode, Audio, & Pause */}
        <div className="flex items-center gap-1.5 pointer-events-auto shrink-0 z-30">
          {/* Pointer Lock Toggle Button (L) */}
          <button
            type="button"
            onClick={onTogglePointerLock}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all text-xs font-bold shadow-md shrink-0 cursor-pointer ${
              isPointerLocked
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-cyan-500/20'
                : 'bg-[#080d1a]/95 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50'
            }`}
            title="تثبيت مؤشر التصويب (مفتاح L)"
            aria-label="تثبيت مؤشر التصويب"
          >
            {isPointerLocked ? <Lock className="w-3 h-3 text-cyan-400" /> : <Unlock className="w-3 h-3 text-slate-400" />}
            <span className="hidden lg:inline">{isPointerLocked ? 'التصويب مثبت (L)' : 'تثبيت التصويب (L)'}</span>
          </button>

          {/* Camera Mode Toggle Button (V) */}
          <button
            type="button"
            onClick={onToggleCameraMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all text-xs font-bold shadow-md shrink-0 cursor-pointer ${
              cameraMode === 'first-person'
                ? 'bg-indigo-950/90 border-indigo-400 text-indigo-200 shadow-indigo-500/20'
                : 'bg-[#080d1a]/95 border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500/50'
            }`}
            title="تبديل منظور الكاميرا (مفتاح V)"
            aria-label="تبديل منظور الكاميرا"
          >
            <Eye className="w-3 h-3 text-indigo-400" />
            <span className="hidden lg:inline">
              {cameraMode === 'first-person' ? 'شخص أول (V)' : 'شخص ثالث (V)'}
            </span>
          </button>

          {/* Mute Button */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 rounded-xl bg-[#080d1a]/95 border border-slate-700 text-cyan-300 hover:text-white hover:bg-cyan-950/50 transition-colors shadow-md shrink-0 cursor-pointer"
            title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
            aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Pause Button */}
          <button
            type="button"
            onClick={onPause}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#080d1a]/95 border border-slate-700 text-cyan-300 hover:text-white hover:bg-cyan-950/50 transition-colors shadow-md font-bold text-xs shrink-0 cursor-pointer"
            title="إيقاف مؤقت (Esc)"
            aria-label="إيقاف مؤقت"
          >
            <Pause className="w-3 h-3" />
            <span className="hidden sm:inline">إيقاف (Esc)</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. CENTER CROSSHAIR & AIMING RETICLE                    */}
      {/* ======================================================== */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
        {/* Reticle Container */}
        <div className="relative w-8 h-8 flex items-center justify-center opacity-75 hover:opacity-100 transition-opacity">
          {/* Center Dot */}
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isPointerLocked || cameraMode === 'first-person'
                ? 'bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                : 'bg-white/80'
            }`}
          />

          {/* Tick lines */}
          <div className="absolute top-0 w-0.5 h-2 bg-cyan-400/70" />
          <div className="absolute bottom-0 w-0.5 h-2 bg-cyan-400/70" />
          <div className="absolute left-0 h-0.5 w-2 bg-cyan-400/70" />
          <div className="absolute right-0 h-0.5 w-2 bg-cyan-400/70" />

          {/* Outer circle in Pointer Lock or First Person */}
          {(isPointerLocked || cameraMode === 'first-person') && (
            <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-pulse" />
          )}
        </div>
      </div>

      {/* Pointer Lock Notification Badge (Visible when mouse is locked) */}
      {isPointerLocked && (
        <div className="self-center mt-3 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-sm pointer-events-none animate-in fade-in duration-200">
          تم تثبيت التصويب · اضغط <kbd className="text-white font-bold">ESC</kbd> أو <kbd className="text-white font-bold">L</kbd> لإلغاء القفل
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. INTERACTION PROMPT MODAL STATION                     */}
      {/* ======================================================== */}
      {promptStation && (
        <aside
          aria-label="تنبيه التفاعل"
          className="self-center my-auto flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-150 z-20"
        >
          <div className="bg-[#050811]/95 border-2 border-cyan-400 p-3 rounded-xl shadow-2xl shadow-cyan-500/25 text-center max-w-sm pointer-events-auto">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <h4 className="text-xs font-black text-cyan-300">{promptStation.nameAr}</h4>
            </div>
            <div className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-900/60 font-mono text-xs text-amber-300 mb-1.5 font-bold dir-ltr">
              {promptStation.equationFormula}
            </div>
            <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
              {promptStation.descriptionAr}
            </p>
            <button
              type="button"
              onClick={onInteract}
              className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-cyan-600/40 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-cyan-200 text-[11px] font-mono font-bold border border-cyan-300/40">
                E
              </kbd>
              <span>
                {promptStation.id.startsWith('gate_') || promptStation.id.startsWith('transit_')
                  ? 'تفعيل بوابة العبور والانتقال'
                  : promptStation.id === 'hub_briefing'
                  ? 'بدء الاتصال التكتيكي المشفر'
                  : promptStation.id === 'hub_mission_dispatch'
                  ? 'فتح خريطة قطاعات الحملة'
                  : promptStation.id === 'hub_equipment'
                  ? 'شحن البذلة ومعايرة العتاد'
                  : 'فتح محطة الحسابات الكيميائية'}
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* ======================================================== */}
      {/* 5. FLOATING PICKUP NOTIFICATION TOAST BANNERS           */}
      {/* ======================================================== */}
      <div className="absolute bottom-16 right-4 z-30 flex flex-col gap-1.5 pointer-events-none max-w-xs">
        {pickupToasts.map((toast) => {
          let IconComponent = BatteryCharging;
          let iconColor = 'text-amber-400';
          let borderColor = 'border-amber-500/50';
          let bgColor = 'bg-amber-950/85';

          if (toast.type === 'health') {
            IconComponent = HeartPulse;
            iconColor = 'text-emerald-400';
            borderColor = 'border-emerald-500/50';
            bgColor = 'bg-emerald-950/85';
          } else if (toast.type === 'ammo') {
            IconComponent = Crosshair;
            iconColor = 'text-cyan-400';
            borderColor = 'border-cyan-500/50';
            bgColor = 'bg-cyan-950/85';
          } else if (toast.type === 'keycard') {
            IconComponent = KeyRound;
            iconColor = 'text-yellow-300';
            borderColor = 'border-yellow-400/60';
            bgColor = 'bg-yellow-950/90';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border ${borderColor} ${bgColor} text-white shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-200`}
            >
              <div className={`p-1.5 rounded-lg bg-black/40 ${iconColor}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white">{toast.nameAr}</span>
                <span className="text-[11px] font-semibold text-slate-200 font-mono">
                  {toast.detailAr || `+${toast.value} ${toast.type === 'health' ? 'صحة' : toast.type === 'keycard' ? 'نقاط تصريح' : 'طاقة'}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 6. BOTTOM FOOTER (Objective card & minimal key legend)  */}
      {/* ======================================================== */}
      <footer className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2 text-xs relative z-20">
        {/* Active Mission Objective Card (Compact) */}
        <div className="bg-[#080d1a]/95 border-r-4 border-r-cyan-400 border border-slate-800 p-2 rounded-xl shadow-xl max-w-xs pointer-events-auto">
          <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-0.5">
            <span>منهج الحسابات الكيميائية</span>
            <span className="font-mono text-slate-400 text-[9px]">المهمة {activeMissionIndex + 1} من 5</span>
          </div>
          <p className="text-slate-200 text-[10px] font-bold leading-tight">
            أنجز حسابات حفظ الكتلة والنسب المولية عبر المحطات الخمس لتعطيل درع المفاعل وهزيمة الروبوت الحارس.
          </p>
        </div>

        {/* Minimal Control Legend */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-400 bg-[#080d1a]/90 px-2.5 py-1 rounded-xl border border-slate-800 font-mono text-[10px] pointer-events-auto">
          <span className="text-slate-300">
            <kbd className="px-1 py-0.2 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">WASD</kbd> تحرك
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">
            <kbd className="px-1 py-0.2 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">F</kbd> إطلاق
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">
            <kbd className="px-1 py-0.2 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">L</kbd> تثبيت تصويب
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">
            <kbd className="px-1 py-0.2 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">V</kbd> منظور الكاميرا
          </span>
        </div>
      </footer>
    </div>
  );
};



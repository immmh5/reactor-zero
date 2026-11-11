/**
 * LAB GUARDIAN - Touch / Mobile Virtual Controls
 * Provides responsive touch d-pad, fire button, and action buttons without cluttering desktop view
 */

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, FastForward, ArrowUpCircle, Hand, Crosshair } from 'lucide-react';
import { InputManager } from '../game/input/InputManager';

interface VirtualControlsProps {
  inputManager: InputManager;
  hasPrompt: boolean;
  onInteract: () => void;
  onFire: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  inputManager,
  hasPrompt,
  onInteract,
  onFire,
}) => {
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  if (!isTouchDevice) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-15 flex justify-between items-end p-6 select-none md:hidden">
      {/* Direction Pad (Fixed LTR layout so Left is physically on the left, Right on the right) */}
      <div dir="ltr" className="flex flex-col items-center gap-1.5 pointer-events-auto bg-[#080d1a]/85 p-2 rounded-2xl border border-cyan-500/20">
        <button
          type="button"
          onTouchStart={() => inputManager.setVirtualMovement(0, 1)}
          onTouchEnd={() => inputManager.setVirtualMovement(0, 0)}
          className="w-12 h-12 rounded-xl bg-slate-800/80 active:bg-cyan-600 text-cyan-300 flex items-center justify-center border border-slate-700"
          aria-label="تحرك للأمام (W)"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onTouchStart={() => inputManager.setVirtualMovement(-1, 0)}
            onTouchEnd={() => inputManager.setVirtualMovement(0, 0)}
            className="w-12 h-12 rounded-xl bg-slate-800/80 active:bg-cyan-600 text-cyan-300 flex items-center justify-center border border-slate-700"
            aria-label="تحرك لليسار (A)"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onTouchStart={() => inputManager.setVirtualMovement(0, -1)}
            onTouchEnd={() => inputManager.setVirtualMovement(0, 0)}
            className="w-12 h-12 rounded-xl bg-slate-800/80 active:bg-cyan-600 text-cyan-300 flex items-center justify-center border border-slate-700"
            aria-label="تحرك للخلف (S)"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            type="button"
            onTouchStart={() => inputManager.setVirtualMovement(1, 0)}
            onTouchEnd={() => inputManager.setVirtualMovement(0, 0)}
            className="w-12 h-12 rounded-xl bg-slate-800/80 active:bg-cyan-600 text-cyan-300 flex items-center justify-center border border-slate-700"
            aria-label="تحرك لليمين (D)"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Action Buttons (Right) */}
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        {hasPrompt && (
          <button
            type="button"
            onClick={onInteract}
            className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold flex flex-col items-center justify-center shadow-lg shadow-cyan-600/40 border border-cyan-300 animate-bounce"
            aria-label="تفاعل"
          >
            <Hand className="w-5 h-5" />
            <span className="text-[9px]">تفاعل</span>
          </button>
        )}

        <div className="flex gap-2">
          {/* Fire Weapon Button */}
          <button
            type="button"
            onTouchStart={() => {
              inputManager.triggerVirtualFire();
              onFire();
            }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 active:scale-95 text-white font-bold flex flex-col items-center justify-center shadow-lg shadow-rose-600/40 border border-rose-400"
            aria-label="إطلاق نار"
          >
            <Crosshair className="w-6 h-6" />
            <span className="text-[9px]">إطلاق</span>
          </button>

          <button
            type="button"
            onTouchStart={() => inputManager.setVirtualSprint(true)}
            onTouchEnd={() => inputManager.setVirtualSprint(false)}
            className="w-12 h-12 rounded-xl bg-slate-800/80 active:bg-amber-600 text-amber-300 flex items-center justify-center border border-slate-700"
            aria-label="ركض سريع"
          >
            <FastForward className="w-5 h-5" />
          </button>

          <button
            type="button"
            onTouchStart={() => inputManager.triggerVirtualJump()}
            className="w-12 h-12 rounded-xl bg-slate-800/80 active:bg-blue-600 text-blue-300 flex items-center justify-center border border-slate-700"
            aria-label="قفز"
          >
            <ArrowUpCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

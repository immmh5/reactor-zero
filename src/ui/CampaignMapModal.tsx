/**
 * LAB GUARDIAN - Campaign Sector Map Modal
 * Interactive tactical map for sector visualization, mission objectives, and fast-travel transitions
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LocationDefinition, LocationId } from '../game/campaign/CampaignTypes';
import {
  MapPin,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ChevronLeft,
  X,
  Compass,
  Atom,
  Flame,
  Scale,
  Shield,
  GraduationCap,
} from 'lucide-react';

interface CampaignMapModalProps {
  locations: LocationDefinition[];
  currentLocationId: LocationId;
  onSelectLocation: (locationId: LocationId) => void;
  onClose: () => void;
}

export const CampaignMapModal: React.FC<CampaignMapModalProps> = ({
  locations,
  currentLocationId,
  onSelectLocation,
  onClose,
}) => {
  const getLocationIcon = (id: LocationId) => {
    switch (id) {
      case 'hub':
        return <Compass className="w-6 h-6 text-cyan-400" />;
      case 'academy':
        return <GraduationCap className="w-6 h-6 text-indigo-400" />;
      case 'research_wing':
        return <Atom className="w-6 h-6 text-emerald-400" />;
      case 'refinery':
        return <Scale className="w-6 h-6 text-amber-400" />;
      case 'vault':
        return <Flame className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#090e1a]/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.15)] text-slate-100 overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
                  خريطة قطاعات المنشأة والحملة الشاملة
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    SECTOR MAP v2.4
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  اختر القطاع المطلوب للانتقال والاطلاع على الأهداف العلمية والتكتيكية
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label="إغلاق الخريطة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sectors Grid */}
          <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((loc) => {
              const isCurrent = loc.id === currentLocationId;
              const isLocked = !loc.isUnlocked;

              return (
                <div
                  key={loc.id}
                  className={`relative flex flex-col justify-between p-5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                      : isLocked
                      ? 'border-slate-800/80 bg-slate-950/40 opacity-70'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  {/* Top Status Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                        {getLocationIcon(loc.id)}
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-mono">{loc.codenameAr}</div>
                        <h3 className="text-base font-bold text-white leading-tight">{loc.nameAr}</h3>
                      </div>
                    </div>

                    <div>
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/40">
                          <Radio className="w-3 h-3 animate-ping" />
                          الموقع الحالي
                        </span>
                      ) : loc.isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/40">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {loc.statusLabelAr || 'مكتمل بالكامل'}
                        </span>
                      ) : isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/40">
                          <Lock className="w-3.5 h-3.5" />
                          {loc.statusLabelAr || 'مغلق'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40">
                          <Shield className="w-3.5 h-3.5" />
                          {loc.statusLabelAr || 'متاح للعمليات'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">{loc.descriptionAr}</p>

                  {/* Educational Topic Callout */}
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-4">
                    <div className="text-[11px] font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                      <Atom className="w-3.5 h-3.5" />
                      المحتوى العلمي المستهدف:
                    </div>
                    <div className="text-xs text-slate-300 leading-normal">{loc.educationalFocusAr}</div>
                  </div>

                  {/* Footer details & Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>الخطر: {loc.hazardLevelAr}</span>
                    </div>

                    {isLocked ? (
                      <div className="text-[11px] text-rose-400 font-semibold text-left max-w-xs leading-tight">
                        {loc.lockReasonAr || loc.unlockRequirementAr}
                      </div>
                    ) : isCurrent ? (
                      <span className="text-xs text-cyan-400 font-semibold px-2 py-1">أنت هنا الآن</span>
                    ) : (
                      <button
                        onClick={() => onSelectLocation(loc.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.3)] active:scale-95 shrink-0"
                      >
                        <span>انتقال إلى هذا القطاع</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
            <div>
              يمكنك العودة إلى <span className="text-cyan-300 font-semibold">المقر الرئيسي (HUB)</span> في أي وقت
              لإعادة شحن الدروع أو الانتقال لقطاع آخر.
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

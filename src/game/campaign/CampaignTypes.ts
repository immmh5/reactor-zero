/**
 * LAB GUARDIAN - Campaign Progression & World Types
 */

export type LocationId = 'hub' | 'academy' | 'research_wing' | 'refinery' | 'vault';

export interface LocationDefinition {
  id: LocationId;
  nameAr: string;
  nameEn: string;
  codenameAr: string;
  subtitleAr: string;
  descriptionAr: string;
  educationalFocusAr: string;
  chemicalTopicAr: string;
  unlockRequirementAr: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  statusLabelAr?: string;
  lockReasonAr?: string;
  badgeAwardedAr?: string;
  spawnPosition: { x: number; y: number; z: number };
  spawnRotationY: number;
  boundaryRadius: number;
  targetMissions: number[];
  themeColor: string;
  accentColor: string;
  hazardLevelAr: string;
}

export interface CampaignSaveData {
  version: number;
  currentLocationId: LocationId;
  completedLocationIds: LocationId[];
  completedMissionNumbers: number[];
  passedExams?: string[];
  collectedPickupIds?: string[];
  playerScore: number;
  playerHealth: number;
  playerEnergy: number;
  highestCombo: number;
  unlockedLocations: LocationId[];
  campaignCompleted: boolean;
  playTimeSeconds: number;
  lastUpdated: number;
}

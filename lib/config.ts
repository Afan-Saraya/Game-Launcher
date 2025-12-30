import { Prize } from './types';

export const PRIZES: Prize[] = [
  { id: 1, label: "Partner Prize", icon: "gift", description: "Special partner reward - exclusive merchandise or voucher", color: "#EC4899", coins_reward: 0, xp_reward: 0 },
  { id: 2, label: "100 Coins", icon: "sparkles", description: "100 bonus coins added to your balance", color: "#7C3AED", coins_reward: 100, xp_reward: 50 },
  { id: 3, label: "Free Spin", icon: "rotateCcw", description: "One free spin token - spin again for free!", color: "#3B82F6", coins_reward: 120, xp_reward: 0 },
  { id: 4, label: "50 Coins", icon: "diamond", description: "50 bonus coins added to your balance", color: "#8B5CF6", coins_reward: 50, xp_reward: 25 },
  { id: 5, label: "XP Boost", icon: "box", description: "100 XP boost for your profile!", color: "#EC4899", coins_reward: 0, xp_reward: 100 },
  { id: 6, label: "200 Coins", icon: "crown", description: "200 bonus coins added to your balance", color: "#7C3AED", coins_reward: 200, xp_reward: 100 },
  { id: 7, label: "Try Again", icon: "clock", description: "Better luck next time - keep spinning!", color: "#3B82F6", coins_reward: 0, xp_reward: 10 },
  { id: 8, label: "Jackpot", icon: "zap", description: "Grand prize winner! 500 coins + 250 XP!", color: "#8B5CF6", coins_reward: 500, xp_reward: 250 },
];

export const GAME_CONFIG = {
  spinCost: 120,
  initialBalance: 14000,
  initialXp: 0,
  minRotations: 4,
  maxRotations: 8,
  spinDuration: 4000,
  segmentCount: 8,
};

export function calculateSpinRotation(prizeIndex: number, totalPrizes: number): number {
  const segmentAngle = 360 / totalPrizes;
  const prizeAngle = prizeIndex * segmentAngle;
  const randomRotations = Math.floor(Math.random() * 5) + 4;
  const baseRotation = randomRotations * 360;
  const finalRotation = baseRotation + (360 - prizeAngle) - (segmentAngle / 2);
  return finalRotation;
}

export function selectRandomPrize(prizes: Prize[]): Prize {
  const randomIndex = Math.floor(Math.random() * prizes.length);
  return prizes[randomIndex];
}

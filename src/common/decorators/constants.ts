export const PLAN_CREDITS = {
  'promo-image': { FREE: 10, CREATOR: 15, PRO: 10 },
  'promo-video': { FREE: 25, CREATOR: 25, PRO: 15 },
  audio: { FREE: 5, CREATOR: 5, PRO: 0 },
  subtitles: { FREE: 10, CREATOR: 10, PRO: 5 },
  'ai-agent': { FREE: null, CREATOR: 150, PRO: 150 },
  'campaign-automation': { FREE: null, CREATOR: 40, PRO: 20 },
  avatar: { FREE: null, CREATOR: null, PRO: 150 },
};
export const AUDIO_DURATION_CREDIT_COST: Record<number, number> = {
  20: 5,
  30: 10,
  60: 25,
};

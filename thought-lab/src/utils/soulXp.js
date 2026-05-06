/**
 * ═══════════════════════════════════════
 *  🧘 SOUL XP — Ascension Leveling System
 * ═══════════════════════════════════════
 *
 * Tiers are based on accumulated score (Soul XP):
 *   0 – 799  → The Wanderer  (Grey aura)
 *   800 – 2000 → The Stoic     (Cyan glow)
 *   2001 – 5000 → The Sage      (Violet pulse)
 *   5001+    → The Enlightened (Gold glow)
 */

export const TIERS = [
    {
        id: 'wanderer',
        title: 'The Wanderer',
        emoji: '🌫️',
        minXp: 0,
        maxXp: 799,
        color: '#9ca3af',
        glow: 'rgba(156,163,175,0.35)',
        border: '1px solid rgba(156,163,175,0.4)',
        shadow: '0 0 20px rgba(156,163,175,0.2)',
        aura: 'rgba(156,163,175,0.12)',
        description: 'You have taken your first steps on the path.',
    },
    {
        id: 'stoic',
        title: 'The Stoic',
        emoji: '🌊',
        minXp: 800,
        maxXp: 2000,
        color: '#00d4ff',
        glow: 'rgba(0,212,255,0.45)',
        border: '1px solid rgba(0,212,255,0.5)',
        shadow: '0 0 30px rgba(0,212,255,0.3)',
        aura: 'rgba(0,212,255,0.1)',
        description: 'Stillness begins. The mind finds its anchor.',
    },
    {
        id: 'sage',
        title: 'The Sage',
        emoji: '🔮',
        minXp: 2001,
        maxXp: 5000,
        color: '#a855f7',
        glow: 'rgba(168,85,247,0.45)',
        border: '1px solid rgba(168,85,247,0.5)',
        shadow: '0 0 40px rgba(168,85,247,0.35)',
        aura: 'rgba(168,85,247,0.12)',
        description: 'Deep wisdom flows through your consistent practice.',
    },
    {
        id: 'enlightened',
        title: 'The Enlightened',
        emoji: '✨',
        minXp: 5001,
        maxXp: Infinity,
        color: '#FBBF24',
        glow: 'rgba(251,191,36,0.55)',
        border: '2px solid rgba(251,191,36,0.7)',
        shadow: '0 0 60px rgba(251,191,36,0.4), 0 0 120px rgba(251,191,36,0.2)',
        aura: 'rgba(251,191,36,0.1)',
        description: 'You have transcended. Pure light, pure mind.',
    },
];

/**
 * Returns the full tier object for a given Soul XP score.
 * @param {number} score - The user's total score / Soul XP
 * @returns {Object} Tier object
 */
export const getTier = (score = 0) => {
    const numScore = Number(score) || 0;
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (numScore >= TIERS[i].minXp) return TIERS[i];
    }
    return TIERS[0];
};

/**
 * Returns XP progress to the next tier as a percentage (0-100).
 */
export const getXpProgress = (score = 0) => {
    const numScore = Number(score) || 0;
    const tier = getTier(numScore);
    if (tier.id === 'enlightened') return 100;
    const range = tier.maxXp - tier.minXp + 1;
    const earned = numScore - tier.minXp;
    return Math.max(0, Math.min(100, Math.round((earned / range) * 100)));
};

/**
 * Returns XP needed for the next tier.
 */
export const getXpToNextTier = (score = 0) => {
    const numScore = Number(score) || 0;
    const tier = getTier(numScore);
    if (tier.id === 'enlightened') return null;
    return tier.maxXp + 1 - numScore;
};

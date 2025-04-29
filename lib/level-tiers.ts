// Platform level definitions with 100 levels
export const platformLevels = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1

  // Generate level titles based on tier
  let title = ""
  if (level <= 9) {
    title = `Bronze ${level}`
  } else if (level <= 19) {
    title = `Silver ${level}`
  } else if (level <= 29) {
    title = `Gold ${level}`
  } else if (level <= 39) {
    title = `Platinum ${level}`
  } else if (level <= 49) {
    title = `Diamond ${level}`
  } else if (level <= 69) {
    title = `Elite ${level}`
  } else if (level <= 89) {
    title = `Legendary ${level}`
  } else {
    title = `Grandmaster ${level}`
  }

  // Progressive XP system - XP requirements increase with each tier
  let xpRequired = 0

  // Base XP requirement for each tier with higher values
  if (level <= 9) {
    // Bronze - 1,000 XP per level
    xpRequired = level * 1000
  } else if (level <= 19) {
    // Silver - 2,000 XP per level
    xpRequired = 9000 + (level - 9) * 2000
  } else if (level <= 29) {
    // Gold - 3,000 XP per level
    xpRequired = 29000 + (level - 19) * 3000
  } else if (level <= 39) {
    // Platinum - 4,000 XP per level
    xpRequired = 59000 + (level - 29) * 4000
  } else if (level <= 49) {
    // Diamond - 5,000 XP per level
    xpRequired = 99000 + (level - 39) * 5000
  } else if (level <= 69) {
    // Elite - 6,000 XP per level
    xpRequired = 149000 + (level - 49) * 6000
  } else if (level <= 89) {
    // Legendary - 8,000 XP per level
    xpRequired = 269000 + (level - 69) * 8000
  } else {
    // Grandmaster - 10,000 XP per level
    xpRequired = 429000 + (level - 89) * 10000
  }

  return { level, title, xpRequired }
})

// Tier definitions with colors and icons
export const tiers = {
  bronze: {
    color: "amber-700",
    textColor: "text-amber-700",
    icon: "🟤",
    name: "Bronze Tier",
    description: "Just getting started. Building the basics.",
  },
  silver: {
    color: "slate-400",
    textColor: "text-slate-400",
    icon: "⚙️",
    name: "Silver Tier",
    description: "Gaining confidence. Writing functional code.",
  },
  gold: {
    color: "yellow-500",
    textColor: "text-yellow-500",
    icon: "🔥",
    name: "Gold Tier",
    description: "Comfortable in solving problems. Starting to shine.",
  },
  platinum: {
    color: "cyan-400",
    textColor: "text-cyan-400",
    icon: "💠",
    name: "Platinum Tier",
    description: "Advanced learner. Code is clean and efficient.",
  },
  diamond: {
    color: "violet-500",
    textColor: "text-violet-500",
    icon: "💎",
    name: "Diamond Tier",
    description: "Elite problem solver. Consistent streaks.",
  },
  elite: {
    color: "indigo-600",
    textColor: "text-indigo-600",
    icon: "🧠",
    name: "Elite Tier",
    description: "Skilled and strategic. One of the best.",
  },
  legendary: {
    color: "red-600",
    textColor: "text-red-600",
    icon: "🐉",
    name: "Legendary Tier",
    description: "Feared on the leaderboard. Top 5%.",
  },
  grandmaster: {
    color: "amber-400",
    textColor: "text-amber-400",
    icon: "👑",
    name: "Grandmaster Tier",
    description: "The absolute best. Nexa royalty.",
  },
}

// Map levels to tiers
export const levelToTier = (level: number): keyof typeof tiers => {
  if (level <= 9) return "bronze"
  if (level <= 19) return "silver"
  if (level <= 29) return "gold"
  if (level <= 39) return "platinum"
  if (level <= 49) return "diamond"
  if (level <= 69) return "elite"
  if (level <= 89) return "legendary"
  return "grandmaster"
}

// Get level info by level number
export const getLevelInfo = (level: number) => {
  const levelInfo = platformLevels.find((l) => l.level === level) || {
    level,
    title: `Level ${level}`,
    xpRequired: calculateXpForLevel(level),
  }

  const nextLevelInfo = platformLevels.find((l) => l.level === level + 1) || {
    level: level + 1,
    title: `Level ${level + 1}`,
    xpRequired: calculateXpForLevel(level + 1),
  }

  const tier = levelToTier(level)

  return {
    ...levelInfo,
    tier,
    tierInfo: tiers[tier],
    nextLevel: nextLevelInfo,
  }
}

// Helper function to calculate XP for a level if not found in platformLevels
function calculateXpForLevel(level: number): number {
  // Fallback calculation if level is not in platformLevels
  if (level <= 9) {
    // Bronze - 1,000 XP per level
    return level * 1000
  } else if (level <= 19) {
    // Silver - 2,000 XP per level
    return 9000 + (level - 9) * 2000
  } else if (level <= 29) {
    // Gold - 3,000 XP per level
    return 29000 + (level - 19) * 3000
  } else if (level <= 39) {
    // Platinum - 4,000 XP per level
    return 59000 + (level - 29) * 4000
  } else if (level <= 49) {
    // Diamond - 5,000 XP per level
    return 99000 + (level - 39) * 5000
  } else if (level <= 69) {
    // Elite - 6,000 XP per level
    return 149000 + (level - 49) * 6000
  } else if (level <= 89) {
    // Legendary - 8,000 XP per level
    return 269000 + (level - 69) * 8000
  } else {
    // Grandmaster - 10,000 XP per level
    return 429000 + (level - 89) * 10000
  }
}

// Calculate XP needed for next level
export const getXpToNextLevel = (currentXp: number) => {
  // Find the current level based on XP
  const currentLevel = platformLevels.find(
    (l, index) =>
      l.xpRequired <= currentXp &&
      (index === platformLevels.length - 1 || platformLevels[index + 1].xpRequired > currentXp),
  )

  if (!currentLevel) return { currentLevel: 1, nextLevel: 2, xpNeeded: 1000 - currentXp }

  // If at max level, return 0 XP needed
  if (currentLevel.level === 100) {
    return {
      currentLevel: 100,
      nextLevel: 100,
      xpNeeded: 0,
    }
  }

  const nextLevel = platformLevels.find((l) => l.level === currentLevel.level + 1)

  if (!nextLevel) {
    return {
      currentLevel: currentLevel.level,
      nextLevel: currentLevel.level + 1,
      xpNeeded: 0,
    }
  }

  return {
    currentLevel: currentLevel.level,
    nextLevel: nextLevel.level,
    xpNeeded: nextLevel.xpRequired - currentXp,
  }
}

// Get tier description
export const getTierDescription = (level: number): string => {
  const tier = levelToTier(level)
  return tiers[tier].description
}

// Get tier progress (how far through the current tier)
export const getTierProgress = (level: number): number => {
  const tier = levelToTier(level)
  let tierStart = 1
  let tierEnd = 9

  switch (tier) {
    case "bronze":
      tierStart = 1
      tierEnd = 9
      break
    case "silver":
      tierStart = 10
      tierEnd = 19
      break
    case "gold":
      tierStart = 20
      tierEnd = 29
      break
    case "platinum":
      tierStart = 30
      tierEnd = 39
      break
    case "diamond":
      tierStart = 40
      tierEnd = 49
      break
    case "elite":
      tierStart = 50
      tierEnd = 69
      break
    case "legendary":
      tierStart = 70
      tierEnd = 89
      break
    case "grandmaster":
      tierStart = 90
      tierEnd = 100
      break
  }

  const tierRange = tierEnd - tierStart + 1
  const progress = ((level - tierStart) / tierRange) * 100

  return Math.min(100, Math.max(0, progress))
}

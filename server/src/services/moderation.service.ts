export interface ModerationResult {
  riskScore: number;
  status: 'safe' | 'warning' | 'review' | 'blocked';
  reasons: string[];
}

const BANNED_WORDS = [
  'spam', 'scam', 'fake', 'hack', 'buy followers', 'cheap views', 'free money',
  'click here', 'click link', 'crypto investment', '100% free'
];

const WARNING_WORDS = [
  'hate', 'idiot', 'stupid', 'loser'
];

export const moderateContent = async (content: string): Promise<ModerationResult> => {
  const lowercaseContent = content.toLowerCase();
  
  const blockedReasons: string[] = [];
  for (const word of BANNED_WORDS) {
    if (lowercaseContent.includes(word)) {
      blockedReasons.push(`Contains banned word: ${word}`);
    }
  }

  if (blockedReasons.length > 0) {
    return {
      riskScore: 100,
      status: 'blocked',
      reasons: blockedReasons
    };
  }

  const warningReasons: string[] = [];
  for (const word of WARNING_WORDS) {
    if (lowercaseContent.includes(word)) {
      warningReasons.push(`Contains warning word: ${word}`);
    }
  }

  if (warningReasons.length > 0) {
    return {
      riskScore: 50,
      status: 'warning',
      reasons: warningReasons
    };
  }

  return {
    riskScore: 0,
    status: 'safe',
    reasons: []
  };
};

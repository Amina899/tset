import { Post } from '../types';

// Keywords that indicate different risk levels
const HIGH_RISK_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'goodbye letter',
  'no reason to live', 'better off dead', 'want to die',
  'can\'t take it anymore', 'nobody would miss me'
];

const MEDIUM_RISK_KEYWORDS = [
  'hopeless', 'worthless', 'empty', 'alone', 'dark thoughts',
  'giving up', 'tired of life', 'what\'s the point',
  'no future', 'can\'t cope'
];

const LOW_RISK_KEYWORDS = [
  'sad', 'depressed', 'anxious', 'stressed',
  'overwhelmed', 'struggling', 'difficult time'
];

// Sentiment impact on risk score
const SENTIMENT_WEIGHTS = {
  negative: 1.5,  // Increases risk
  neutral: 1.0,   // No impact
  positive: 0.7   // Reduces risk
};

// Time patterns that might indicate increased risk
const RISK_TIME_PATTERNS = {
  lateNight: { hours: [23, 0, 1, 2, 3, 4], weight: 1.2 },
  earlyMorning: { hours: [5, 6], weight: 1.1 }
};

export interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: string[];
  keywords: string[];
}

export function calculateRisk(content: string, timestamp: string): RiskAssessment {
  let baseScore = 0;
  const factors: string[] = [];
  const detectedKeywords: string[] = [];

  // Convert content to lowercase for comparison
  const normalizedContent = content.toLowerCase();

  // Check for high-risk keywords (highest impact)
  HIGH_RISK_KEYWORDS.forEach(keyword => {
    if (normalizedContent.includes(keyword.toLowerCase())) {
      baseScore += 35;
      detectedKeywords.push(keyword);
      factors.push(`High-risk phrase detected: "${keyword}"`);
    }
  });

  // Check for medium-risk keywords
  MEDIUM_RISK_KEYWORDS.forEach(keyword => {
    if (normalizedContent.includes(keyword.toLowerCase())) {
      baseScore += 20;
      detectedKeywords.push(keyword);
      factors.push(`Medium-risk phrase detected: "${keyword}"`);
    }
  });

  // Check for low-risk keywords
  LOW_RISK_KEYWORDS.forEach(keyword => {
    if (normalizedContent.includes(keyword.toLowerCase())) {
      baseScore += 10;
      detectedKeywords.push(keyword);
      factors.push(`Low-risk phrase detected: "${keyword}"`);
    }
  });

  // Analyze message length (very short or very long messages might indicate higher risk)
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 5) {
    baseScore += 10;
    factors.push('Very short message');
  } else if (wordCount > 200) {
    baseScore += 15;
    factors.push('Unusually long message');
  }

  // Check time patterns
  const postTime = new Date(timestamp);
  const hour = postTime.getHours();
  
  if (RISK_TIME_PATTERNS.lateNight.hours.includes(hour)) {
    baseScore *= RISK_TIME_PATTERNS.lateNight.weight;
    factors.push('Posted during late night hours');
  } else if (RISK_TIME_PATTERNS.earlyMorning.hours.includes(hour)) {
    baseScore *= RISK_TIME_PATTERNS.earlyMorning.weight;
    factors.push('Posted during early morning hours');
  }

  // Normalize score to 0-100 range
  let finalScore = Math.min(Math.round(baseScore), 100);

  // Determine risk level based on final score
  let riskLevel: 'low' | 'medium' | 'high';
  if (finalScore >= 75) {
    riskLevel = 'high';
  } else if (finalScore >= 40) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  return {
    score: finalScore,
    level: riskLevel,
    factors,
    keywords: detectedKeywords
  };
}

// Function to analyze sentiment
export function analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
  const normalizedContent = content.toLowerCase();
  
  // Simple sentiment analysis based on keyword presence
  const positiveWords = ['happy', 'good', 'better', 'hope', 'grateful', 'thankful', 'blessed'];
  const negativeWords = ['sad', 'bad', 'worse', 'hopeless', 'worthless', 'hate', 'never'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (normalizedContent.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (normalizedContent.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

// Function to assess a post's complete risk profile
export function assessPost(post: Post): Post {
  const riskAssessment = calculateRisk(post.content, post.timestamp);
  const sentiment = analyzeSentiment(post.content);
  
  return {
    ...post,
    riskScore: riskAssessment.score,
    riskLevel: riskAssessment.level,
    keywords: riskAssessment.keywords,
    sentiment
  };
}
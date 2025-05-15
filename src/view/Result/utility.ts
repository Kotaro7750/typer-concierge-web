import { TypingResultStatistics } from '@/@types/type';

export function keyStrokeForDisplay(key: string): string {
  return key == ' ' ? '⬚' : key
}

export function calculateAccuracy(summary: TypingResultStatistics, isStrokeCountIdeal: boolean): number {
  const effectiveKeyStroke = isStrokeCountIdeal ? summary.idealKeyStroke : summary.keyStroke;

  const strokeCount = effectiveKeyStroke.wholeCount;
  const accuracy = strokeCount == 0 ? 0 : effectiveKeyStroke.completelyCorrectCount * 1.0 / strokeCount * 100;

  return Math.floor(accuracy);
}

export function calculateWPM(summary: TypingResultStatistics, isStrokeCountIdeal: boolean): number {
  const effectiveKeyStroke = isStrokeCountIdeal ? summary.idealKeyStroke : summary.keyStroke;

  const strokeCount = effectiveKeyStroke.wholeCount;
  // WPMは切り捨て
  return summary.totalTimeMs == 0 ? 0 : Math.floor(strokeCount * 60000 / summary.totalTimeMs);
}

export function calculateWPS(summary: TypingResultStatistics, isStrokeCountIdeal: boolean): number {
  const effectiveKeyStroke = isStrokeCountIdeal ? summary.idealKeyStroke : summary.keyStroke;

  const strokeCount = effectiveKeyStroke.wholeCount;
  return summary.totalTimeMs == 0 ? 0 : (strokeCount * 1000 / summary.totalTimeMs);
}

export function calculateETypingScore(summary: TypingResultStatistics, isStrokeCountIdeal: boolean): number {
  const wpm = calculateWPM(summary, isStrokeCountIdeal);
  const accuracy = calculateAccuracy(summary, isStrokeCountIdeal);

  // WPM x ( 正確率 )^3 の小数点以下切り捨て
  // 実際のeタイピングはstrokeCountとしてidealじゃなくて実際の打ったローマ字数を使っている
  return Math.floor(wpm * (accuracy / 100) ** 3);
}

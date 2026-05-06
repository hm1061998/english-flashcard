/**
 * Spaced Repetition System (SRS) Algorithm
 * Based on SuperMemo-2 (SM-2)
 */

export enum SRSGrade {
  AGAIN = 0, // Total lapse
  HARD = 1,  // Incorrect; the correct answer remembered
  GOOD = 3,  // Correct; remembered with serious difficulty
  EASY = 5   // Correct; remembered with perfect ease
}

export interface SRSData {
  level: number;
  interval: number;
  easiness: number;
  nextReview: number;
}

/**
 * Calculates next review data based on performance
 * @param grade Quality of recall (0-5)
 * @param currentSRS Current SRS data
 * @returns Updated SRS data
 */
export function calculateSRS(grade: number, currentSRS: SRSData): SRSData {
  let { level, interval, easiness } = currentSRS;

  // SM-2 Algorithm logic
  if (grade >= 3) { // Correct
    if (level === 0) {
      interval = 1;
    } else if (level === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
    level += 1;
  } else { // Incorrect
    level = 0;
    interval = 1;
  }

  // Update easiness factor
  // EF':=EF+(0.1-(5-q)*(0.08+(5-q)*0.02))
  easiness = easiness + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easiness < 1.3) easiness = 1.3;

  // Calculate next review timestamp (interval is in days)
  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;

  return {
    level,
    interval,
    easiness,
    nextReview,
  };
}

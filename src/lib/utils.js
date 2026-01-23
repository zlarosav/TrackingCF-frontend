import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Returns Tailwind CSS classes for username color based on Codeforces rating
 * @param {number} rating - User's Codeforces rating
 * @returns {string} Tailwind CSS classes for text color and weight
 */
// ... existing code ...
export function getRatingColorClass(rating) {
  if (!rating) return 'font-semibold text-gray-500'
  if (rating >= 2900) return 'font-bold text-red-600'
  if (rating >= 2600) return 'font-bold text-red-500'
  if (rating >= 2400) return 'font-bold text-red-400'
  if (rating >= 2300) return 'font-semibold text-orange-500'
  if (rating >= 2200) return 'font-semibold text-orange-400'
  if (rating >= 1900) return 'font-semibold text-violet-500'
  if (rating >= 1600) return 'font-semibold text-blue-500'
  if (rating >= 1400) return 'font-semibold text-cyan-500'
  if (rating >= 1200) return 'font-semibold text-green-500'
  return 'font-semibold text-gray-500'
}

/**
 * Returns Tailwind CSS classes for problem card border and background based on rating
 * @param {number} rating - Problem's Codeforces rating
 * @returns {string} Tailwind CSS classes
 */
/**
 * Returns Tailwind CSS classes for problem card border and background based on rating
 * @param {number} rating - Problem's Codeforces rating
 * @returns {string} Tailwind CSS classes
 */
/**
 * Returns Tailwind CSS classes for problem card border and background based on rating
 * @param {number} rating - Problem's Codeforces rating
 * @returns {string} Tailwind CSS classes
 */
export function getProblemRatingColor(rating) {
  if (!rating) return '!bg-slate-100 dark:!bg-slate-800 border-slate-300 dark:border-slate-600'
  
  const r = Number(rating);
  
  // Legendary Grandmaster (3000+) - Red
  if (r >= 3000) return '!bg-red-100 dark:!bg-red-900/30 border-red-600 dark:border-red-500'
  // International Grandmaster (2600-2999) - Red
  if (r >= 2600) return '!bg-red-100 dark:!bg-red-900/30 border-red-600 dark:border-red-500'
  // Grandmaster (2400-2599) - Red
  if (r >= 2400) return '!bg-red-100 dark:!bg-red-900/30 border-red-500 dark:border-red-500'
  // International Master (2300-2399) - Orange
  if (r >= 2300) return '!bg-orange-100 dark:!bg-orange-900/30 border-orange-500 dark:border-orange-500'
  // Master (2100-2299) - Orange
  if (r >= 2100) return '!bg-orange-100 dark:!bg-orange-900/30 border-orange-500 dark:border-orange-500'
  // Candidate Master (1900-2099) - Violet
  if (r >= 1900) return '!bg-violet-100 dark:!bg-violet-900/30 border-violet-500 dark:border-violet-500'
  // Expert (1600-1899) - Blue
  if (r >= 1600) return '!bg-blue-100 dark:!bg-blue-900/30 border-blue-500 dark:border-blue-500'
  // Specialist (1400-1599) - Cyan
  if (r >= 1400) return '!bg-cyan-100 dark:!bg-cyan-900/30 border-cyan-500 dark:border-cyan-500'
  // Pupil (1200-1399) - Green
  if (r >= 1200) return '!bg-green-100 dark:!bg-green-900/30 border-green-500 dark:border-green-500'
  // Newbie (Gray)
  return '!bg-gray-100 dark:!bg-gray-800 border-gray-400 dark:border-gray-500'
}

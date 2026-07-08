import { clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Our custom font-size scale (text-body-sm, text-title-lg, ...) and our custom
// color scale (text-on-primary, text-on-surface, ...) both live under the `text-`
// prefix. Plain tailwind-merge doesn't know either scale, so it can't tell them
// apart and silently drops one when both are combined on one element (e.g.
// "text-on-primary text-body-sm" collapsed to only the size, leaving text with no
// explicit color — invisible whenever the inherited body color happens to clash).
// Registering both scales explicitly fixes that class of bug everywhere in the app.
const CUSTOM_FONT_SIZES = [
  'hero-display', 'display-lg', 'display-md', 'display-sm',
  'title-lg', 'title-md', 'title-sm',
  'number-display', 'number-md', 'number-sm',
  'body-md', 'body-sm', 'caption', 'btn', 'nav-link',
]

const CUSTOM_COLORS = [
  'primary', 'primary-active', 'primary-disabled', 'ink', 'body', 'body-on-light',
  'muted', 'muted-strong', 'muted-foreground', 'hairline-on-light', 'hairline-on-dark',
  'border-strong', 'canvas-light', 'canvas-dark', 'surface-card-dark', 'surface-elevated-dark',
  'surface-soft-light', 'surface-strong-light', 'on-primary', 'on-dark', 'on-surface',
  'trading-up', 'trading-down', 'accent-turquoise', 'info',
  'canvas', 'surface-card', 'surface-elevated', 'hairline',
  'background', 'foreground', 'primary-foreground',
  'card', 'card-foreground', 'popover', 'popover-foreground',
  'secondary', 'secondary-foreground', 'accent', 'accent-foreground',
  'destructive', 'destructive-foreground', 'border', 'input', 'ring',
]

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: CUSTOM_FONT_SIZES }],
      'text-color': [{ text: CUSTOM_COLORS }],
      'bg-color': [{ bg: CUSTOM_COLORS }],
      'border-color': [{ border: CUSTOM_COLORS }],
      'ring-color': [{ ring: CUSTOM_COLORS }],
      'ring-offset-color': [{ 'ring-offset': CUSTOM_COLORS }],
    },
  },
})

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

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

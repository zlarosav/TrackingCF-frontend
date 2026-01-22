import { Badge } from "@/components/ui/badge"

export default function StreakBadge({ streak, isActive }) {
  if (!streak || streak === 0) return null
  
  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1.5 px-2 py-0.5 ${
        isActive 
          ? 'bg-orange-50 border-orange-300 text-orange-600 dark:bg-orange-950 dark:border-orange-700 dark:text-orange-400' 
          : 'bg-gray-50 border-gray-300 text-gray-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-500'
      }`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-gray-400'}`}
      >
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
      </svg>
      <span className="font-semibold text-sm">{streak}</span>
    </Badge>
  )
}

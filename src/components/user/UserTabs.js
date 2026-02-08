'use client'

import { useState } from 'react'
import GeneralTab from './tabs/GeneralTab'
import SubmissionsTable from './tabs/SubmissionsTable'
import MetricsTab from './tabs/MetricsTab'
import ChatTab from './tabs/ChatTab'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, List, BarChart2, MessageSquare } from 'lucide-react'

export default function UserTabs({ user, submissions, stats, handle }) {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General', icon: LayoutDashboard },
    { id: 'submissions', label: 'Envíos', icon: List },
    { id: 'metrics', label: 'Métricas', icon: BarChart2 },
    { id: 'chat', label: 'Chat AI', icon: MessageSquare },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Tab Navigation */}
      <div className="flex p-1 bg-muted/50 rounded-lg w-full md:w-fit overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${isActive 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-md shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'general' && (
              <GeneralTab user={user} stats={stats} submissions={submissions} />
            )}
            {activeTab === 'submissions' && (
              <SubmissionsTable submissions={submissions} />
            )}
            {activeTab === 'metrics' && (
              <MetricsTab stats={stats} />
            )}
            {activeTab === 'chat' && (
              <ChatTab handle={handle} userAvatar={user?.avatar_url} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import GeneralTab from './tabs/GeneralTab'
import SubmissionsTable from './tabs/SubmissionsTable'
import MetricsTab from './tabs/MetricsTab'
import ChatTab from './tabs/ChatTab'
import ContestsTab from './tabs/ContestsTab'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, List, BarChart2, MessageSquare, Trophy } from 'lucide-react'

export default function UserTabs({ user, submissions, stats, handle }) {
  const [activeTab, setActiveTab] = useState('general')
  const tabs = [
    { id: 'general', label: 'General', icon: LayoutDashboard },
    { id: 'submissions', label: 'Envíos', icon: List },
    { id: 'metrics', label: 'Métricas', icon: BarChart2 },
    { id: 'contests', label: 'Contests', icon: Trophy },
    { id: 'chat', label: 'Chat AI', icon: MessageSquare },
  ]
  return (
    <div className="w-full space-y-5">
      <div className="flex rounded-xl bg-surface-card-dark border border-hairline-on-dark/60 p-0.5 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-1.5 px-4 py-2 text-body-md font-medium rounded-lg transition-all whitespace-nowrap ${active ? 'text-on-primary' : 'text-muted hover:text-on-dark'}`}>
              {active && <motion.div layoutId="activeTabProfile" className="absolute inset-0 bg-primary rounded-lg" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
              <span className="relative z-10 flex items-center gap-1.5"><Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span></span>
            </button>
          )
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {activeTab === 'general' && <GeneralTab user={user} stats={stats} submissions={submissions} handle={handle} />}
          {activeTab === 'submissions' && <SubmissionsTable submissions={submissions} />}
          {activeTab === 'metrics' && <MetricsTab stats={stats} handle={handle} />}
          {activeTab === 'contests' && <ContestsTab handle={handle} />}
          {activeTab === 'chat' && <ChatTab handle={handle} userAvatar={user?.avatar_url} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

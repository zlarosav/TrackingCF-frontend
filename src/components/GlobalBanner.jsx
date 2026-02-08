'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function GlobalBanner() {
  const [banner, setBanner] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await axios.get(`${getApiUrl()}/notifications`);
      
      const serverBanner = res.data.data.banner;
      
      if (serverBanner) {
        // Check if previously closed
        const closedInfo = localStorage.getItem('closed_global_banner');
        if (closedInfo) {
          const { expiresAt } = JSON.parse(closedInfo);
          // Compare unique expiration timestamp. 
          // New banners will always have a different expiration time.
          if (expiresAt === serverBanner.expiresAt) {
            return;
          }
        }
        setBanner(serverBanner);
        setIsVisible(true);
      }
    } catch (err) {
      // invalid banner or error
    }
  };

  const closeBanner = () => {
    setIsVisible(false);
    if (banner) {
      localStorage.setItem('closed_global_banner', JSON.stringify({
        expiresAt: banner.expiresAt, // Use unique timestamp as ID
        closedAt: Date.now()
      }));
    }
  };

  if (!isVisible || !banner) return null;

  const styles = {
    info: 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-600/20 dark:border-blue-600/30 dark:text-blue-200',
    warning: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-600/20 dark:border-amber-600/30 dark:text-amber-200',
    error: 'bg-red-50 border-red-100 text-red-700 dark:bg-red-600/20 dark:border-red-600/30 dark:text-red-200'
  };

  const icon = {
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
  };

  return (
    <div className={`w-full border-b transition-all ${styles[banner.type] || styles.info}`}>
      <div className="container mx-auto px-4 py-2 sm:py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon[banner.type] || icon.info}
          <span className="font-medium text-sm sm:text-base leading-tight">
            {banner.message}
          </span>
        </div>
        <button 
          onClick={closeBanner}
          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 sm:w-5 h-5 opacity-70 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}

// localStorage keys
const STORAGE_KEYS = {
  SCHEDULED_POSTS: 'socialScheduler_scheduledPosts',
  DRAFTS: 'socialScheduler_drafts',
  SENT_POSTS: 'socialScheduler_sentPosts',
  SCHEDULE: 'socialScheduler_schedule',
  COUNTERS: 'socialScheduler_counters'
}

export const useLocalStorage = () => {
  // Save data to localStorage
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      // Silent error handling
    }
  }

  // Load data from localStorage
  const loadFromStorage = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      return defaultValue
    }
  }

  // Save scheduled posts
  const saveScheduledPosts = (schedule) => {
    saveToStorage(STORAGE_KEYS.SCHEDULE, schedule)
  }

  // Load scheduled posts
  const loadScheduledPosts = () => {
    const data = loadFromStorage(STORAGE_KEYS.SCHEDULE, getDefaultSchedule())
    return data
  }

  // Save drafts
  const saveDrafts = (drafts) => {
    saveToStorage(STORAGE_KEYS.DRAFTS, drafts)
  }

  // Load drafts
  const loadDrafts = () => {
    return loadFromStorage(STORAGE_KEYS.DRAFTS, [])
  }

  // Save sent posts
  const saveSentPosts = (sentPosts) => {
    saveToStorage(STORAGE_KEYS.SENT_POSTS, sentPosts)
  }

  // Load sent posts
  const loadSentPosts = () => {
    return loadFromStorage(STORAGE_KEYS.SENT_POSTS, [])
  }

  // Save counters
  const saveCounters = (counters) => {
    saveToStorage(STORAGE_KEYS.COUNTERS, counters)
  }

  // Load counters
  const loadCounters = () => {
    return loadFromStorage(STORAGE_KEYS.COUNTERS, {
      queue: 0,
      drafts: 0,
      sent: 0
    })
  }

  // Get default schedule structure
  const getDefaultSchedule = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(today.getDate() + 2)
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0]
    }
    
    const formatTitle = (date) => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      if (date.toDateString() === today.toDateString()) {
        return `Today, ${months[date.getMonth()]} ${date.getDate()}`
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${months[date.getMonth()]} ${date.getDate()}`
      } else {
        return `${dayNames[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
      }
    }
    
    return [
      {
        id: 'today',
        title: formatTitle(today),
        date: formatDate(today),
        timeSlots: [
          { 
            id: 1, 
            time: '1:27 PM', 
            post: {
              id: 'demo-post-1',
              content: 'Check out this amazing view! 🌅 Perfect way to start the morning.',
              files: [
                {
                  name: 'morning-view.jpg',
                  type: 'image/jpeg',
                  preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'
                }
              ],
              date: formatDate(today),
              time: '1:27 PM',
              createdAt: new Date(),
              status: 'scheduled',
              profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            }
          },
          { id: 2, time: '3:14 PM', post: null }
        ]
      },
      {
        id: 'tomorrow',
        title: formatTitle(tomorrow), 
        date: formatDate(tomorrow),
        timeSlots: [
          { id: 3, time: '11:13 AM', post: null },
          { id: 4, time: '12:20 PM', post: null }
        ]
      },
      {
        id: 'dayAfterTomorrow',
        title: formatTitle(dayAfterTomorrow),
        date: formatDate(dayAfterTomorrow), 
        timeSlots: [
          { id: 5, time: '8:26 AM', post: null }
        ]
      }
    ]
  }

  // Clear all data
  const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  return {
    saveScheduledPosts,
    loadScheduledPosts,
    saveDrafts,
    loadDrafts,
    saveSentPosts,
    loadSentPosts,
    saveCounters,
    loadCounters,
    clearAllData,
    getDefaultSchedule
  }
} 





 
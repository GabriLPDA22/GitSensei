import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    progress: {
      currentModule: 0,
      completedModules: [],
      totalScore: 0,
      badges: []
    },
    preferences: {
      theme: 'dark',
      language: 'es'
    }
  }),

  getters: {
    completionPercentage: (state) => {
      const totalModules = 6 // Módulos 0-5
      return Math.round((state.progress.completedModules.length / totalModules) * 100)
    }
  },

  actions: {
    updateProgress(moduleId, score) {
      if (!this.progress.completedModules.includes(moduleId)) {
        this.progress.completedModules.push(moduleId)
        this.progress.totalScore += score
      }
    },

    earnBadge(badgeId) {
      if (!this.progress.badges.includes(badgeId)) {
        this.progress.badges.push(badgeId)
      }
    }
  }
})

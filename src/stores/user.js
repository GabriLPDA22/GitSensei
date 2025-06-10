// src/stores/user.js - SOLO DATOS REALES

import { defineStore } from "pinia";
import { computed } from "vue";
import { useAuthStore } from "./auth";

export const useUserStore = defineStore("user", () => {
  const authStore = useAuthStore();

  // 📊 COMPUTED BASADOS EN DATOS REALES DE SUPABASE
  const progress = computed(() => {
    if (!authStore.userProgress) {
      return {
        currentModule: 0,
        completedModules: [],
        totalScore: 0,
        badges: [],
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const { user, modules, achievements } = authStore.userProgress;

    return {
      currentModule:
        modules?.find((m) => !m.is_completed)?.module_id || "module-0",
      completedModules:
        modules?.filter((m) => m.is_completed).map((m) => m.module_id) || [],
      totalScore: user?.total_points || 0,
      badges: achievements || [],
      currentStreak: user?.current_streak || 0,
      longestStreak: user?.longest_streak || 0,
      currentLevel: user?.current_level || 1,
    };
  });

  const completionPercentage = computed(() => {
    const totalModules = 6; // Módulos 0-5
    return Math.round(
      (progress.value.completedModules.length / totalModules) * 100
    );
  });

  const userLevel = computed(() => {
    return progress.value.currentLevel || 1;
  });

  const pointsToNextLevel = computed(() => {
    const currentLevel = userLevel.value;
    const nextLevelPoints = currentLevel * 250;
    return nextLevelPoints - progress.value.totalScore;
  });

  const levelProgressPercentage = computed(() => {
    const currentLevel = userLevel.value;
    const currentLevelPoints = (currentLevel - 1) * 250;
    const pointsInLevel = progress.value.totalScore - currentLevelPoints;
    return Math.max(0, Math.min(100, (pointsInLevel / 250) * 100));
  });

  // 📈 ESTADÍSTICAS DE MÓDULOS
  const modulesStats = computed(() => {
    if (!authStore.userProgress?.modules) return [];

    const moduleDefinitions = [
      {
        id: "module-0",
        title: "Fundamentos",
        color: "#58a6ff",
        icon: "FileText",
      },
      {
        id: "module-1",
        title: "Tu Primer Repositorio",
        color: "#39d353",
        icon: "Database",
      },
      {
        id: "module-2",
        title: "El Arte de Ramificar",
        color: "#a5a5ff",
        icon: "GitBranch",
      },
      {
        id: "module-3",
        title: "Colaboración y Remotos",
        color: "#d29922",
        icon: "Share2",
      },
      { id: "module-4", title: "La Forja", color: "#79c0ff", icon: "Zap" },
      {
        id: "module-5",
        title: "Biblioteca de Comandos",
        color: "#56d364",
        icon: "Book",
      },
    ];

    return moduleDefinitions.map((def) => {
      const moduleProgress = authStore.userProgress.modules.find(
        (m) => m.module_id === def.id
      );
      return {
        ...def,
        progress: moduleProgress?.progress_percentage || 0,
        isCompleted: moduleProgress?.is_completed || false,
        isStarted: moduleProgress?.is_started || false,
        completedLessons: moduleProgress?.completed_lessons || 0,
        totalLessons: moduleProgress?.total_lessons || 0,
        lastAccessed: moduleProgress?.last_accessed_at,
        pointsEarned: moduleProgress?.points_earned || 0,
      };
    });
  });

  // 🏆 LOGROS FORMATEADOS
  const recentAchievements = computed(() => {
    if (!authStore.userProgress?.achievements) return [];

    return authStore.userProgress.achievements
      .slice(0, 5)
      .map((achievement) => ({
        id: achievement.id,
        name: achievement.achievement_name,
        description: achievement.achievement_description,
        emoji: achievement.achievement_emoji,
        earnedAt: achievement.earned_at,
        points: achievement.points_awarded,
      }));
  });

  // 📱 ACTIVIDAD RECIENTE
  const recentActivity = computed(() => {
    if (!authStore.userProgress?.recentActivity) return [];

    return authStore.userProgress.recentActivity.map((activity) => ({
      id: activity.id,
      type: activity.activity_type,
      title: activity.activity_title,
      description: activity.activity_description,
      points: activity.points_earned,
      createdAt: activity.created_at,
      moduleId: activity.module_id,
      lessonId: activity.lesson_id,
    }));
  });

  return {
    // Computed properties
    progress,
    completionPercentage,
    userLevel,
    pointsToNextLevel,
    levelProgressPercentage,
    modulesStats,
    recentAchievements,
    recentActivity,
  };
});

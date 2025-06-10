<template>
  <div class="profile">
    <div class="container">
      <!-- Loading state -->
      <div v-if="githubStats.loading" class="loading-profile">
        <div class="spinner"></div>
        <p>Cargando tus datos reales de GitHub...</p>
      </div>

      <!-- Header del perfil CON DATOS REALES -->
      <div v-else class="profile-header">
        <div class="profile-header__avatar">
          <div class="avatar">
            <!-- ✅ AVATAR REAL DE GITHUB -->
            <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="avatar-image" />
            <User v-else class="w-12 h-12" />
          </div>
        </div>

        <div class="profile-header__info">
          <!-- ✅ NOMBRE REAL DE GITHUB -->
          <h1 class="profile-header__name">{{ userName }}</h1>
          <p class="profile-header__email">
            @{{ user?.github_username || user?.login }}
            <span v-if="user?.github_location"> • {{ user.github_location }}</span>
          </p>
          <p v-if="user?.github_bio" class="profile-header__bio">{{ user.github_bio }}</p>

          <div class="profile-header__badges">
            <div class="level-badge">
              <Star class="w-4 h-4" />
              Nivel {{ userLevel }}
            </div>
            <div class="streak-badge">
              <Flame class="w-4 h-4" />
              {{ progress.currentStreak }} días
            </div>
            <div class="github-badge">
              <GitBranch class="w-4 h-4" />
              {{ githubStats.yearsOnGitHub }}+ años en GitHub
            </div>
          </div>
        </div>

        <!-- ✅ STATS REALES DE GITHUB -->
        <div class="profile-header__stats">
          <div class="stat-item">
            <span class="stat-item__number">{{ githubStats.publicRepos }}</span>
            <span class="stat-item__label">Repositorios</span>
          </div>
          <div class="stat-item">
            <span class="stat-item__number">{{ githubStats.followers }}</span>
            <span class="stat-item__label">Followers</span>
          </div>
          <div class="stat-item">
            <span class="stat-item__number">{{ githubStats.totalStars }}</span>
            <span class="stat-item__label">Estrellas</span>
          </div>
        </div>
      </div>

      <!-- Contenido del perfil -->
      <div class="profile-content">
        <div class="profile-grid">
          <!-- Panel Principal -->
          <div class="profile-main">
            <!-- Progreso de Aprendizaje REAL -->
            <div class="section learning-progress">
              <div class="section-header">
                <h2 class="section-title">
                  <TrendingUp class="w-5 h-5" />
                  Progreso de Aprendizaje
                </h2>
              </div>

              <div class="progress-overview">
                <div class="overall-progress">
                  <div class="progress-circle-large">
                    <svg class="progress-circle-large__svg" viewBox="0 0 100 100">
                      <circle class="progress-circle-large__bg" cx="50" cy="50" r="45" />
                      <circle class="progress-circle-large__fill" cx="50" cy="50" r="45"
                        :stroke-dasharray="`${completionPercentage * 2.83} 283`" />
                    </svg>
                    <div class="progress-circle-large__content">
                      <span class="progress-circle-large__percentage">{{ completionPercentage }}%</span>
                      <span class="progress-circle-large__label">Completado</span>
                    </div>
                  </div>

                  <div class="progress-details">
                    <h3 class="progress-details__title">Progreso General</h3>
                    <p class="progress-details__description">
                      Has completado {{ progress.completedModules.length }} de 6 módulos
                    </p>

                    <div class="level-progress">
                      <div class="level-progress__info">
                        <span class="level-progress__current">Nivel {{ userLevel }}</span>
                        <span class="level-progress__next">{{ pointsToNextLevel }} puntos para Nivel {{ userLevel + 1 }}</span>
                      </div>
                      <div class="level-progress__bar">
                        <div class="level-progress__fill" :style="{ width: `${levelProgressPercentage}%` }"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Módulos individuales REALES -->
                <div class="modules-progress">
                  <h4 class="modules-progress__title">Progreso por Módulo</h4>
                  <div class="modules-list">
                    <div v-for="module in modulesStats" :key="module.id" class="module-progress-item">
                      <div class="module-progress-item__header">
                        <div class="module-progress-item__icon" :style="{ backgroundColor: module.color }">
                          <component :is="module.icon" class="w-5 h-5" />
                        </div>
                        <div class="module-progress-item__info">
                          <h5 class="module-progress-item__title">{{ module.title }}</h5>
                          <span class="module-progress-item__progress">{{ module.progress }}% completado</span>
                        </div>
                        <div class="module-progress-item__status">
                          <CheckCircle2 v-if="module.isCompleted" class="w-5 h-5 text-accent-green" />
                          <Clock v-else-if="module.isStarted" class="w-5 h-5 text-accent-blue" />
                          <div v-else class="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                        </div>
                      </div>
                      <div class="module-progress-item__bar">
                        <div class="module-progress-item__fill" :style="{ width: `${module.progress}%` }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sección de repositorios recientes REALES -->
            <div class="section recent-repos" v-if="githubStats.recentRepos.length > 0">
              <div class="section-header">
                <h2 class="section-title">
                  <GitBranch class="w-5 h-5" />
                  Repositorios Recientes
                </h2>
              </div>
              <div class="repos-grid">
                <div v-for="repo in githubStats.recentRepos" :key="repo.name" class="repo-card">
                  <h3 class="repo-card__name">{{ repo.name }}</h3>
                  <p class="repo-card__description">{{ repo.description || 'Sin descripción' }}</p>
                  <div class="repo-card__meta">
                    <span v-if="repo.language" class="repo-language">{{ repo.language }}</span>
                    <span class="repo-stars">⭐ {{ repo.stars }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actividad Reciente REAL -->
            <div class="section recent-activity" v-if="recentActivity.length > 0">
              <div class="section-header">
                <h2 class="section-title">
                  <Activity class="w-5 h-5" />
                  Actividad Reciente
                </h2>
              </div>
              <div class="activity-timeline">
                <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
                  <div class="activity-item__marker" :class="`activity-item__marker--${activity.type}`">
                    <Award v-if="activity.type === 'achievement_earned'" class="w-4 h-4" />
                    <CheckCircle2 v-else-if="activity.type === 'lesson_completed'" class="w-4 h-4" />
                    <Flame v-else-if="activity.type === 'streak_updated'" class="w-4 h-4" />
                    <Star v-else class="w-4 h-4" />
                  </div>
                  <div class="activity-item__content">
                    <div class="activity-item__main">
                      <h4 class="activity-item__title">{{ activity.title }}</h4>
                      <p v-if="activity.description" class="activity-item__description">{{ activity.description }}</p>
                    </div>
                    <div class="activity-item__meta">
                      <span class="activity-item__time">{{ formatDate(activity.createdAt) }}</span>
                      <span v-if="activity.points > 0" class="activity-item__points">+{{ activity.points }} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sección de lenguajes REALES -->
            <div class="section languages" v-if="githubStats.topLanguages.length > 0">
              <div class="section-header">
                <h2 class="section-title">
                  <FileText class="w-5 h-5" />
                  Tus Lenguajes Principales
                </h2>
              </div>
              <div class="languages-showcase">
                <div v-for="(language, index) in githubStats.topLanguages" :key="language.name"
                     class="language-badge"
                     :class="`language-badge--${index}`">
                  <div class="language-badge__icon">
                    <div class="language-badge__dot" :style="{ backgroundColor: getLanguageColor(language.name) }"></div>
                  </div>
                  <div class="language-badge__info">
                    <span class="language-badge__name">{{ language.name }}</span>
                    <span class="language-badge__count">{{ language.count }} repositorio{{ language.count !== 1 ? 's' : '' }}</span>
                  </div>
                  <div class="language-badge__percentage">
                    {{ getLanguagePercentage(language.count) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="profile-sidebar">
            <!-- GitHub Stats REALES -->
            <div class="section github-stats">
              <div class="section-header">
                <h3 class="section-title">
                  <GitBranch class="w-4 h-4" />
                  Stats de GitHub
                </h3>
              </div>

              <div class="github-stats-grid">
                <div class="github-stat">
                  <span class="github-stat__number">{{ githubStats.publicRepos }}</span>
                  <span class="github-stat__label">Repos Públicos</span>
                </div>
                <div class="github-stat">
                  <span class="github-stat__number">{{ githubStats.followers }}</span>
                  <span class="github-stat__label">Followers</span>
                </div>
                <div class="github-stat">
                  <span class="github-stat__number">{{ githubStats.following }}</span>
                  <span class="github-stat__label">Following</span>
                </div>
                <div class="github-stat">
                  <span class="github-stat__number">{{ githubStats.totalStars }}</span>
                  <span class="github-stat__label">Total Stars</span>
                </div>
              </div>
            </div>

            <!-- Insignias REALES -->
            <div class="section badges-collection" v-if="recentAchievements.length > 0">
              <div class="section-header">
                <h3 class="section-title">
                  <Award class="w-4 h-4" />
                  Logros Recientes
                </h3>
              </div>

              <div class="badges-showcase">
                <div v-for="achievement in recentAchievements" :key="achievement.id" class="badge-showcase">
                  <div class="badge-showcase__icon">{{ achievement.emoji }}</div>
                  <div class="badge-showcase__info">
                    <h4 class="badge-showcase__name">{{ achievement.name }}</h4>
                    <p class="badge-showcase__description">{{ achievement.description }}</p>
                    <span class="badge-showcase__date">{{ formatDate(achievement.earnedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen de Puntuación REAL -->
            <div class="section score-summary">
              <div class="section-header">
                <h3 class="section-title">
                  <Star class="w-4 h-4" />
                  Puntuación
                </h3>
              </div>

              <div class="score-stats">
                <div class="score-stat">
                  <span class="score-stat__number">{{ progress.totalScore }}</span>
                  <span class="score-stat__label">Puntos Totales</span>
                </div>
                <div class="score-stat">
                  <span class="score-stat__number">{{ progress.longestStreak }}</span>
                  <span class="score-stat__label">Mejor Racha</span>
                </div>
                <div class="score-stat">
                  <span class="score-stat__number">{{ progress.badges.length }}</span>
                  <span class="score-stat__label">Logros</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import {
  User, Star, Flame, TrendingUp, CheckCircle2, Clock,
  Activity, Award, FileText, GitBranch, Database, Share2, Book, Zap
} from 'lucide-vue-next'

const authStore = useAuthStore()
const userStore = useUserStore()

// 🔥 DATOS REALES DE LOS STORES
const { user, isAuthenticated, userAvatar, userName } = storeToRefs(authStore)
const {
  progress,
  completionPercentage,
  userLevel,
  pointsToNextLevel,
  levelProgressPercentage,
  modulesStats,
  recentAchievements,
  recentActivity
} = storeToRefs(userStore)

// 🔥 DATOS REALES DE GITHUB
const githubStats = ref({
  publicRepos: 0,
  followers: 0,
  following: 0,
  totalStars: 0,
  topLanguages: [],
  recentRepos: [],
  yearsOnGitHub: 0,
  loading: true
})

// 🚀 FUNCIÓN PARA CARGAR DATOS REALES
const loadRealGitHubData = async () => {
  if (!user.value?.access_token) {
    githubStats.value.loading = false
    return
  }

  try {
    githubStats.value.loading = true
    console.log('📡 Cargando datos reales de GitHub...')

    // Datos básicos del usuario (ya los tenemos)
    githubStats.value.publicRepos = user.value.github_public_repos || user.value.public_repos || 0
    githubStats.value.followers = user.value.github_followers || user.value.followers || 0
    githubStats.value.following = user.value.github_following || user.value.following || 0

    // Años en GitHub
    if (user.value.github_created_at || user.value.created_at) {
      const joinDate = new Date(user.value.github_created_at || user.value.created_at)
      githubStats.value.yearsOnGitHub = new Date().getFullYear() - joinDate.getFullYear()
    }

    // 📚 Repositorios (solo si tenemos token)
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=50&sort=updated', {
      headers: {
        'Authorization': `Bearer ${user.value.access_token}`,
        'Accept': 'application/vnd.github+json'
      }
    })

    if (reposResponse.ok) {
      const repos = await reposResponse.json()

      // Total de estrellas
      githubStats.value.totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0)

      // Repos recientes (filtrar los que tienen descripción y no son forks)
      githubStats.value.recentRepos = repos
        .filter(repo => !repo.fork)
        .slice(0, 6)
        .map(repo => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          url: repo.html_url
        }))

      // Lenguajes más usados
      const languages = {}
      repos.forEach(repo => {
        if (repo.language && !repo.fork) {
          languages[repo.language] = (languages[repo.language] || 0) + 1
        }
      })

      githubStats.value.topLanguages = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([lang, count]) => ({ name: lang, count }))

      console.log('✅ Datos de GitHub cargados')
    } else {
      console.warn('⚠️ No se pudieron cargar los repositorios')
    }

  } catch (error) {
    console.error('💥 Error cargando datos de GitHub:', error)
  } finally {
    githubStats.value.loading = false
  }
}

// 📅 FUNCIÓN PARA FORMATEAR FECHAS
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  })
}

// 🎨 FUNCIÓN PARA OBTENER COLOR DE LENGUAJE
const getLanguageColor = (language) => {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Vue: '#41b883',
    Python: '#3572A5',
    Java: '#b07219',
    'C#': '#239120',
    PHP: '#4F5D95',
    CSS: '#563d7c',
    HTML: '#e34c26',
    SCSS: '#c6538c',
    Shell: '#89e051',
    Go: '#00ADD8',
    Rust: '#dea584',
    'C++': '#f34b7d',
    C: '#555555',
    Ruby: '#701516',
    Swift: '#fa7343',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Dockerfile: '#384d54'
  }
  return colors[language] || '#8b949e'
}

// 📊 FUNCIÓN PARA CALCULAR PORCENTAJE DE LENGUAJE
const getLanguagePercentage = (count) => {
  const total = githubStats.value.topLanguages.reduce((sum, lang) => sum + lang.count, 0)
  return Math.round((count / total) * 100)
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadRealGitHubData()
  }
})
</script>

<style lang="scss" scoped>
.profile {
  min-height: 100vh;
  background: $primary-dark;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

// Loading state
.loading-profile {
  @include flex-center;
  flex-direction: column;
  gap: 1rem;
  padding: 4rem;
  text-align: center;
  color: $text-secondary;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid $border;
  border-top: 2px solid $accent-blue;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Header del perfil
.profile-header {
  @include card-base;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;

  @include mobile-only {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
  }
}

.profile-header__avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  @include flex-center;
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, $accent-blue, $accent-green);
  border-radius: 50%;
  color: white;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-header__info {
  min-width: 0;
}

.profile-header__name {
  font-size: 1.5rem;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 0.25rem;
}

.profile-header__email {
  color: $text-secondary;
  margin-bottom: 0.5rem;
}

.profile-header__bio {
  color: $text-secondary;
  font-style: italic;
  margin-bottom: 1rem;
}

.profile-header__badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  @include mobile-only {
    justify-content: center;
  }
}

.level-badge,
.streak-badge,
.github-badge {
  @include flex-center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.level-badge {
  background: rgba($warning, 0.1);
  color: $warning;
  border: 1px solid rgba($warning, 0.2);
}

.streak-badge {
  background: rgba($accent-blue, 0.1);
  color: $accent-blue;
  border: 1px solid rgba($accent-blue, 0.2);
}

.github-badge {
  background: rgba($accent-green, 0.1);
  color: $accent-green;
  border: 1px solid rgba($accent-green, 0.2);
}

.profile-header__stats {
  display: flex;
  gap: 2rem;

  @include mobile-only {
    justify-content: space-around;
    width: 100%;
  }
}

.stat-item {
  text-align: center;

  &__number {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: $accent-green;
  }

  &__label {
    font-size: 0.75rem;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

// Grid del contenido
.profile-content {
  display: grid;
  gap: 2rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;

  @include mobile-only {
    grid-template-columns: 1fr;
  }
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

// Secciones
.section {
  @include card-base;
}

.section-header {
  @include flex-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid $border;
}

.section-title {
  @include flex-center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: $text-primary;
  justify-content: flex-start;
}

// Progreso de aprendizaje
.progress-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.overall-progress {
  display: flex;
  gap: 2rem;
  align-items: center;

  @include mobile-only {
    flex-direction: column;
    text-align: center;
  }
}

.progress-circle-large {
  position: relative;
  width: 8rem;
  height: 8rem;
  flex-shrink: 0;

  &__svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  &__bg {
    fill: none;
    stroke: $border;
    stroke-width: 6;
  }

  &__fill {
    fill: none;
    stroke: $accent-green;
    stroke-width: 6;
    stroke-linecap: round;
    @include transition(stroke-dasharray, 0.8s, ease-out);
  }

  &__content {
    @include absolute-center;
    text-align: center;
  }

  &__percentage {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: $text-primary;
  }

  &__label {
    font-size: 0.875rem;
    color: $text-secondary;
  }
}

.progress-details {
  flex: 1;

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 0.5rem;
  }

  &__description {
    color: $text-secondary;
    margin-bottom: 1.5rem;
  }
}

.level-progress {
  &__info {
    @include flex-between;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  &__current {
    color: $text-primary;
    font-weight: 500;
  }

  &__next {
    color: $text-secondary;
  }

  &__bar {
    width: 100%;
    height: 0.5rem;
    background: $border;
    border-radius: 9999px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, $accent-blue, $accent-green);
    border-radius: inherit;
    @include transition(width, 0.6s, ease-out);
  }
}

// Progreso de módulos
.modules-progress {
  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 1rem;
  }
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.module-progress-item {
  padding: 1rem;
  background: $tertiary-dark;
  border-radius: 0.5rem;
  border: 1px solid $border;

  &__header {
    @include flex-between;
    margin-bottom: 0.75rem;
    align-items: flex-start;
  }

  &__icon {
    @include flex-center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    color: white;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    margin-left: 0.75rem;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 0.25rem;
  }

  &__progress {
    font-size: 0.75rem;
    color: $text-secondary;
  }

  &__status {
    flex-shrink: 0;
  }

  &__bar {
    width: 100%;
    height: 0.25rem;
    background: $border;
    border-radius: 9999px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: $accent-green;
    border-radius: inherit;
    @include transition(width, 0.4s, ease-out);
  }
}

// Repositorios
.repos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.repo-card {
  padding: 1rem;
  background: $tertiary-dark;
  border-radius: 0.5rem;
  border: 1px solid $border;
  @include transition();

  &:hover {
    border-color: $accent-blue;
  }

  &__name {
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 0.5rem;
  }

  &__description {
    font-size: 0.75rem;
    color: $text-secondary;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }

  &__meta {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: 0.75rem;
  }
}

.repo-language {
  color: $accent-blue;
}

.repo-stars {
  color: $text-secondary;
}

// Lenguajes
.languages-showcase {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.language-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: $tertiary-dark;
  border-radius: 0.75rem;
  border: 1px solid $border;
  @include transition();
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: $accent-blue;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--language-color, $accent-blue);
    opacity: 0.8;
  }

  &--0::before { background: #f1e05a; }
  &--1::before { background: #2b7489; }
  &--2::before { background: #41b883; }
  &--3::before { background: #3572A5; }
  &--4::before { background: #b07219; }
  &--5::before { background: #239120; }
  &--6::before { background: #4F5D95; }
  &--7::before { background: #563d7c; }

  &__icon {
    @include flex-center;
    flex-shrink: 0;
  }

  &__dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    display: block;
    font-size: 0.95rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 0.125rem;
  }

  &__count {
    font-size: 0.8rem;
    color: $text-secondary;
  }

  &__percentage {
    font-size: 0.875rem;
    font-weight: 600;
    color: $accent-blue;
    background: rgba($accent-blue, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid rgba($accent-blue, 0.2);
    flex-shrink: 0;
  }
}

// Timeline de actividad
.activity-timeline {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: $border;
  }
}

.activity-item {
  position: relative;
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  &__marker {
    @include flex-center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    flex-shrink: 0;
    z-index: 1;

    &--achievement_earned {
      background: rgba($warning, 0.1);
      color: $warning;
      border: 2px solid $warning;
    }

    &--lesson_completed {
      background: rgba($success, 0.1);
      color: $success;
      border: 2px solid $success;
    }

    &--streak_updated {
      background: rgba($accent-blue, 0.1);
      color: $accent-blue;
      border: 2px solid $accent-blue;
    }

    &--module_completed {
      background: rgba($accent-green, 0.1);
      color: $accent-green;
      border: 2px solid $accent-green;
    }
  }

  &__content {
    flex: 1;
    padding: 0.75rem 1rem;
    background: $tertiary-dark;
    border-radius: 0.5rem;
    border: 1px solid $border;
  }

  &__main {
    margin-bottom: 0.5rem;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 0.25rem;
  }

  &__description {
    font-size: 0.75rem;
    color: $text-secondary;
  }

  &__meta {
    @include flex-between;
    font-size: 0.75rem;
  }

  &__time {
    color: $text-muted;
  }

  &__points {
    color: $accent-green;
    font-weight: 500;
  }
}

// Insignias
.badges-showcase {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.badge-showcase {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: $tertiary-dark;
  border-radius: 0.5rem;
  border: 1px solid $border;

  &__icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 0.875rem;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 0.25rem;
  }

  &__description {
    font-size: 0.75rem;
    color: $text-secondary;
    margin-bottom: 0.5rem;
  }

  &__date {
    font-size: 0.75rem;
    color: $text-muted;
  }
}

// GitHub Stats
.github-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.github-stat {
  text-align: center;
  padding: 1rem;
  background: $tertiary-dark;
  border-radius: 0.5rem;
  border: 1px solid $border;

  &__number {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    color: $accent-green;
    margin-bottom: 0.25rem;
  }

  &__label {
    font-size: 0.75rem;
    color: $text-secondary;
  }
}

// Score Summary
.score-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: $tertiary-dark;
  border-radius: 0.5rem;
  border: 1px solid $border;

  &__number {
    font-size: 1.125rem;
    font-weight: 700;
    color: $accent-blue;
  }

  &__label {
    font-size: 0.875rem;
    color: $text-secondary;
  }
}

// Responsive
@include mobile-only {
  .profile-grid {
    .profile-sidebar {
      order: -1;
    }
  }

  .repos-grid {
    grid-template-columns: 1fr;
  }

  .languages-showcase {
    .language-badge {
      padding: 0.875rem 1rem;

      &__name {
        font-size: 0.875rem;
      }

      &__count {
        font-size: 0.75rem;
      }

      &__percentage {
        font-size: 0.8rem;
        padding: 0.2rem 0.4rem;
      }
    }
  }

  .github-stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

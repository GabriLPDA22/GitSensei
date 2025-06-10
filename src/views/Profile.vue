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
            <!-- ✅ AVATAR REAL DE GABRIEL -->
            <img v-if="user?.avatar_url" :src="user.avatar_url" :alt="user.name || user.login" class="avatar-image" />
            <User v-else class="w-12 h-12" />
          </div>
          <button class="avatar-edit">
            <Edit3 class="w-4 h-4" />
          </button>
        </div>

        <div class="profile-header__info">
          <!-- ✅ NOMBRE REAL DE GABRIEL -->
          <h1 class="profile-header__name">{{ user?.name || user?.login }}</h1>
          <p class="profile-header__email">
            @{{ user?.login }}
            <span v-if="user?.location"> • {{ user.location }}</span>
          </p>
          <p v-if="user?.bio" class="profile-header__bio">{{ user.bio }}</p>

          <div class="profile-header__badges">
            <div class="level-badge">
              <Star class="w-4 h-4" />
              Nivel {{ userLevel }}
            </div>
            <div class="streak-badge">
              <Flame class="w-4 h-4" />
              {{ userProgress.currentStreak }} días
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
            <!-- Progreso de Aprendizaje -->
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
                        :stroke-dasharray="`${overallProgress * 2.83} 283`" />
                    </svg>
                    <div class="progress-circle-large__content">
                      <span class="progress-circle-large__percentage">{{ overallProgress }}%</span>
                      <span class="progress-circle-large__label">Completado</span>
                    </div>
                  </div>

                  <div class="progress-details">
                    <h3 class="progress-details__title">Progreso General</h3>
                    <p class="progress-details__description">
                      Has completado {{ userProgress.completedModules }} de 6 módulos
                    </p>

                    <div class="level-progress">
                      <div class="level-progress__info">
                        <span class="level-progress__current">Nivel {{ userLevel }}</span>
                        <span class="level-progress__next">{{ pointsToNextLevel }} puntos para Nivel {{ userLevel + 1
                          }}</span>
                      </div>
                      <div class="level-progress__bar">
                        <div class="level-progress__fill" :style="{ width: `${levelProgressPercentage}%` }"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Módulos individuales -->
                <div class="modules-progress">
                  <h4 class="modules-progress__title">Progreso por Módulo</h4>
                  <div class="modules-list">
                    <div v-for="module in modulesProgress" :key="module.id" class="module-progress-item">
                      <div class="module-progress-item__header">
                        <div class="module-progress-item__icon" :style="{ backgroundColor: module.color }">
                          <component :is="module.icon" class="w-5 h-5" />
                        </div>
                        <div class="module-progress-item__info">
                          <h5 class="module-progress-item__title">{{ module.title }}</h5>
                          <span class="module-progress-item__progress">{{ module.progress }}% completado</span>
                        </div>
                        <div class="module-progress-item__status">
                          <CheckCircle2 v-if="module.progress === 100" class="w-5 h-5 text-accent-green" />
                          <Clock v-else class="w-5 h-5 text-accent-blue" />
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
            <div class="section recent-repos">
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

            <!-- Sección de lenguajes REALES -->
            <div class="section languages">
              <div class="section-header">
                <h2 class="section-title">
                  <FileText class="w-5 h-5" />
                  Tus Lenguajes Principales
                </h2>
              </div>
              <div class="languages-grid">
                <div v-for="language in githubStats.topLanguages" :key="language.name" class="language-item">
                  <span class="language-name">{{ language.name }}</span>
                  <span class="language-count">{{ language.count }} repos</span>
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

            <!-- Insignias -->
            <div class="section badges-collection">
              <div class="section-header">
                <h3 class="section-title">
                  <Award class="w-4 h-4" />
                  Insignias
                </h3>
              </div>

              <div class="badges-showcase">
                <div v-for="badge in featuredBadges" :key="badge.id" class="badge-showcase">
                  <div class="badge-showcase__icon">{{ badge.emoji }}</div>
                  <div class="badge-showcase__info">
                    <h4 class="badge-showcase__name">{{ badge.name }}</h4>
                    <p class="badge-showcase__description">{{ badge.description }}</p>
                  </div>
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
import { storeToRefs } from 'pinia'
import {
  User, Edit3, Star, Flame, TrendingUp, CheckCircle2, Clock,
  Activity, BarChart3, Timer, Target, Zap, Calendar, Award,
  Settings, Download, FileText, GitBranch, Database, Share2, Book
} from 'lucide-vue-next'

const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)

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

// Datos de progreso en la plataforma
const userProgress = ref({
  totalPoints: 850,
  completedModules: 2,
  totalBadges: 5,
  currentStreak: 7
})

// Módulos con progreso
const modulesProgress = ref([
  {
    id: 'module-0',
    title: 'Fundamentos',
    progress: 100,
    color: '#58a6ff',
    icon: FileText
  },
  {
    id: 'module-1',
    title: 'Tu Primer Repositorio',
    progress: 75,
    color: '#39d353',
    icon: Database
  },
  {
    id: 'module-2',
    title: 'El Arte de Ramificar',
    progress: 30,
    color: '#a5a5ff',
    icon: GitBranch
  }
])

// Insignias basadas en datos reales
const featuredBadges = ref([
  {
    id: 1,
    name: 'Conectado',
    emoji: '🔗',
    description: 'Conectaste tu cuenta de GitHub'
  },
  {
    id: 2,
    name: 'Desarrollador',
    emoji: '👨‍💻',
    description: `Tienes ${user.value?.public_repos || 0} repositorios`
  },
  {
    id: 3,
    name: 'Estudiante DAW',
    emoji: '🎓',
    description: 'Estudiante de Desarrollo Web'
  }
])

// Computed con datos reales
const userLevel = computed(() => Math.floor(userProgress.value.totalPoints / 250) + 1)
const overallProgress = computed(() => Math.round((userProgress.value.completedModules / 6) * 100))
const pointsToNextLevel = computed(() => {
  const nextLevelPoints = userLevel.value * 250
  return nextLevelPoints - userProgress.value.totalPoints
})
const levelProgressPercentage = computed(() => {
  const currentLevelPoints = (userLevel.value - 1) * 250
  const pointsInLevel = userProgress.value.totalPoints - currentLevelPoints
  return (pointsInLevel / 250) * 100
})

// 🚀 FUNCIÓN PARA CARGAR DATOS REALES
const loadRealGitHubData = async () => {
  if (!user.value?.access_token) return

  try {
    githubStats.value.loading = true
    console.log('📡 Cargando datos reales de GitHub...')

    // Datos básicos
    githubStats.value.publicRepos = user.value.public_repos || 0
    githubStats.value.followers = user.value.followers || 0
    githubStats.value.following = user.value.following || 0

    // Años en GitHub
    if (user.value.created_at) {
      const joinDate = new Date(user.value.created_at)
      githubStats.value.yearsOnGitHub = new Date().getFullYear() - joinDate.getFullYear()
    }

    // 📚 Repositorios
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${user.value.access_token}`,
        'Accept': 'application/vnd.github+json'
      }
    })

    if (reposResponse.ok) {
      const repos = await reposResponse.json()

      // Total de estrellas
      githubStats.value.totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0)

      // Repos recientes
      githubStats.value.recentRepos = repos.slice(0, 5).map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count
      }))

      // Lenguajes más usados
      const languages = {}
      repos.forEach(repo => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1
        }
      })

      githubStats.value.topLanguages = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([lang, count]) => ({ name: lang, count }))

      console.log('✅ Datos de GitHub cargados')
    }

  } catch (error) {
    console.error('💥 Error:', error)
  } finally {
    githubStats.value.loading = false
  }
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
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  @include flex-center;
  width: 1.5rem;
  height: 1.5rem;
  background: $accent-blue;
  border: 2px solid $secondary-dark;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  @include transition();

  &:hover {
    background: #7bb3ff;
  }
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
.streak-badge {
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

.section-action {
  color: $accent-blue;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  @include transition();

  &:hover {
    color: #7bb3ff;
  }
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

    &--achievement {
      background: rgba($warning, 0.1);
      color: $warning;
      border: 2px solid $warning;
    }

    &--lesson {
      background: rgba($success, 0.1);
      color: $success;
      border: 2px solid $success;
    }

    &--streak {
      background: rgba($accent-blue, 0.1);
      color: $accent-blue;
      border: 2px solid $accent-blue;
    }

    &--module {
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

// Estadísticas detalladas
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  @include card-base;
  padding: 1.25rem;
  text-align: center;
  background: $tertiary-dark;

  &__icon {
    @include flex-center;
    width: 3rem;
    height: 3rem;
    background: linear-gradient(135deg, $accent-blue, $accent-green);
    border-radius: 50%;
    margin: 0 auto 1rem;
    color: white;
  }

  &__number {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 0.25rem;
  }

  &__label {
    font-size: 0.875rem;
    color: $text-secondary;
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

// Objetivos
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-item {
  padding: 1rem;
  background: $tertiary-dark;
  border-radius: 0.5rem;
  border: 1px solid $border;

  &__header {
    @include flex-between;
    margin-bottom: 0.5rem;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 500;
    color: $text-primary;
  }

  &__progress {
    font-size: 0.75rem;
    color: $accent-blue;
    font-weight: 500;
  }

  &__bar {
    width: 100%;
    height: 0.25rem;
    background: $border;
    border-radius: 9999px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  &__fill {
    height: 100%;
    background: $accent-blue;
    border-radius: inherit;
    @include transition(width, 0.4s, ease-out);
  }

  &__description {
    font-size: 0.75rem;
    color: $text-secondary;
  }
}

// Configuración
.settings-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.setting-item {
  @include flex-between;
  gap: 1rem;

  &__info {
    flex: 1;
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
}

.toggle-switch {
  position: relative;
  width: 2.5rem;
  height: 1.25rem;
  background: $border;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  @include transition();

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &--active {
    background: $accent-blue;
  }

  &__slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 1rem;
    height: 1rem;
    background: white;
    border-radius: 50%;
    @include transition(transform, 0.2s);
  }

  &--active &__slider {
    transform: translateX(1.25rem);
  }
}

.settings-actions {
  padding-top: 1rem;
  border-top: 1px solid $border;
}

// Botones
.btn {
  @include button-base;

  &--secondary {
    @include button-base;
    background: transparent;
    color: $text-primary;
    border: 1px solid $border;

    &:hover:not(:disabled) {
      border-color: $accent-blue;
      background: rgba($accent-blue, 0.1);
    }
  }

  &--small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

.w-full {
  width: 100%;
}
</style>

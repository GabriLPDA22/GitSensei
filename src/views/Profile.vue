<template>
  <div class="profile">
    <div class="container">
      <!-- Header del Perfil -->
      <div class="profile-header">
        <div class="profile-header__avatar">
          <div class="avatar">
            <User class="w-12 h-12" />
          </div>
          <button class="avatar-edit">
            <Edit3 class="w-4 h-4" />
          </button>
        </div>

        <div class="profile-header__info">
          <h1 class="profile-header__name">{{ userProfile.name }}</h1>
          <p class="profile-header__email">{{ userProfile.email }}</p>
          <div class="profile-header__badges">
            <div class="level-badge">
              <Star class="w-4 h-4" />
              Nivel {{ userLevel }}
            </div>
            <div class="streak-badge">
              <Flame class="w-4 h-4" />
              {{ userStreak }} días
            </div>
          </div>
        </div>

        <div class="profile-header__stats">
          <div class="stat-item">
            <span class="stat-item__number">{{ userStats.totalPoints }}</span>
            <span class="stat-item__label">Puntos Totales</span>
          </div>
          <div class="stat-item">
            <span class="stat-item__number">{{ userStats.completedModules }}</span>
            <span class="stat-item__label">Módulos Completados</span>
          </div>
          <div class="stat-item">
            <span class="stat-item__number">{{ userStats.totalBadges }}</span>
            <span class="stat-item__label">Insignias</span>
          </div>
        </div>
      </div>

      <!-- Contenido del Perfil -->
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
                      <circle
                        class="progress-circle-large__bg"
                        cx="50"
                        cy="50"
                        r="45"
                      />
                      <circle
                        class="progress-circle-large__fill"
                        cx="50"
                        cy="50"
                        r="45"
                        :stroke-dasharray="`${overallProgress * 2.83} 283`"
                      />
                    </svg>
                    <div class="progress-circle-large__content">
                      <span class="progress-circle-large__percentage">{{ overallProgress }}%</span>
                      <span class="progress-circle-large__label">Completado</span>
                    </div>
                  </div>

                  <div class="progress-details">
                    <h3 class="progress-details__title">Progreso General</h3>
                    <p class="progress-details__description">
                      Has completado {{ userStats.completedModules }} de {{ totalModules }} módulos
                    </p>

                    <div class="level-progress">
                      <div class="level-progress__info">
                        <span class="level-progress__current">Nivel {{ userLevel }}</span>
                        <span class="level-progress__next">{{ pointsToNextLevel }} puntos para Nivel {{ userLevel + 1 }}</span>
                      </div>
                      <div class="level-progress__bar">
                        <div
                          class="level-progress__fill"
                          :style="{ width: `${levelProgressPercentage}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Módulos individuales -->
                <div class="modules-progress">
                  <h4 class="modules-progress__title">Progreso por Módulo</h4>
                  <div class="modules-list">
                    <div
                      v-for="module in modulesProgress"
                      :key="module.id"
                      class="module-progress-item"
                    >
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
                        <div
                          class="module-progress-item__fill"
                          :style="{ width: `${module.progress}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actividad Reciente -->
            <div class="section recent-activity">
              <div class="section-header">
                <h2 class="section-title">
                  <Activity class="w-5 h-5" />
                  Actividad Reciente
                </h2>
                <button class="section-action">Ver Todo</button>
              </div>

              <div class="activity-timeline">
                <div
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-item__marker" :class="`activity-item__marker--${activity.type}`">
                    <component :is="activity.icon" class="w-4 h-4" />
                  </div>
                  <div class="activity-item__content">
                    <div class="activity-item__main">
                      <h4 class="activity-item__title">{{ activity.title }}</h4>
                      <p class="activity-item__description">{{ activity.description }}</p>
                    </div>
                    <div class="activity-item__meta">
                      <span class="activity-item__time">{{ activity.time }}</span>
                      <span v-if="activity.points" class="activity-item__points">
                        +{{ activity.points }} puntos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Estadísticas Detalladas -->
            <div class="section detailed-stats">
              <div class="section-header">
                <h2 class="section-title">
                  <BarChart3 class="w-5 h-5" />
                  Estadísticas Detalladas
                </h2>
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-card__icon">
                    <Timer class="w-6 h-6" />
                  </div>
                  <div class="stat-card__content">
                    <span class="stat-card__number">{{ userStats.totalTimeSpent }}</span>
                    <span class="stat-card__label">Horas de Estudio</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-card__icon">
                    <Target class="w-6 h-6" />
                  </div>
                  <div class="stat-card__content">
                    <span class="stat-card__number">{{ userStats.exercisesCompleted }}</span>
                    <span class="stat-card__label">Ejercicios Completados</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-card__icon">
                    <Zap class="w-6 h-6" />
                  </div>
                  <div class="stat-card__content">
                    <span class="stat-card__number">{{ userStats.currentStreak }}</span>
                    <span class="stat-card__label">Racha Actual</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-card__icon">
                    <Calendar class="w-6 h-6" />
                  </div>
                  <div class="stat-card__content">
                    <span class="stat-card__number">{{ userStats.activeDays }}</span>
                    <span class="stat-card__label">Días Activos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="profile-sidebar">
            <!-- Insignias -->
            <div class="section badges-collection">
              <div class="section-header">
                <h3 class="section-title">
                  <Award class="w-4 h-4" />
                  Insignias
                </h3>
                <button class="section-action">Ver Todas</button>
              </div>

              <div class="badges-showcase">
                <div
                  v-for="badge in featuredBadges"
                  :key="badge.id"
                  class="badge-showcase"
                  :title="badge.description"
                >
                  <div class="badge-showcase__icon">
                    {{ badge.emoji }}
                  </div>
                  <div class="badge-showcase__info">
                    <h4 class="badge-showcase__name">{{ badge.name }}</h4>
                    <p class="badge-showcase__description">{{ badge.description }}</p>
                    <span class="badge-showcase__date">{{ badge.earnedDate }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Objetivos -->
            <div class="section goals">
              <div class="section-header">
                <h3 class="section-title">
                  <Target class="w-4 h-4" />
                  Objetivos
                </h3>
              </div>

              <div class="goals-list">
                <div
                  v-for="goal in currentGoals"
                  :key="goal.id"
                  class="goal-item"
                >
                  <div class="goal-item__header">
                    <h4 class="goal-item__title">{{ goal.title }}</h4>
                    <span class="goal-item__progress">{{ goal.current }}/{{ goal.target }}</span>
                  </div>
                  <div class="goal-item__bar">
                    <div
                      class="goal-item__fill"
                      :style="{ width: `${(goal.current / goal.target) * 100}%` }"
                    ></div>
                  </div>
                  <p class="goal-item__description">{{ goal.description }}</p>
                </div>
              </div>
            </div>

            <!-- Configuración -->
            <div class="section settings">
              <div class="section-header">
                <h3 class="section-title">
                  <Settings class="w-4 h-4" />
                  Configuración
                </h3>
              </div>

              <div class="settings-options">
                <div class="setting-item">
                  <div class="setting-item__info">
                    <h4 class="setting-item__title">Notificaciones</h4>
                    <p class="setting-item__description">Recibir recordatorios de estudio</p>
                  </div>
                  <div class="setting-item__control">
                    <button
                      class="toggle-switch"
                      :class="{ 'toggle-switch--active': settings.notifications }"
                      @click="toggleSetting('notifications')"
                    >
                      <div class="toggle-switch__slider"></div>
                    </button>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-item__info">
                    <h4 class="setting-item__title">Tema Oscuro</h4>
                    <p class="setting-item__description">Usar tema oscuro por defecto</p>
                  </div>
                  <div class="setting-item__control">
                    <button
                      class="toggle-switch toggle-switch--active"
                      disabled
                    >
                      <div class="toggle-switch__slider"></div>
                    </button>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-item__info">
                    <h4 class="setting-item__title">Sonidos</h4>
                    <p class="setting-item__description">Efectos de sonido en ejercicios</p>
                  </div>
                  <div class="setting-item__control">
                    <button
                      class="toggle-switch"
                      :class="{ 'toggle-switch--active': settings.sounds }"
                      @click="toggleSetting('sounds')"
                    >
                      <div class="toggle-switch__slider"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div class="settings-actions">
                <button class="btn btn--secondary btn--small w-full">
                  <Download class="w-4 h-4 mr-2" />
                  Exportar Progreso
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  User, Edit3, Star, Flame, TrendingUp, CheckCircle2, Clock,
  Activity, BarChart3, Timer, Target, Zap, Calendar, Award,
  Settings, Download, FileText, GitBranch, Database, Share2, Book
} from 'lucide-vue-next'

// Estado reactivo
const userProfile = ref({
  name: 'Desarrollador Git',
  email: 'developer@gitlearning.com',
  avatar: null,
  joinedDate: '2024-01-15'
})

const userStats = ref({
  totalPoints: 1250,
  completedModules: 2,
  totalBadges: 5,
  totalTimeSpent: 12,
  exercisesCompleted: 23,
  currentStreak: 7,
  activeDays: 15
})

const settings = ref({
  notifications: true,
  darkMode: true,
  sounds: false
})

const totalModules = ref(6)

// Computed properties
const userLevel = computed(() => {
  return Math.floor(userStats.value.totalPoints / 250) + 1
})

const userStreak = computed(() => {
  return userStats.value.currentStreak
})

const overallProgress = computed(() => {
  return Math.round((userStats.value.completedModules / totalModules.value) * 100)
})

const pointsToNextLevel = computed(() => {
  const currentLevelPoints = (userLevel.value - 1) * 250
  const nextLevelPoints = userLevel.value * 250
  return nextLevelPoints - userStats.value.totalPoints
})

const levelProgressPercentage = computed(() => {
  const currentLevelPoints = (userLevel.value - 1) * 250
  const pointsInLevel = userStats.value.totalPoints - currentLevelPoints
  return (pointsInLevel / 250) * 100
})

// Datos del progreso de módulos
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
  },
  {
    id: 'module-3',
    title: 'Colaboración y Remotos',
    progress: 0,
    color: '#d29922',
    icon: Share2
  },
  {
    id: 'module-4',
    title: 'La Forja',
    progress: 0,
    color: '#79c0ff',
    icon: Zap
  },
  {
    id: 'module-5',
    title: 'Biblioteca de Comandos',
    progress: 0,
    color: '#56d364',
    icon: Book
  }
])

// Actividades recientes
const recentActivities = ref([
  {
    id: 1,
    type: 'achievement',
    icon: Award,
    title: 'Nueva insignia obtenida',
    description: 'Has ganado la insignia "Maestro del Merge"',
    time: 'hace 2 horas',
    points: 100
  },
  {
    id: 2,
    type: 'lesson',
    icon: CheckCircle2,
    title: 'Lección completada',
    description: 'Completaste "Resolución de Conflictos"',
    time: 'hace 1 día',
    points: 50
  },
  {
    id: 3,
    type: 'streak',
    icon: Flame,
    title: 'Racha de 7 días',
    description: 'Has estudiado 7 días consecutivos',
    time: 'hace 2 días',
    points: 75
  },
  {
    id: 4,
    type: 'module',
    icon: Target,
    title: 'Módulo completado',
    description: 'Completaste "Fundamentos de Git"',
    time: 'hace 3 días',
    points: 200
  }
])

// Insignias destacadas
const featuredBadges = ref([
  {
    id: 1,
    name: 'Primer Commit',
    emoji: '🥇',
    description: 'Realiza tu primer commit',
    earnedDate: 'hace 2 semanas'
  },
  {
    id: 2,
    name: 'Explorador',
    emoji: '🗺️',
    description: 'Completa el módulo de fundamentos',
    earnedDate: 'hace 1 semana'
  },
  {
    id: 3,
    name: 'Maestro del Merge',
    emoji: '🔀',
    description: 'Resuelve 5 conflictos de merge',
    earnedDate: 'hace 2 horas'
  }
])

// Objetivos actuales
const currentGoals = ref([
  {
    id: 1,
    title: 'Racha de 30 días',
    description: 'Estudia 30 días consecutivos',
    current: 7,
    target: 30
  },
  {
    id: 2,
    title: 'Completar 3 módulos',
    description: 'Completa 3 módulos completos',
    current: 2,
    target: 3
  },
  {
    id: 3,
    title: '50 ejercicios',
    description: 'Completa 50 ejercicios prácticos',
    current: 23,
    target: 50
  }
])

// Métodos
const toggleSetting = (setting) => {
  settings.value[setting] = !settings.value[setting]
  // Aquí se guardarían las preferencias
}
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

<template>
  <div class="dashboard">
    <!-- Header del Dashboard -->
    <div class="dashboard__header">
      <div class="container">
        <div class="dashboard-header">
          <div class="dashboard-header__info">
            <h1 class="dashboard-header__title">
              ¡Hola de nuevo! 👋
            </h1>
            <p class="dashboard-header__subtitle">
              Continúa tu viaje para dominar Git y GitHub
            </p>
          </div>
          <div class="dashboard-header__stats">
            <div class="stat-card">
              <div class="stat-card__icon">
                <Trophy class="w-6 h-6" />
              </div>
              <div class="stat-card__content">
                <span class="stat-card__number">{{ userProgress.totalScore }}</span>
                <span class="stat-card__label">Puntos</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card__icon">
                <Target class="w-6 h-6" />
              </div>
              <div class="stat-card__content">
                <span class="stat-card__number">{{ userProgress.completionPercentage }}%</span>
                <span class="stat-card__label">Completado</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card__icon">
                <Award class="w-6 h-6" />
              </div>
              <div class="stat-card__content">
                <span class="stat-card__number">{{ userProgress.badges.length }}</span>
                <span class="stat-card__label">Insignias</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="dashboard__content">
      <div class="container">
        <div class="dashboard-grid">
          <!-- Panel Izquierdo -->
          <div class="dashboard-main">
            <!-- Progreso General -->
            <div class="progress-section">
              <h2 class="section-title">
                <TrendingUp class="w-5 h-5" />
                Tu Progreso
              </h2>
              <div class="progress-overview">
                <div class="progress-bar">
                  <div class="progress-bar__track">
                    <div
                      class="progress-bar__fill"
                      :style="{ width: `${userProgress.completionPercentage}%` }"
                    ></div>
                  </div>
                  <span class="progress-bar__label">
                    {{ userProgress.completedModules.length }} de {{ totalModules }} módulos completados
                  </span>
                </div>

                <!-- Racha de aprendizaje -->
                <div class="streak-counter">
                  <Flame class="w-5 h-5 text-accent-blue" />
                  <span class="streak-counter__text">
                    <strong>{{ currentStreak }}</strong> días consecutivos
                  </span>
                </div>
              </div>
            </div>

            <!-- Módulos de Aprendizaje -->
            <div class="modules-section">
              <h2 class="section-title">
                <BookOpen class="w-5 h-5" />
                Módulos de Aprendizaje
              </h2>
              <div class="modules-grid">
                <div
                  v-for="module in modules"
                  :key="module.id"
                  class="module-card"
                  :class="{
                    'module-card--completed': module.completed,
                    'module-card--current': module.id === currentModule?.id,
                    'module-card--locked': module.locked
                  }"
                  @click="openModule(module)"
                >
                  <div class="module-card__header">
                    <div class="module-card__icon" :style="{ backgroundColor: module.color }">
                      <component :is="module.icon" class="w-6 h-6" />
                    </div>
                    <div class="module-card__status">
                      <CheckCircle2 v-if="module.completed" class="w-5 h-5 text-accent-green" />
                      <Play v-else-if="!module.locked" class="w-5 h-5 text-accent-blue" />
                      <Lock v-else class="w-5 h-5 text-text-muted" />
                    </div>
                  </div>

                  <div class="module-card__content">
                    <h3 class="module-card__title">{{ module.title }}</h3>
                    <p class="module-card__description">{{ module.description }}</p>

                    <div class="module-card__meta">
                      <span class="meta-item">
                        <Clock class="w-4 h-4" />
                        {{ module.duration }}
                      </span>
                      <span class="meta-item">
                        <Users class="w-4 h-4" />
                        {{ module.difficulty }}
                      </span>
                    </div>

                    <!-- Progreso del módulo -->
                    <div v-if="module.progress > 0" class="module-progress">
                      <div class="module-progress__bar">
                        <div
                          class="module-progress__fill"
                          :style="{ width: `${module.progress}%` }"
                        ></div>
                      </div>
                      <span class="module-progress__text">{{ module.progress }}% completado</span>
                    </div>

                    <!-- Botón de acción -->
                    <button
                      class="module-card__action"
                      :class="[
                        module.completed ? 'btn--success' : 'btn--primary',
                        { 'btn--disabled': module.locked }
                      ]"
                      :disabled="module.locked"
                    >
                      {{ getActionText(module) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ejercicios Recientes -->
            <div class="recent-section">
              <h2 class="section-title">
                <History class="w-5 h-5" />
                Actividad Reciente
              </h2>
              <div class="activity-feed">
                <div
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-item__icon" :class="`activity-item__icon--${activity.type}`">
                    <component :is="activity.icon" class="w-4 h-4" />
                  </div>
                  <div class="activity-item__content">
                    <p class="activity-item__text">{{ activity.text }}</p>
                    <span class="activity-item__time">{{ activity.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel Derecho -->
          <div class="dashboard-sidebar">
            <!-- Insignias -->
            <div class="badges-section">
              <h3 class="sidebar-title">
                <Award class="w-4 h-4" />
                Insignias Recientes
              </h3>
              <div class="badges-grid">
                <div
                  v-for="badge in recentBadges"
                  :key="badge.id"
                  class="badge-item"
                  :title="badge.description"
                >
                  <div class="badge-item__icon">
                    {{ badge.emoji }}
                  </div>
                  <span class="badge-item__name">{{ badge.name }}</span>
                </div>
              </div>
              <button class="btn btn--secondary btn--small w-full">
                Ver Todas las Insignias
              </button>
            </div>

            <!-- Próximos Desafíos -->
            <div class="challenges-section">
              <h3 class="sidebar-title">
                <Zap class="w-4 h-4" />
                Próximos Desafíos
              </h3>
              <div class="challenges-list">
                <div
                  v-for="challenge in upcomingChallenges"
                  :key="challenge.id"
                  class="challenge-item"
                >
                  <div class="challenge-item__reward">
                    +{{ challenge.points }}
                  </div>
                  <div class="challenge-item__content">
                    <h4 class="challenge-item__title">{{ challenge.title }}</h4>
                    <p class="challenge-item__description">{{ challenge.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Consejos del Día -->
            <div class="tip-section">
              <h3 class="sidebar-title">
                <Lightbulb class="w-4 h-4" />
                Consejo del Día
              </h3>
              <div class="tip-card">
                <p class="tip-card__text">{{ dailyTip.text }}</p>
                <button class="tip-card__action" @click="nextTip">
                  <RefreshCw class="w-4 h-4" />
                  Siguiente Consejo
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Trophy, Target, Award, TrendingUp, BookOpen, Clock, Users,
  CheckCircle2, Play, Lock, History, Zap, Lightbulb, RefreshCw,
  Flame, GitBranch, FileText, Share2, Database, Book
} from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()

// Estado reactivo
const currentStreak = ref(7)
const totalModules = ref(6)
const currentTipIndex = ref(0)

// Datos computados
const userProgress = computed(() => userStore.progress)

const currentModule = computed(() => {
  return modules.value.find(m => !m.completed && !m.locked)
})

// Datos de módulos
const modules = ref([
  {
    id: 'module-0',
    title: 'Fundamentos',
    description: 'Conceptos básicos de Git y control de versiones',
    duration: '30 min',
    difficulty: 'Principiante',
    color: '#58a6ff',
    icon: FileText,
    completed: true,
    locked: false,
    progress: 100
  },
  {
    id: 'module-1',
    title: 'Tu Primer Repositorio',
    description: 'Crea tu primer repo y haz commits',
    duration: '45 min',
    difficulty: 'Principiante',
    color: '#39d353',
    icon: Database,
    completed: false,
    locked: false,
    progress: 60
  },
  {
    id: 'module-2',
    title: 'El Arte de Ramificar',
    description: 'Branches, merge y trabajo colaborativo',
    duration: '60 min',
    difficulty: 'Intermedio',
    color: '#a5a5ff',
    icon: GitBranch,
    completed: false,
    locked: false,
    progress: 0
  },
  {
    id: 'module-3',
    title: 'Colaboración y Remotos',
    description: 'Push, pull, fetch y trabajo en equipo',
    duration: '50 min',
    difficulty: 'Intermedio',
    color: '#d29922',
    icon: Share2,
    completed: false,
    locked: true,
    progress: 0
  },
  {
    id: 'module-4',
    title: 'La Forja',
    description: 'Ejercicios prácticos y resolución de conflictos',
    duration: '90 min',
    difficulty: 'Avanzado',
    color: '#79c0ff',
    icon: Zap,
    completed: false,
    locked: true,
    progress: 0
  },
  {
    id: 'module-5',
    title: 'Biblioteca de Comandos',
    description: 'Guía de referencia rápida',
    duration: '∞',
    difficulty: 'Referencia',
    color: '#56d364',
    icon: Book,
    completed: false,
    locked: true,
    progress: 0
  }
])

// Actividades recientes
const recentActivities = ref([
  {
    id: 1,
    type: 'success',
    icon: CheckCircle2,
    text: 'Completaste "Fundamentos de Git"',
    time: 'hace 2 horas'
  },
  {
    id: 2,
    type: 'progress',
    icon: Play,
    text: 'Progreso en "Tu Primer Repositorio" - 60%',
    time: 'hace 1 día'
  },
  {
    id: 3,
    type: 'badge',
    icon: Award,
    text: 'Obtuviste la insignia "Primer Commit"',
    time: 'hace 2 días'
  }
])

// Insignias recientes
const recentBadges = ref([
  {
    id: 1,
    name: 'Primer Commit',
    emoji: '🥇',
    description: 'Realiza tu primer commit'
  },
  {
    id: 2,
    name: 'Explorador',
    emoji: '🗺️',
    description: 'Completa el módulo de fundamentos'
  },
  {
    id: 3,
    name: 'Estudiante',
    emoji: '📚',
    description: 'Dedica 30 minutos al aprendizaje'
  }
])

// Próximos desafíos
const upcomingChallenges = ref([
  {
    id: 1,
    title: 'Racha de 10 días',
    description: 'Aprende 10 días consecutivos',
    points: 500
  },
  {
    id: 2,
    title: 'Maestro del Merge',
    description: 'Completa 5 ejercicios de merge',
    points: 300
  }
])

// Consejos del día
const dailyTips = ref([
  {
    text: '💡 Usa "git status" frecuentemente para saber el estado de tu repositorio.'
  },
  {
    text: '🚀 Los mensajes de commit descriptivos te ahorrarán tiempo en el futuro.'
  },
  {
    text: '🌿 Crea branches para cada nueva funcionalidad o experimento.'
  },
  {
    text: '🔄 "git fetch" actualiza la información de remotos sin cambiar tu código.'
  }
])

const dailyTip = computed(() => dailyTips.value[currentTipIndex.value])

// Métodos
const openModule = (module) => {
  if (module.locked) return
  router.push(`/module/${module.id}`)
}

const getActionText = (module) => {
  if (module.locked) return 'Bloqueado'
  if (module.completed) return 'Revisar'
  if (module.progress > 0) return 'Continuar'
  return 'Empezar'
}

const nextTip = () => {
  currentTipIndex.value = (currentTipIndex.value + 1) % dailyTips.value.length
}

// Lifecycle
onMounted(() => {
  // Simular carga de datos del usuario
  console.log('Dashboard cargado')
})
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100vh;
  background: $primary-dark;
}

// Header del Dashboard
.dashboard__header {
  background: $secondary-dark;
  border-bottom: 1px solid $border;
  padding: 2rem 0;
}

.dashboard-header {
  @include flex-between;
  gap: 2rem;

  @include mobile-only {
    flex-direction: column;
    gap: 1.5rem;
  }

  &__info {
    flex: 1;
  }

  &__title {
    font-size: 2rem;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 0.5rem;

    @include mobile-only {
      font-size: 1.5rem;
    }
  }

  &__subtitle {
    color: $text-secondary;
    font-size: 1.125rem;
  }

  &__stats {
    display: flex;
    gap: 1rem;

    @include mobile-only {
      width: 100%;
      justify-content: space-between;
    }
  }
}

.stat-card {
  @include card-base;
  padding: 1rem;
  min-width: 120px;
  text-align: center;

  &__icon {
    @include flex-center;
    width: 2.5rem;
    height: 2.5rem;
    background: linear-gradient(135deg, $accent-blue, $accent-green);
    border-radius: 50%;
    margin: 0 auto 0.75rem;
    color: white;
  }

  &__number {
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

// Contenido Principal
.dashboard__content {
  padding: 2rem 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;

  @include mobile-only {
    grid-template-columns: 1fr;
  }
}

.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

// Títulos de sección
.section-title {
  @include flex-center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 1.5rem;
  justify-content: flex-start;
}

.sidebar-title {
  @include flex-center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 1rem;
  justify-content: flex-start;
}

// Sección de Progreso
.progress-section {
  @include card-base;
}

.progress-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-bar {
  &__track {
    width: 100%;
    height: 0.75rem;
    background: $border;
    border-radius: 9999px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, $accent-green, $accent-blue);
    border-radius: inherit;
    @include transition(width, 0.6s, ease-out);
  }

  &__label {
    font-size: 0.875rem;
    color: $text-secondary;
    margin-top: 0.5rem;
  }
}

.streak-counter {
  @include flex-center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba($accent-blue, 0.1);
  border: 1px solid rgba($accent-blue, 0.2);
  border-radius: 0.5rem;
  justify-content: flex-start;

  &__text {
    color: $text-secondary;

    strong {
      color: $accent-blue;
    }
  }
}

// Sección de Módulos
.modules-section {
  @include card-base;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.module-card {
  @include card-base;
  cursor: pointer;
  @include transition();

  &:hover:not(&--locked) {
    transform: translateY(-2px);
    border-color: $accent-blue;
  }

  &--completed {
    border-color: $accent-green;
    background: rgba($accent-green, 0.05);
  }

  &--current {
    border-color: $accent-blue;
    background: rgba($accent-blue, 0.05);
  }

  &--locked {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &__header {
    @include flex-between;
    margin-bottom: 1rem;
  }

  &__icon {
    @include flex-center;
    width: 3rem;
    height: 3rem;
    border-radius: 0.5rem;
    color: white;
  }

  &__status {
    @include flex-center;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 0.5rem;
  }

  &__description {
    color: $text-secondary;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  &__meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  &__action {
    @include button-base;
    width: 100%;

    &.btn--primary {
      @include button-primary;
    }

    &.btn--success {
      @include button-success;
    }

    &.btn--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.meta-item {
  @include flex-center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: $text-muted;
}

.module-progress {
  margin-bottom: 1rem;

  &__bar {
    width: 100%;
    height: 0.25rem;
    background: $border;
    border-radius: 9999px;
    overflow: hidden;
    margin-bottom: 0.25rem;
  }

  &__fill {
    height: 100%;
    background: $accent-green;
    border-radius: inherit;
    @include transition(width, 0.3s);
  }

  &__text {
    font-size: 0.75rem;
    color: $text-secondary;
  }
}

// Actividades Recientes
.recent-section {
  @include card-base;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;

  &__icon {
    @include flex-center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    flex-shrink: 0;

    &--success {
      background: rgba($success, 0.1);
      color: $success;
    }

    &--progress {
      background: rgba($accent-blue, 0.1);
      color: $accent-blue;
    }

    &--badge {
      background: rgba($warning, 0.1);
      color: $warning;
    }
  }

  &__content {
    flex: 1;
  }

  &__text {
    color: $text-primary;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  &__time {
    color: $text-muted;
    font-size: 0.75rem;
  }
}

// Sidebar Sections
.badges-section,
.challenges-section,
.tip-section {
  @include card-base;
  padding: 1.25rem;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.badge-item {
  text-align: center;
  padding: 0.75rem 0.5rem;
  background: $tertiary-dark;
  border-radius: 0.5rem;
  @include transition();

  &:hover {
    background: lighten-color($tertiary-dark, 5%);
  }

  &__icon {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }

  &__name {
    font-size: 0.75rem;
    color: $text-secondary;
    display: block;
  }
}

.challenges-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.challenge-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: $tertiary-dark;
  border-radius: 0.5rem;

  &__reward {
    @include flex-center;
    width: 2.5rem;
    height: 2.5rem;
    background: linear-gradient(135deg, $accent-green, $accent-blue);
    border-radius: 50%;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 0.25rem;
  }

  &__description {
    font-size: 0.75rem;
    color: $text-secondary;
  }
}

.tip-card {
  padding: 1rem;
  background: $tertiary-dark;
  border-radius: 0.5rem;

  &__text {
    color: $text-secondary;
    font-size: 0.875rem;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  &__action {
    @include flex-center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: $accent-blue;
    font-size: 0.75rem;
    cursor: pointer;
    @include transition();

    &:hover {
      color: lighten-color($accent-blue, 10%);
    }
  }
}

// Botones
.btn {
  @include button-base;

  &--primary {
    @include button-primary;
  }

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

  &--success {
    @include button-success;
  }

  &--small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style>

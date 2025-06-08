<template>
  <div class="exercises">
    <div class="container">
      <!-- Header -->
      <div class="exercises-header">
        <h1 class="exercises-header__title">
          <Terminal class="w-8 h-8" />
          La Forja de Ejercicios
        </h1>
        <p class="exercises-header__subtitle">
          Practica tus habilidades de Git con ejercicios interactivos.
          Desde principiante hasta experto.
        </p>
      </div>

      <!-- Filtros -->
      <div class="exercises-filters">
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Dificultad:</label>
            <div class="filter-pills">
              <button
                v-for="level in difficultyLevels"
                :key="level.value"
                class="filter-pill"
                :class="{ 'filter-pill--active': selectedDifficulty === level.value }"
                @click="selectedDifficulty = level.value"
              >
                {{ level.label }}
              </button>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">Categoría:</label>
            <div class="filter-pills">
              <button
                v-for="category in categories"
                :key="category.value"
                class="filter-pill"
                :class="{ 'filter-pill--active': selectedCategory === category.value }"
                @click="selectedCategory = category.value"
              >
                {{ category.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="search-box">
          <Search class="w-4 h-4" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar ejercicios..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Lista de Ejercicios -->
      <div class="exercises-grid">
        <div
          v-for="exercise in filteredExercises"
          :key="exercise.id"
          class="exercise-card"
          :class="{ 'exercise-card--completed': exercise.completed }"
          @click="startExercise(exercise)"
        >
          <div class="exercise-card__header">
            <div class="exercise-card__difficulty" :class="`difficulty--${exercise.difficulty}`">
              {{ getDifficultyLabel(exercise.difficulty) }}
            </div>
            <div class="exercise-card__status">
              <CheckCircle2 v-if="exercise.completed" class="w-5 h-5 text-accent-green" />
              <Clock v-else-if="exercise.inProgress" class="w-5 h-5 text-accent-blue" />
              <Play v-else class="w-5 h-5 text-text-secondary" />
            </div>
          </div>

          <div class="exercise-card__content">
            <h3 class="exercise-card__title">{{ exercise.title }}</h3>
            <p class="exercise-card__description">{{ exercise.description }}</p>

            <div class="exercise-card__tags">
              <span
                v-for="tag in exercise.tags"
                :key="tag"
                class="exercise-tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="exercise-card__meta">
              <span class="meta-item">
                <Timer class="w-4 h-4" />
                {{ exercise.estimatedTime }}
              </span>
              <span class="meta-item">
                <Target class="w-4 h-4" />
                {{ exercise.points }} puntos
              </span>
              <span class="meta-item">
                <Users class="w-4 h-4" />
                {{ exercise.completions }} completado{{ exercise.completions !== 1 ? 's' : '' }}
              </span>
            </div>

            <!-- Progreso si está en progreso -->
            <div v-if="exercise.inProgress" class="exercise-progress">
              <div class="exercise-progress__bar">
                <div
                  class="exercise-progress__fill"
                  :style="{ width: `${exercise.progress}%` }"
                ></div>
              </div>
              <span class="exercise-progress__text">{{ exercise.progress }}% completado</span>
            </div>
          </div>

          <div class="exercise-card__footer">
            <button class="exercise-card__button">
              {{ getButtonText(exercise) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="filteredExercises.length === 0" class="empty-state">
        <Search class="w-16 h-16 text-text-muted" />
        <h3 class="empty-state__title">No se encontraron ejercicios</h3>
        <p class="empty-state__text">
          Intenta ajustar los filtros o buscar con otros términos.
        </p>
        <button @click="clearFilters" class="btn btn--secondary">
          Limpiar Filtros
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Terminal, Search, CheckCircle2, Clock, Play, Timer,
  Target, Users
} from 'lucide-vue-next'

const router = useRouter()

// Estado reactivo
const searchQuery = ref('')
const selectedDifficulty = ref('all')
const selectedCategory = ref('all')

// Datos
const difficultyLevels = ref([
  { value: 'all', label: 'Todos' },
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' }
])

const categories = ref([
  { value: 'all', label: 'Todas' },
  { value: 'basics', label: 'Básicos' },
  { value: 'branching', label: 'Ramificación' },
  { value: 'merging', label: 'Fusión' },
  { value: 'collaboration', label: 'Colaboración' },
  { value: 'advanced', label: 'Avanzado' }
])

const exercises = ref([
  {
    id: 'ex-001',
    title: 'Tu Primer Commit',
    description: 'Aprende a hacer tu primer commit en Git con este ejercicio guiado paso a paso.',
    difficulty: 'beginner',
    category: 'basics',
    tags: ['git init', 'git add', 'git commit'],
    estimatedTime: '10 min',
    points: 100,
    completions: 1247,
    completed: true,
    inProgress: false,
    progress: 0
  },
  {
    id: 'ex-002',
    title: 'Creando Ramas',
    description: 'Practica la creación y navegación entre ramas en Git.',
    difficulty: 'beginner',
    category: 'branching',
    tags: ['git branch', 'git checkout', 'git switch'],
    estimatedTime: '15 min',
    points: 150,
    completions: 892,
    completed: false,
    inProgress: true,
    progress: 65
  },
  {
    id: 'ex-003',
    title: 'Resolviendo Conflictos',
    description: 'Aprende a resolver conflictos de merge como un profesional.',
    difficulty: 'intermediate',
    category: 'merging',
    tags: ['git merge', 'conflicts', 'resolution'],
    estimatedTime: '25 min',
    points: 250,
    completions: 543,
    completed: false,
    inProgress: false,
    progress: 0
  },
  {
    id: 'ex-004',
    title: 'Rebase Interactivo',
    description: 'Domina el rebase interactivo para limpiar tu historial de commits.',
    difficulty: 'advanced',
    category: 'advanced',
    tags: ['git rebase', 'interactive', 'squash'],
    estimatedTime: '35 min',
    points: 400,
    completions: 187,
    completed: false,
    inProgress: false,
    progress: 0
  },
  {
    id: 'ex-005',
    title: 'Colaboración con Pull Requests',
    description: 'Practica el flujo de trabajo colaborativo con Pull Requests.',
    difficulty: 'intermediate',
    category: 'collaboration',
    tags: ['pull request', 'code review', 'github'],
    estimatedTime: '30 min',
    points: 300,
    completions: 421,
    completed: false,
    inProgress: false,
    progress: 0
  },
  {
    id: 'ex-006',
    title: 'Git Flow Workflow',
    description: 'Implementa el flujo de trabajo Git Flow en un proyecto real.',
    difficulty: 'advanced',
    category: 'collaboration',
    tags: ['git flow', 'workflow', 'releases'],
    estimatedTime: '45 min',
    points: 500,
    completions: 98,
    completed: false,
    inProgress: false,
    progress: 0
  }
])

// Computed
const filteredExercises = computed(() => {
  let filtered = exercises.value

  // Filtrar por dificultad
  if (selectedDifficulty.value !== 'all') {
    filtered = filtered.filter(ex => ex.difficulty === selectedDifficulty.value)
  }

  // Filtrar por categoría
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(ex => ex.category === selectedCategory.value)
  }

  // Filtrar por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(ex =>
      ex.title.toLowerCase().includes(query) ||
      ex.description.toLowerCase().includes(query) ||
      ex.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

// Métodos
const getDifficultyLabel = (difficulty) => {
  const labels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  }
  return labels[difficulty] || difficulty
}

const getButtonText = (exercise) => {
  if (exercise.completed) return 'Repasar'
  if (exercise.inProgress) return 'Continuar'
  return 'Empezar'
}

const startExercise = (exercise) => {
  // Aquí navegarías a la página del ejercicio específico
  // Por ahora, simularemos la navegación
  console.log('Starting exercise:', exercise.title)
  // router.push(`/exercise/${exercise.id}`)
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedDifficulty.value = 'all'
  selectedCategory.value = 'all'
}
</script>

<style lang="scss" scoped>
.exercises {
  min-height: 100vh;
  background: $primary-dark;
  padding: 2rem 0;
}

// Header
.exercises-header {
  text-align: center;
  margin-bottom: 3rem;

  &__title {
    @include flex-center;
    gap: 1rem;
    font-size: 2.5rem;
    font-weight: 700;
    color: $text-primary;
    margin: 0 auto 1rem;
    justify-content: center;

    @include mobile-only {
      font-size: 2rem;
    }
  }

  &__subtitle {
    font-size: 1.25rem;
    color: $text-secondary;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

// Filtros
.exercises-filters {
  background: $secondary-dark;
  border: 1px solid $border;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filters-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;

  @include mobile-only {
    flex-direction: column;
    gap: 1rem;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: $text-primary;
}

.filter-pills {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-pill {
  padding: 0.5rem 1rem;
  background: $tertiary-dark;
  border: 1px solid $border;
  border-radius: 9999px;
  color: $text-secondary;
  font-size: 0.875rem;
  cursor: pointer;
  @include transition();

  &:hover {
    color: $text-primary;
    border-color: $accent-blue;
  }

  &--active {
    background: $accent-blue;
    border-color: $accent-blue;
    color: white;
  }
}

.search-box {
  position: relative;
  max-width: 400px;

  .lucide {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: $text-secondary;
  }
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: $tertiary-dark;
  border: 1px solid $border;
  border-radius: 0.5rem;
  color: $text-primary;
  font-size: 0.875rem;
  @include transition();

  &:focus {
    outline: none;
    border-color: $accent-blue;
    box-shadow: 0 0 0 2px rgba($accent-blue, 0.2);
  }

  &::placeholder {
    color: $text-muted;
  }
}

// Grid de ejercicios
.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.exercise-card {
  @include card-interactive;
  display: flex;
  flex-direction: column;
  height: 100%;

  &--completed {
    border-color: $accent-green;
    background: rgba($accent-green, 0.05);
  }

  &__header {
    @include flex-between;
    margin-bottom: 1rem;
  }

  &__difficulty {
    @include badge-base;
    font-size: 0.75rem;

    &.difficulty--beginner {
      background: rgba($success, 0.1);
      color: $success;
      border: 1px solid rgba($success, 0.2);
    }

    &.difficulty--intermediate {
      background: rgba($warning, 0.1);
      color: $warning;
      border: 1px solid rgba($warning, 0.2);
    }

    &.difficulty--advanced {
      background: rgba($danger, 0.1);
      color: $danger;
      border: 1px solid rgba($danger, 0.2);
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: $text-primary;
  }

  &__description {
    color: $text-secondary;
    line-height: 1.5;
    flex: 1;
  }

  &__tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $border;
  }

  &__button {
    @include button-primary;
    width: 100%;
  }
}

.exercise-tag {
  @include badge-base;
  background: rgba($accent-blue, 0.1);
  color: $accent-blue;
  border: 1px solid rgba($accent-blue, 0.2);
  font-size: 0.75rem;
}

.meta-item {
  @include flex-center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: $text-muted;
}

.exercise-progress {
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
    background: $accent-blue;
    border-radius: inherit;
    @include transition(width, 0.3s);
  }

  &__text {
    font-size: 0.75rem;
    color: $text-secondary;
  }
}

// Estado vacío
.empty-state {
  @include flex-center;
  flex-direction: column;
  padding: 4rem 2rem;
  text-align: center;
  gap: 1rem;

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-primary;
  }

  &__text {
    color: $text-secondary;
    max-width: 400px;
  }
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
}
</style>

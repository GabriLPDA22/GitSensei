<template>
  <div class="module-view">
    <!-- Header del Módulo -->
    <div class="module-header">
      <div class="container">
        <div class="module-header__content">
          <!-- Breadcrumb -->
          <nav class="breadcrumb">
            <router-link to="/dashboard" class="breadcrumb__link">
              <ArrowLeft class="w-4 h-4" />
              Dashboard
            </router-link>
            <ChevronRight class="w-4 h-4 text-text-muted" />
            <span class="breadcrumb__current">{{ currentModule?.title }}</span>
          </nav>

          <!-- Info del módulo -->
          <div class="module-info">
            <div class="module-info__main">
              <div class="module-info__icon" :style="{ backgroundColor: currentModule?.color }">
                <component :is="currentModule?.icon" class="w-8 h-8" />
              </div>
              <div class="module-info__details">
                <h1 class="module-info__title">{{ currentModule?.title }}</h1>
                <p class="module-info__description">{{ currentModule?.description }}</p>
                <div class="module-info__meta">
                  <span class="meta-badge">{{ currentModule?.difficulty }}</span>
                  <span class="meta-item">
                    <Clock class="w-4 h-4" />
                    {{ currentModule?.duration }}
                  </span>
                  <span class="meta-item">
                    <Target class="w-4 h-4" />
                    {{ currentModule?.lessons?.length }} lecciones
                  </span>
                </div>
              </div>
            </div>

            <!-- Progreso del módulo -->
            <div class="module-progress">
              <div class="progress-circle">
                <svg class="progress-circle__svg" viewBox="0 0 100 100">
                  <circle
                    class="progress-circle__bg"
                    cx="50"
                    cy="50"
                    r="45"
                  />
                  <circle
                    class="progress-circle__fill"
                    cx="50"
                    cy="50"
                    r="45"
                    :stroke-dasharray="`${moduleProgress * 2.83} 283`"
                  />
                </svg>
                <div class="progress-circle__content">
                  <span class="progress-circle__percentage">{{ moduleProgress }}%</span>
                  <span class="progress-circle__label">Completado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido del Módulo -->
    <div class="module-content">
      <div class="container">
        <div class="module-layout">
          <!-- Lista de Lecciones -->
          <div class="lessons-sidebar">
            <div class="lessons-header">
              <h3 class="lessons-title">
                <BookOpen class="w-5 h-5" />
                Contenido del Módulo
              </h3>
            </div>

            <div class="lessons-list">
              <div
                v-for="(lesson, index) in currentModule?.lessons"
                :key="lesson.id"
                class="lesson-item"
                :class="{
                  'lesson-item--active': lesson.id === currentLesson?.id,
                  'lesson-item--completed': lesson.completed,
                  'lesson-item--locked': lesson.locked
                }"
                @click="selectLesson(lesson, index)"
              >
                <div class="lesson-item__number">
                  <CheckCircle2 v-if="lesson.completed" class="w-4 h-4" />
                  <Play v-else-if="!lesson.locked" class="w-4 h-4" />
                  <Lock v-else class="w-4 h-4" />
                </div>
                <div class="lesson-item__content">
                  <h4 class="lesson-item__title">{{ lesson.title }}</h4>
                  <p class="lesson-item__type">{{ lesson.type }}</p>
                  <span class="lesson-item__duration">{{ lesson.duration }}</span>
                </div>
              </div>
            </div>

            <!-- Resumen del módulo -->
            <div class="module-summary">
              <h4 class="summary-title">Resumen</h4>
              <div class="summary-stats">
                <div class="summary-stat">
                  <span class="summary-stat__number">{{ completedLessons }}</span>
                  <span class="summary-stat__label">Completadas</span>
                </div>
                <div class="summary-stat">
                  <span class="summary-stat__number">{{ totalLessons - completedLessons }}</span>
                  <span class="summary-stat__label">Pendientes</span>
                </div>
                <div class="summary-stat">
                  <span class="summary-stat__number">{{ estimatedTime }}</span>
                  <span class="summary-stat__label">min restantes</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenido de la Lección -->
          <div class="lesson-content">
            <div v-if="currentLesson" class="lesson-container">
              <!-- Header de la lección -->
              <div class="lesson-header">
                <div class="lesson-header__info">
                  <h2 class="lesson-header__title">{{ currentLesson.title }}</h2>
                  <p class="lesson-header__description">{{ currentLesson.description }}</p>
                </div>
                <div class="lesson-header__actions">
                  <button
                    v-if="currentLesson.completed"
                    class="btn btn--success btn--small"
                  >
                    <CheckCircle2 class="w-4 h-4 mr-1" />
                    Completada
                  </button>
                  <button
                    v-else
                    class="btn btn--primary btn--small"
                    @click="markAsCompleted"
                  >
                    Marcar como Completada
                  </button>
                </div>
              </div>

              <!-- Contenido según el tipo de lección -->
              <div class="lesson-body">
                <!-- Lección Teórica -->
                <div v-if="currentLesson.type === 'Teoría'" class="theory-content">
                  <div class="content-section" v-for="section in currentLesson.content" :key="section.id">
                    <h3 class="content-section__title">{{ section.title }}</h3>
                    <div class="content-section__body" v-html="section.content"></div>

                    <!-- Código de ejemplo -->
                    <div v-if="section.codeExample" class="code-example">
                      <div class="code-example__header">
                        <span class="code-example__title">Ejemplo</span>
                        <button class="code-example__copy" @click="copyCode(section.codeExample)">
                          <Copy class="w-4 h-4" />
                        </button>
                      </div>
                      <pre class="code-example__body"><code>{{ section.codeExample }}</code></pre>
                    </div>
                  </div>
                </div>

                <!-- Ejercicio Práctico -->
                <div v-else-if="currentLesson.type === 'Práctica'" class="practice-content">
                  <div class="practice-instructions">
                    <h3 class="practice-instructions__title">🎯 Objetivo</h3>
                    <p class="practice-instructions__text">{{ currentLesson.objective }}</p>
                  </div>

                  <!-- Terminal Simulator Component -->
                  <div class="terminal-container">
                    <TerminalSimulator
                      :exercise="currentLesson.exercise"
                      @exercise-completed="onExerciseCompleted"
                    />
                  </div>

                  <!-- Hints expandibles -->
                  <div class="hints-section">
                    <button
                      class="hints-toggle"
                      @click="showHints = !showHints"
                    >
                      <Lightbulb class="w-4 h-4" />
                      {{ showHints ? 'Ocultar Pistas' : 'Ver Pistas' }}
                      <ChevronDown class="w-4 h-4" :class="{ 'rotate-180': showHints }" />
                    </button>
                    <div v-show="showHints" class="hints-content">
                      <div v-for="(hint, index) in currentLesson.hints" :key="index" class="hint-item">
                        <span class="hint-item__number">{{ index + 1 }}</span>
                        <p class="hint-item__text">{{ hint }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Quiz -->
                <div v-else-if="currentLesson.type === 'Quiz'" class="quiz-content">
                  <div class="quiz-progress">
                    <span class="quiz-progress__text">
                      Pregunta {{ currentQuestionIndex + 1 }} de {{ currentLesson.questions?.length }}
                    </span>
                    <div class="quiz-progress__bar">
                      <div
                        class="quiz-progress__fill"
                        :style="{ width: `${((currentQuestionIndex + 1) / currentLesson.questions?.length) * 100}%` }"
                      ></div>
                    </div>
                  </div>

                  <div v-if="currentQuestion" class="question-container">
                    <h3 class="question-title">{{ currentQuestion.question }}</h3>
                    <div class="question-options">
                      <button
                        v-for="(option, index) in currentQuestion.options"
                        :key="index"
                        class="option-button"
                        :class="{
                          'option-button--selected': selectedAnswer === index,
                          'option-button--correct': quizAnswered && index === currentQuestion.correct,
                          'option-button--incorrect': quizAnswered && selectedAnswer === index && index !== currentQuestion.correct
                        }"
                        @click="selectAnswer(index)"
                        :disabled="quizAnswered"
                      >
                        <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                        <span class="option-text">{{ option }}</span>
                      </button>
                    </div>

                    <div v-if="quizAnswered" class="question-feedback">
                      <div class="feedback-message" :class="{ 'feedback-message--correct': isCorrectAnswer }">
                        <CheckCircle2 v-if="isCorrectAnswer" class="w-5 h-5" />
                        <XCircle v-else class="w-5 h-5" />
                        <span>
                          {{ isCorrectAnswer ? '¡Correcto!' : 'Incorrecto.' }}
                          {{ currentQuestion.explanation }}
                        </span>
                      </div>
                      <button
                        class="btn btn--primary"
                        @click="nextQuestion"
                      >
                        {{ currentQuestionIndex < currentLesson.questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Quiz' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navegación de lecciones -->
              <div class="lesson-navigation">
                <button
                  v-if="currentLessonIndex > 0"
                  class="btn btn--secondary"
                  @click="previousLesson"
                >
                  <ArrowLeft class="w-4 h-4 mr-2" />
                  Anterior
                </button>
                <div class="lesson-navigation__spacer"></div>
                <button
                  v-if="currentLessonIndex < totalLessons - 1"
                  class="btn btn--primary"
                  @click="nextLesson"
                  :disabled="!currentLesson.completed"
                >
                  Siguiente
                  <ArrowRight class="w-4 h-4 ml-2" />
                </button>
                <button
                  v-else-if="moduleProgress === 100"
                  class="btn btn--success"
                  @click="completeModule"
                >
                  <Trophy class="w-4 h-4 mr-2" />
                  Completar Módulo
                </button>
              </div>
            </div>

            <!-- Estado vacío cuando no hay lección seleccionada -->
            <div v-else class="empty-state">
              <BookOpen class="w-16 h-16 text-text-muted" />
              <h3 class="empty-state__title">Selecciona una lección</h3>
              <p class="empty-state__text">
                Elige una lección del panel izquierdo para comenzar tu aprendizaje.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, ChevronRight, Clock, Target, BookOpen, CheckCircle2,
  Play, Lock, Copy, Lightbulb, ChevronDown, ArrowRight, Trophy,
  XCircle, FileText, GitBranch, Database, Share2, Zap, Book
} from 'lucide-vue-next'
// import TerminalSimulator from '@/components/interactive/TerminalSimulator.vue'

const route = useRoute()
const router = useRouter()

// Estado reactivo
const currentLessonIndex = ref(0)
const showHints = ref(false)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const quizAnswered = ref(false)

// Datos de módulos (en una app real vendría de una store)
const modules = ref({
  'module-0': {
    id: 'module-0',
    title: 'Fundamentos',
    description: 'Conceptos básicos de Git y control de versiones',
    difficulty: 'Principiante',
    duration: '30 min',
    color: '#58a6ff',
    icon: FileText,
    lessons: [
      {
        id: 'lesson-0-1',
        title: '¿Qué es el Control de Versiones?',
        description: 'Introducción al concepto de control de versiones',
        type: 'Teoría',
        duration: '10 min',
        completed: false,
        locked: false,
        content: [
          {
            id: 1,
            title: 'Definición',
            content: '<p>El control de versiones es un sistema que registra los cambios realizados en un archivo o conjunto de archivos a lo largo del tiempo, de modo que puedas recuperar versiones específicas más adelante.</p>'
          }
        ]
      },
      {
        id: 'lesson-0-2',
        title: 'Git vs GitHub',
        description: 'Diferencias entre Git y GitHub',
        type: 'Teoría',
        duration: '10 min',
        completed: false,
        locked: false,
        content: [
          {
            id: 1,
            title: 'Git vs GitHub',
            content: '<p><strong>Git</strong> es el sistema de control de versiones. <strong>GitHub</strong> es una plataforma que usa Git para alojar repositorios en la nube.</p>'
          }
        ]
      },
      {
        id: 'lesson-0-3',
        title: 'Quiz: Conceptos Básicos',
        description: 'Evalúa tu comprensión de los conceptos fundamentales',
        type: 'Quiz',
        duration: '5 min',
        completed: false,
        locked: false,
        questions: [
          {
            question: '¿Qué es Git?',
            options: [
              'Una plataforma web para hospedar código',
              'Un sistema de control de versiones distribuido',
              'Un editor de código',
              'Un lenguaje de programación'
            ],
            correct: 1,
            explanation: 'Git es un sistema de control de versiones distribuido que permite rastrear cambios en archivos.'
          }
        ]
      }
    ]
  },
  'module-1': {
    id: 'module-1',
    title: 'Tu Primer Repositorio',
    description: 'Aprende a crear tu primer repositorio y hacer commits',
    difficulty: 'Principiante',
    duration: '45 min',
    color: '#39d353',
    icon: Database,
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Instalación y Configuración',
        description: 'Configura Git en tu sistema',
        type: 'Teoría',
        duration: '15 min',
        completed: false,
        locked: false,
        content: []
      },
      {
        id: 'lesson-1-2',
        title: 'Primer Repositorio',
        description: 'Crea tu primer repositorio con Git',
        type: 'Práctica',
        duration: '20 min',
        completed: false,
        locked: false,
        objective: 'Inicializa un repositorio Git y realiza tu primer commit',
        exercise: {
          title: "Tu Primer Repositorio",
          description: "Aprende a inicializar un repositorio Git y hacer tu primer commit.",
          steps: [
            {
              instruction: "Inicializa un nuevo repositorio Git",
              expectedCommand: "git init",
              hint: "Usa el comando 'git init' para crear un nuevo repositorio"
            },
            {
              instruction: "Verifica el estado del repositorio",
              expectedCommand: "git status",
              hint: "El comando 'git status' te muestra el estado actual"
            }
          ]
        },
        hints: [
          'Usa "git init" para inicializar un repositorio',
          'Siempre verifica el estado con "git status"',
          'Los archivos nuevos aparecen como "untracked"'
        ]
      }
    ]
  }
  // Más módulos...
})

// Computed properties
const currentModule = computed(() => {
  return modules.value[route.params.moduleId]
})

const currentLesson = computed(() => {
  return currentModule.value?.lessons?.[currentLessonIndex.value]
})

const totalLessons = computed(() => {
  return currentModule.value?.lessons?.length || 0
})

const completedLessons = computed(() => {
  return currentModule.value?.lessons?.filter(lesson => lesson.completed).length || 0
})

const moduleProgress = computed(() => {
  if (totalLessons.value === 0) return 0
  return Math.round((completedLessons.value / totalLessons.value) * 100)
})

const estimatedTime = computed(() => {
  const pendingLessons = currentModule.value?.lessons?.filter(lesson => !lesson.completed) || []
  return pendingLessons.reduce((total, lesson) => {
    const duration = parseInt(lesson.duration) || 0
    return total + duration
  }, 0)
})

const currentQuestion = computed(() => {
  return currentLesson.value?.questions?.[currentQuestionIndex.value]
})

const isCorrectAnswer = computed(() => {
  return selectedAnswer.value === currentQuestion.value?.correct
})

// Métodos
const selectLesson = (lesson, index) => {
  if (lesson.locked) return
  currentLessonIndex.value = index
  resetQuizState()
}

const markAsCompleted = () => {
  if (currentLesson.value) {
    currentLesson.value.completed = true
  }
}

const nextLesson = () => {
  if (currentLessonIndex.value < totalLessons.value - 1) {
    currentLessonIndex.value++
    resetQuizState()
  }
}

const previousLesson = () => {
  if (currentLessonIndex.value > 0) {
    currentLessonIndex.value--
    resetQuizState()
  }
}

const completeModule = () => {
  // Lógica para completar el módulo
  router.push('/dashboard')
}

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    // Mostrar notificación de copiado
  } catch (err) {
    console.error('Error copying code:', err)
  }
}

const onExerciseCompleted = () => {
  markAsCompleted()
}

// Quiz methods
const selectAnswer = (index) => {
  if (quizAnswered.value) return
  selectedAnswer.value = index
  quizAnswered.value = true
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < currentLesson.value.questions.length - 1) {
    currentQuestionIndex.value++
    resetQuizState()
  } else {
    // Quiz completado
    markAsCompleted()
  }
}

const resetQuizState = () => {
  selectedAnswer.value = null
  quizAnswered.value = false
  currentQuestionIndex.value = 0
}

// Lifecycle
onMounted(() => {
  if (!currentModule.value) {
    router.push('/dashboard')
    return
  }

  // Seleccionar primera lección no completada
  const firstIncomplete = currentModule.value.lessons.findIndex(lesson => !lesson.completed && !lesson.locked)
  if (firstIncomplete !== -1) {
    currentLessonIndex.value = firstIncomplete
  }
})

// Watchers
watch(() => route.params.moduleId, () => {
  currentLessonIndex.value = 0
  resetQuizState()
})
</script>

<style lang="scss" scoped>
.module-view {
  min-height: 100vh;
  background: $primary-dark;
}

// Header del módulo
.module-header {
  background: $secondary-dark;
  border-bottom: 1px solid $border;
  padding: 2rem 0;

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}

.breadcrumb {
  @include flex-center;
  gap: 0.5rem;
  font-size: 0.875rem;

  &__link {
    @include flex-center;
    gap: 0.5rem;
    color: $accent-blue;
    text-decoration: none;
    @include transition();

    &:hover {
      color: #7bb3ff;
    }
  }

  &__current {
    color: $text-primary;
    font-weight: 500;
  }
}

.module-info {
  @include flex-between;
  gap: 2rem;

  @include mobile-only {
    flex-direction: column;
  }

  &__main {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  &__icon {
    @include flex-center;
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    color: white;
    flex-shrink: 0;
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

  &__description {
    color: $text-secondary;
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }

  &__meta {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }
}

.meta-badge {
  @include badge-base;
  background: rgba($accent-blue, 0.1);
  color: $accent-blue;
  border: 1px solid rgba($accent-blue, 0.2);
}

.meta-item {
  @include flex-center;
  gap: 0.25rem;
  color: $text-secondary;
  font-size: 0.875rem;
}

// Progreso circular
.module-progress {
  flex-shrink: 0;
}

.progress-circle {
  position: relative;
  width: 6rem;
  height: 6rem;

  &__svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  &__bg {
    fill: none;
    stroke: $border;
    stroke-width: 8;
  }

  &__fill {
    fill: none;
    stroke: $accent-green;
    stroke-width: 8;
    stroke-linecap: round;
    @include transition(stroke-dasharray, 0.6s, ease-out);
  }

  &__content {
    @include absolute-center;
    text-align: center;
  }

  &__percentage {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    color: $text-primary;
  }

  &__label {
    font-size: 0.75rem;
    color: $text-secondary;
  }
}

// Layout del módulo
.module-content {
  padding: 2rem 0;
}

.module-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  min-height: calc(100vh - 200px);

  @include mobile-only {
    grid-template-columns: 1fr;
  }
}

// Sidebar de lecciones
.lessons-sidebar {
  background: $secondary-dark;
  border: 1px solid $border;
  border-radius: 0.75rem;
  height: fit-content;
  position: sticky;
  top: 2rem;

  @include mobile-only {
    position: static;
  }
}

.lessons-header {
  padding: 1.5rem;
  border-bottom: 1px solid $border;
}

.lessons-title {
  @include flex-center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: $text-primary;
  justify-content: flex-start;
}

.lessons-list {
  padding: 1rem;
}

.lesson-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  @include transition();
  margin-bottom: 0.5rem;

  &:hover:not(&--locked) {
    background: $tertiary-dark;
  }

  &--active {
    background: rgba($accent-blue, 0.1);
    border: 1px solid rgba($accent-blue, 0.3);
  }

  &--completed {
    .lesson-item__number {
      color: $accent-green;
    }
  }

  &--locked {
    opacity: 0.5;
    cursor: not-allowed;

    .lesson-item__number {
      color: $text-muted;
    }
  }

  &__number {
    @include flex-center;
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
    color: $accent-blue;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 0.25rem;
  }

  &__type {
    font-size: 0.75rem;
    color: $text-secondary;
    margin-bottom: 0.25rem;
  }

  &__duration {
    font-size: 0.75rem;
    color: $text-muted;
  }
}

.module-summary {
  padding: 1.5rem;
  border-top: 1px solid $border;
  background: $tertiary-dark;
}

.summary-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 1rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.summary-stat {
  text-align: center;

  &__number {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    color: $accent-green;
  }

  &__label {
    font-size: 0.75rem;
    color: $text-secondary;
  }
}

// Contenido de lección
.lesson-content {
  background: $secondary-dark;
  border: 1px solid $border;
  border-radius: 0.75rem;
  overflow: hidden;
}

.lesson-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.lesson-header {
  @include flex-between;
  padding: 1.5rem;
  border-bottom: 1px solid $border;
  background: $tertiary-dark;

  @include mobile-only {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 0.5rem;
  }

  &__description {
    color: $text-secondary;
  }
}

.lesson-body {
  flex: 1;
  padding: 2rem;
}

// Contenido teórico
.content-section {
  margin-bottom: 2rem;

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 1rem;
  }

  &__body {
    color: $text-secondary;
    line-height: 1.7;

    p {
      margin-bottom: 1rem;
    }

    strong {
      color: $text-primary;
    }
  }
}

.code-example {
  margin-top: 1.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid $border;

  &__header {
    @include flex-between;
    padding: 0.75rem 1rem;
    background: $primary-dark;
    border-bottom: 1px solid $border;
  }

  &__title {
    font-size: 0.875rem;
    color: $text-secondary;
  }

  &__copy {
    @include flex-center;
    padding: 0.25rem;
    background: none;
    border: none;
    color: $text-secondary;
    cursor: pointer;
    border-radius: 0.25rem;
    @include transition();

    &:hover {
      background: $border;
      color: $text-primary;
    }
  }

  &__body {
    padding: 1rem;
    background: $primary-dark;
    font-family: $font-mono;
    font-size: 0.875rem;
    color: $text-primary;
    overflow-x: auto;
  }
}

// Contenido práctico
.practice-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.practice-instructions {
  padding: 1rem;
  background: rgba($accent-blue, 0.1);
  border: 1px solid rgba($accent-blue, 0.2);
  border-radius: 0.5rem;

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: $accent-blue;
    margin-bottom: 0.5rem;
  }

  &__text {
    color: $text-secondary;
    line-height: 1.5;
  }
}

.terminal-container {
  border-radius: 0.5rem;
  overflow: hidden;
}

.hints-section {
  border-top: 1px solid $border;
  padding-top: 1rem;
}

.hints-toggle {
  @include flex-center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: $tertiary-dark;
  border: 1px solid $border;
  border-radius: 0.5rem;
  color: $text-primary;
  cursor: pointer;
  @include transition();

  &:hover {
    background: #2a313a;
  }

  .rotate-180 {
    transform: rotate(180deg);
  }
}

.hints-content {
  margin-top: 1rem;
  padding: 1rem;
  background: $primary-dark;
  border-radius: 0.5rem;
}

.hint-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }

  &__number {
    @include flex-center;
    width: 1.5rem;
    height: 1.5rem;
    background: $accent-blue;
    color: white;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  &__text {
    color: $text-secondary;
    line-height: 1.5;
  }
}

// Quiz content
.quiz-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.quiz-progress {
  &__text {
    font-size: 0.875rem;
    color: $text-secondary;
    margin-bottom: 0.5rem;
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
    background: $accent-blue;
    border-radius: inherit;
    @include transition(width, 0.3s);
  }
}

.question-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-button {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: $tertiary-dark;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  text-align: left;
  cursor: pointer;
  @include transition();

  &:hover:not(:disabled) {
    background: #2a313a;
  }

  &--selected {
    border-color: $accent-blue;
    background: rgba($accent-blue, 0.1);
  }

  &--correct {
    border-color: $success;
    background: rgba($success, 0.1);
  }

  &--incorrect {
    border-color: $danger;
    background: rgba($danger, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.option-letter {
  @include flex-center;
  width: 1.5rem;
  height: 1.5rem;
  background: $border;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  color: $text-primary;
  flex-shrink: 0;
}

.option-text {
  color: $text-primary;
  line-height: 1.5;
}

.question-feedback {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: $primary-dark;
  border-radius: 0.5rem;
}

.feedback-message {
  @include flex-center;
  gap: 0.5rem;
  justify-content: flex-start;
  color: $text-secondary;

  &--correct {
    color: $success;
  }
}

// Navegación de lecciones
.lesson-navigation {
  @include flex-between;
  padding: 1.5rem;
  border-top: 1px solid $border;
  background: $tertiary-dark;

  &__spacer {
    flex: 1;
  }
}

// Estado vacío
.empty-state {
  @include flex-center;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  text-align: center;
  gap: 1rem;

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-primary;
  }

  &__text {
    color: $text-secondary;
    max-width: 300px;
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

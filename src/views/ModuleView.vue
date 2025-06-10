<template>
  <div class="module-view">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando módulo...</p>
    </div>

    <!-- Header del Módulo -->
    <div v-else-if="currentModule" class="module-header">
      <div class="container">
        <div class="module-header__content">
          <!-- Breadcrumb -->
          <nav class="breadcrumb">
            <router-link to="/dashboard" class="breadcrumb__link">
              <ArrowLeft class="w-4 h-4" />
              Dashboard
            </router-link>
            <ChevronRight class="w-4 h-4 text-text-muted" />
            <span class="breadcrumb__current">{{ currentModule.title }}</span>
          </nav>

          <!-- Info del módulo -->
          <div class="module-info">
            <div class="module-info__main">
              <div class="module-info__icon" :style="{ backgroundColor: currentModule.color }">
                <component :is="currentModule.icon" class="w-8 h-8" />
              </div>
              <div class="module-info__details">
                <h1 class="module-info__title">{{ currentModule.title }}</h1>
                <p class="module-info__description">{{ currentModule.description }}</p>
                <div class="module-info__meta">
                  <span class="meta-badge">{{ currentModule.difficulty }}</span>
                  <span class="meta-item">
                    <Clock class="w-4 h-4" />
                    {{ currentModule.estimatedTime }}
                  </span>
                  <span class="meta-item">
                    <Target class="w-4 h-4" />
                    {{ currentModule.totalLessons }} lecciones
                  </span>
                  <span class="meta-item">
                    <Star class="w-4 h-4" />
                    {{ currentModule.pointsEarned || 0 }} puntos
                  </span>
                </div>
              </div>
            </div>

            <!-- Progreso del módulo REAL -->
            <div class="module-progress">
              <div class="progress-circle">
                <svg class="progress-circle__svg" viewBox="0 0 100 100">
                  <circle class="progress-circle__bg" cx="50" cy="50" r="45" />
                  <circle class="progress-circle__fill" cx="50" cy="50" r="45"
                    :stroke-dasharray="`${currentModule.progress || 0 * 2.83} 283`" />
                </svg>
                <div class="progress-circle__content">
                  <span class="progress-circle__percentage">{{ currentModule.progress || 0 }}%</span>
                  <span class="progress-circle__label">Completado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido del Módulo -->
    <div v-if="currentModule" class="module-content">
      <div class="container">
        <div class="module-layout">
          <!-- Lista de Lecciones SIMPLIFICADA -->
          <div class="lessons-sidebar">
            <div class="lessons-header">
              <h3 class="lessons-title">
                <BookOpen class="w-5 h-5" />
                Contenido del Módulo
              </h3>
            </div>

            <div class="lessons-list">
              <div v-for="(lesson, index) in lessons" :key="lesson.id" class="lesson-item" :class="{
                'lesson-item--active': index === currentLessonIndex,
                'lesson-item--completed': lesson.completed,
                'lesson-item--locked': index > 0 && !lessons[index - 1]?.completed
              }" @click="selectLesson(index)">
                <div class="lesson-item__number">
                  <CheckCircle2 v-if="lesson.completed" class="w-4 h-4" />
                  <Play v-else-if="index === 0 || lessons[index - 1]?.completed" class="w-4 h-4" />
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
                  <span class="summary-stat__number">{{ lessons.length - completedLessons }}</span>
                  <span class="summary-stat__label">Pendientes</span>
                </div>
                <div class="summary-stat">
                  <span class="summary-stat__number">{{ currentModule.pointsEarned || 0 }}</span>
                  <span class="summary-stat__label">Puntos</span>
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
                  <button v-if="currentLesson.completed" class="btn btn--success btn--small">
                    <CheckCircle2 class="w-4 h-4 mr-1" />
                    Completada
                  </button>
                  <button v-else-if="currentLesson.type !== 'Quiz'" class="btn btn--primary btn--small"
                    @click="completeLesson" :disabled="isCompletingLesson">
                    <div v-if="isCompletingLesson" class="mini-spinner"></div>
                    {{ isCompletingLesson ? 'Guardando...' : 'Marcar como Completada' }}
                  </button>
                </div>
              </div>

              <!-- Contenido de la lección -->
              <div class="lesson-body">
                <!-- Lección Teórica -->
                <div v-if="currentLesson.type === 'Teoría'" class="theory-content">
                  <div v-html="currentLesson.content"></div>
                </div>

                <!-- Ejercicio Práctico -->
                <div v-else-if="currentLesson.type === 'Práctica'" class="practice-content">
                  <div class="practice-instructions">
                    <h3 class="practice-instructions__title">🎯 Objetivo</h3>
                    <p class="practice-instructions__text">{{ currentLesson.objective }}</p>
                  </div>

                  <!-- Simulador de terminal sencillo -->
                  <div class="terminal-simulator">
                    <div class="terminal-header">
                      <div class="terminal-dots">
                        <span class="dot dot--red"></span>
                        <span class="dot dot--yellow"></span>
                        <span class="dot dot--green"></span>
                      </div>
                      <span class="terminal-title">Terminal</span>
                    </div>
                    <div class="terminal-body">
                      <div v-for="(step, index) in currentLesson.steps" :key="index" class="terminal-step">
                        <div class="step-instruction">
                          <span class="step-number">{{ index + 1 }}</span>
                          <span class="step-text">{{ step.instruction }}</span>
                        </div>
                        <div class="step-command">
                          <span class="prompt">$</span>
                          <code class="command">{{ step.command }}</code>
                          <button @click="copyCode(step.command)" class="copy-mini">
                            <Copy class="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Quiz ARREGLADO -->
                <div v-else-if="currentLesson.type === 'Quiz'" class="quiz-content">
                  <div class="quiz-progress">
                    <span class="quiz-progress__text">
                      Pregunta {{ currentQuestionIndex + 1 }} de {{ currentLesson.questions.length }}
                    </span>
                    <div class="quiz-progress__bar">
                      <div class="quiz-progress__fill"
                        :style="{ width: `${((currentQuestionIndex + 1) / currentLesson.questions.length) * 100}%` }">
                      </div>
                    </div>
                  </div>

                  <div v-if="currentQuestion" class="question-container">
                    <h3 class="question-title">{{ currentQuestion.question }}</h3>
                    <div class="question-options">
                      <button v-for="(option, index) in currentQuestion.options" :key="index" class="option-button"
                        :class="{
                          'option-button--selected': selectedAnswer === index,
                          'option-button--correct': showCorrectAnswer && index === currentQuestion.correct,
                          'option-button--incorrect': showCorrectAnswer && selectedAnswer === index && index !== currentQuestion.correct
                        }" @click="selectAnswer(index)" :disabled="showCorrectAnswer">
                        <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                        <span class="option-text">{{ option }}</span>
                      </button>
                    </div>

                    <div v-if="showCorrectAnswer" class="question-feedback">
                      <div class="feedback-message" :class="{ 'feedback-message--correct': isCorrectAnswer }">
                        <CheckCircle2 v-if="isCorrectAnswer" class="w-5 h-5" />
                        <XCircle v-else class="w-5 h-5" />
                        <span>
                          {{ isCorrectAnswer ? '¡Correcto!' : 'Incorrecto.' }}
                          {{ currentQuestion.explanation }}
                        </span>
                      </div>
                      <button class="btn btn--primary" @click="nextQuestion">
                        {{ currentQuestionIndex < currentLesson.questions.length - 1 ? 'Siguiente Pregunta'
                          : 'Finalizar Quiz' }} </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navegación de lecciones -->
              <div class="lesson-navigation">
                <button v-if="currentLessonIndex > 0" class="btn btn--secondary" @click="previousLesson">
                  <ArrowLeft class="w-4 h-4 mr-2" />
                  Anterior
                </button>
                <div class="lesson-navigation__spacer"></div>
                <button v-if="currentLessonIndex < lessons.length - 1" class="btn btn--primary" @click="nextLesson"
                  :disabled="!currentLesson.completed">
                  Siguiente
                  <ArrowRight class="w-4 h-4 ml-2" />
                </button>
                <button v-else-if="allLessonsCompleted" class="btn btn--success" @click="completeModule">
                  <Trophy class="w-4 h-4 mr-2" />
                  Completar Módulo
                </button>
              </div>
            </div>

            <!-- Estado vacío -->
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

    <!-- Error state -->
    <div v-else-if="!isLoading" class="error-state">
      <div class="container">
        <div class="error-content">
          <AlertCircle class="w-16 h-16 text-danger" />
          <h2 class="error-title">Módulo no encontrado</h2>
          <p class="error-text">El módulo que buscas no existe o no tienes acceso a él.</p>
          <router-link to="/dashboard" class="btn btn--primary">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Volver al Dashboard
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import {
  ArrowLeft, ChevronRight, Clock, Target, BookOpen, CheckCircle2,
  Play, Lock, Copy, ArrowRight, Trophy, XCircle, FileText,
  GitBranch, Database, Share2, Zap, Book, Star, AlertCircle
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

// Datos reales de los stores
const { user, isAuthenticated } = storeToRefs(authStore)
const { modulesStats } = storeToRefs(userStore)

// Estado reactivo
const isLoading = ref(true)
const currentLessonIndex = ref(0)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const showCorrectAnswer = ref(false)
const isCompletingLesson = ref(false)

// 📚 DEFINICIONES DE MÓDULOS SIMPLIFICADAS
const moduleDefinitions = {
  'module-0': {
    title: 'Fundamentos',
    description: 'Conceptos básicos de Git y control de versiones',
    difficulty: 'Principiante',
    estimatedTime: '45 min',
    color: '#58a6ff',
    icon: FileText,
    lessons: [
      {
        id: 'lesson-0-1',
        title: '¿Qué es el Control de Versiones?',
        description: 'Introducción al concepto de control de versiones',
        type: 'Teoría',
        duration: '10 min',
        points: 50,
        completed: false,
        content: `
          <div class="content-section">
            <h3>Definición</h3>
            <p>El <strong>control de versiones</strong> es un sistema que registra los cambios realizados en un archivo o conjunto de archivos a lo largo del tiempo, de modo que puedas recuperar versiones específicas más adelante.</p>

            <p>Imagina que estás escribiendo un ensayo. Sin control de versiones, podrías tener archivos como:</p>
            <ul>
              <li>ensayo.docx</li>
              <li>ensayo_final.docx</li>
              <li>ensayo_final_REAL.docx</li>
              <li>ensayo_final_REAL_v2.docx</li>
            </ul>
            <p>Con Git, tienes un solo archivo y un historial completo de todos los cambios.</p>

            <h3>Beneficios del Control de Versiones</h3>
            <ul>
              <li><strong>Historial completo:</strong> Puedes ver qué cambios se hicieron, cuándo y por quién</li>
              <li><strong>Backup automático:</strong> Nunca pierdes trabajo</li>
              <li><strong>Colaboración:</strong> Múltiples personas pueden trabajar en el mismo proyecto</li>
              <li><strong>Experimentación segura:</strong> Puedes probar ideas sin miedo a romper nada</li>
            </ul>
          </div>
        `
      },
      {
        id: 'lesson-0-2',
        title: 'Git vs GitHub',
        description: 'Diferencias entre Git y GitHub',
        type: 'Teoría',
        duration: '10 min',
        points: 50,
        completed: false,
        content: `
          <div class="content-section">
            <h3>Git vs GitHub</h3>
            <p>Es muy común confundir estos dos términos, pero son cosas diferentes:</p>

            <h4>🔧 Git</h4>
            <ul>
              <li>Es el <strong>sistema de control de versiones</strong></li>
              <li>Funciona en tu computadora (local)</li>
              <li>Es una herramienta de línea de comandos</li>
              <li>Es gratuito y open source</li>
            </ul>

            <h4>🌐 GitHub</h4>
            <ul>
              <li>Es una <strong>plataforma web</strong> que usa Git</li>
              <li>Almacena tus repositorios en la nube</li>
              <li>Añade características sociales (issues, pull requests, etc.)</li>
              <li>Tiene planes gratuitos y de pago</li>
            </ul>

            <div class="code-example">
              <div class="code-example__header">
                <span class="code-example__title">Ejemplo</span>
              </div>
              <pre class="code-example__body"><code># Git (local)
git init
git add .
git commit -m "Mi primer commit"

# GitHub (remoto)
git push origin main</code></pre>
            </div>
          </div>
        `
      },
      {
        id: 'lesson-0-3',
        title: 'Quiz: Conceptos Básicos',
        description: 'Evalúa tu comprensión de los conceptos fundamentales',
        type: 'Quiz',
        duration: '5 min',
        points: 100,
        completed: false,
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
          },
          {
            question: '¿Cuál es la principal diferencia entre Git y GitHub?',
            options: [
              'Son lo mismo',
              'Git es local, GitHub es una plataforma web',
              'GitHub es más moderno que Git',
              'Git solo funciona en Windows'
            ],
            correct: 1,
            explanation: 'Git es la herramienta de control de versiones, GitHub es la plataforma web que lo utiliza.'
          }
        ]
      }
    ]
  },
  'module-1': {
    title: 'Tu Primer Repositorio',
    description: 'Aprende a crear tu primer repositorio y hacer commits',
    difficulty: 'Principiante',
    estimatedTime: '60 min',
    color: '#39d353',
    icon: Database,
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Instalación y Configuración',
        description: 'Configura Git en tu sistema',
        type: 'Práctica',
        duration: '15 min',
        points: 75,
        completed: false,
        objective: 'Instalar Git y configurar tu identidad global',
        steps: [
          {
            instruction: "Verifica si Git está instalado",
            command: "git --version"
          },
          {
            instruction: "Configura tu nombre globalmente",
            command: "git config --global user.name \"Tu Nombre\""
          },
          {
            instruction: "Configura tu email",
            command: "git config --global user.email \"tu@email.com\""
          }
        ]
      },
      {
        id: 'lesson-1-2',
        title: 'Primer Repositorio',
        description: 'Crea tu primer repositorio con Git',
        type: 'Práctica',
        duration: '20 min',
        points: 100,
        completed: false,
        objective: 'Inicializa un repositorio Git y realiza tu primer commit',
        steps: [
          {
            instruction: "Inicializa un repositorio Git",
            command: "git init"
          },
          {
            instruction: "Verifica el estado del repositorio",
            command: "git status"
          },
          {
            instruction: "Añade archivos al staging",
            command: "git add ."
          },
          {
            instruction: "Realiza tu primer commit",
            command: "git commit -m \"Initial commit\""
          }
        ]
      }
    ]
  }
}

// Computed properties
const currentModule = computed(() => {
  const moduleId = route.params.moduleId
  const moduleStats = modulesStats.value.find(m => m.id === moduleId)
  const moduleDefinition = moduleDefinitions[moduleId]

  if (!moduleStats || !moduleDefinition) return null

  return {
    ...moduleDefinition,
    ...moduleStats
  }
})

const lessons = computed(() => {
  if (!currentModule.value) return []
  return currentModule.value.lessons || []
})

const currentLesson = computed(() => {
  return lessons.value[currentLessonIndex.value]
})

const currentQuestion = computed(() => {
  if (!currentLesson.value?.questions) return null
  return currentLesson.value.questions[currentQuestionIndex.value]
})

const isCorrectAnswer = computed(() => {
  return selectedAnswer.value === currentQuestion.value?.correct
})

const completedLessons = computed(() => {
  return lessons.value.filter(lesson => lesson.completed).length
})

const allLessonsCompleted = computed(() => {
  return lessons.value.every(lesson => lesson.completed)
})

// Métodos
const selectLesson = (index) => {
  // Solo permite seleccionar si es la primera lección o la anterior está completada
  if (index === 0 || lessons.value[index - 1]?.completed) {
    currentLessonIndex.value = index
    resetQuizState()
  }
}

const completeLesson = async () => {
  if (!currentLesson.value || !user.value || isCompletingLesson.value) return

  try {
    isCompletingLesson.value = true

    // Marcar como completada localmente
    currentLesson.value.completed = true

    // Completar lección en Supabase (si existe el método)
    if (authStore.completeLesson) {
      await authStore.completeLesson(
        currentModule.value.id,
        currentLesson.value.id,
        currentLesson.value.title,
        currentLesson.value.points
      )
    }

    // Mostrar notificación
    if (window.addToast) {
      window.addToast(
        `¡Lección completada! +${currentLesson.value.points} puntos`,
        'success',
        3000
      )
    }

    // Auto-avanzar a la siguiente lección
    setTimeout(() => {
      if (currentLessonIndex.value < lessons.value.length - 1) {
        nextLesson()
      }
    }, 1500)

  } catch (error) {
    console.error('Error completando lección:', error)
  } finally {
    isCompletingLesson.value = false
  }
}

const nextLesson = () => {
  if (currentLessonIndex.value < lessons.value.length - 1) {
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

const completeModule = async () => {
  // Completar módulo y dar achievement
  if (authStore.awardAchievement) {
    await authStore.awardAchievement(
      `module_${currentModule.value.id}_complete`,
      `Módulo Completado: ${currentModule.value.title}`,
      `Has completado exitosamente el módulo ${currentModule.value.title}`,
      '🎓',
      200
    )
  }

  router.push('/dashboard')
}

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    if (window.addToast) {
      window.addToast('Código copiado al portapapeles', 'success', 2000)
    }
  } catch (err) {
    console.error('Error copying code:', err)
  }
}

// Quiz methods - ARREGLADOS
const selectAnswer = (index) => {
  if (showCorrectAnswer.value) return
  selectedAnswer.value = index
  showCorrectAnswer.value = true
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < currentLesson.value.questions.length - 1) {
    // Siguiente pregunta
    currentQuestionIndex.value++
    resetQuizState()
  } else {
    // Quiz completado
    currentLesson.value.completed = true
    completeLesson()
  }
}

const resetQuizState = () => {
  selectedAnswer.value = null
  showCorrectAnswer.value = false
  currentQuestionIndex.value = 0
}

// Lifecycle
onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  try {
    isLoading.value = true

    // Verificar que el módulo existe
    if (!currentModule.value) {
      router.push('/dashboard')
      return
    }

    // Seleccionar primera lección no completada
    const firstIncomplete = lessons.value.findIndex(lesson => !lesson.completed)
    if (firstIncomplete !== -1) {
      currentLessonIndex.value = firstIncomplete
    }

  } catch (error) {
    console.error('Error cargando módulo:', error)
  } finally {
    isLoading.value = false
  }
})

// Watcher para cambios de módulo
watch(() => route.params.moduleId, () => {
  currentLessonIndex.value = 0
  resetQuizState()
})
</script>

<style lang="scss" scoped>
// Estados de carga y error
.loading-container,
.error-state {
  @include flex-center;
  flex-direction: column;
  min-height: 100vh;
  text-align: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner,
.mini-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid $border;
  border-top: 2px solid $accent-blue;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.mini-spinner {
  width: 1rem;
  height: 1rem;
  border-width: 1px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-content {
  @include flex-center;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $text-primary;
}

.error-text {
  color: $text-secondary;
  text-align: center;
}

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
  grid-template-columns: 320px 1fr;
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

  &__content {
    flex: 1;
    min-width: 0;
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
.theory-content {
  .content-section {
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 1rem;
    }

    h4 {
      color: $text-primary;
      font-weight: 600;
      margin: 1.5rem 0 0.5rem 0;
    }

    p {
      color: $text-secondary;
      line-height: 1.7;
      margin-bottom: 1rem;
    }

    ul,
    ol {
      margin: 1rem 0;
      padding-left: 1.5rem;

      li {
        color: $text-secondary;
        margin-bottom: 0.5rem;
        line-height: 1.6;
      }
    }

    strong {
      color: $text-primary;
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

      &__body {
        padding: 1rem;
        background: $primary-dark;
        font-family: $font-mono;
        font-size: 0.875rem;
        color: $text-primary;
        overflow-x: auto;
        white-space: pre;
      }
    }
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

// Terminal simulator
.terminal-simulator {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid $border;
  background: $primary-dark;
}

.terminal-header {
  @include flex-between;
  padding: 0.75rem 1rem;
  background: #2d3748;
  border-bottom: 1px solid $border;
}

.terminal-dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;

  &--red {
    background: #ff5f56;
  }

  &--yellow {
    background: #ffbd2e;
  }

  &--green {
    background: #27ca3f;
  }
}

.terminal-title {
  font-size: 0.875rem;
  color: $text-secondary;
}

.terminal-body {
  padding: 1rem;
}

.terminal-step {
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.step-instruction {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.step-number {
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

.step-text {
  color: $text-secondary;
}

.step-command {
  @include flex-center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: $secondary-dark;
  border-radius: 0.25rem;
  font-family: $font-mono;
  justify-content: flex-start;
}

.prompt {
  color: $accent-green;
  font-weight: 600;
}

.command {
  color: $text-primary;
  flex: 1;
}

.copy-mini {
  @include flex-center;
  padding: 0.25rem;
  background: none;
  border: none;
  color: $text-muted;
  cursor: pointer;
  border-radius: 0.25rem;
  @include transition();

  &:hover {
    background: $border;
    color: $accent-blue;
  }
}

// Quiz content - MEJORADO
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

// Responsive
@include mobile-only {
  .module-layout {
    .lessons-sidebar {
      order: 1;
    }

    .lesson-content {
      order: 2;
    }
  }
}
</style>

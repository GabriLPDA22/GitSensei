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
                    {{ currentModule.totalLessons || currentModule.total_lessons || lessons.length }} lecciones
                  </span>
                  <span class="meta-item">
                    <Star class="w-4 h-4" />
                    {{ currentModule.pointsEarned || currentModule.points_earned || 0 }} puntos
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
                    :stroke-dasharray="`${(currentModule.progress || currentModule.progress_percentage || 0) * 2.83} 283`" />
                </svg>
                <div class="progress-circle__content">
                  <span class="progress-circle__percentage">{{ currentModule.progress || currentModule.progress_percentage || 0 }}%</span>
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
                  <span class="summary-stat__number">{{ currentModule.completedLessons || currentModule.completed_lessons || completedLessons }}</span>
                  <span class="summary-stat__label">Completadas</span>
                </div>
                <div class="summary-stat">
                  <span class="summary-stat__number">{{ lessons.length - (currentModule.completedLessons || currentModule.completed_lessons || completedLessons) }}</span>
                  <span class="summary-stat__label">Pendientes</span>
                </div>
                <div class="summary-stat">
                  <span class="summary-stat__number">{{ currentModule.pointsEarned || currentModule.points_earned || 0 }}</span>
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
import { storeToRefs } from 'pinia'
import {
  ArrowLeft, ChevronRight, Clock, Target, BookOpen, CheckCircle2,
  Play, Lock, Copy, ArrowRight, Trophy, XCircle, FileText,
  GitBranch, Database, Share2, Zap, Book, Star, AlertCircle
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 🔧 ARREGLADO: Manejo seguro de stores
const { user, isAuthenticated, userProgress } = storeToRefs(authStore)

// Estado reactivo
const isLoading = ref(true)
const currentLessonIndex = ref(0)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const showCorrectAnswer = ref(false)
const isCompletingLesson = ref(false)

// 🆕 PERSISTENCIA DE ESTADO (para arreglar problema de F5)
const getStorageKey = (suffix) => {
  return `module_${route.params.moduleId}_${suffix}`
}

const saveState = () => {
  try {
    localStorage.setItem(getStorageKey('lessonIndex'), currentLessonIndex.value.toString())
    localStorage.setItem(getStorageKey('questionIndex'), currentQuestionIndex.value.toString())
  } catch (error) {
    console.warn('Error guardando estado:', error)
  }
}

const loadState = () => {
  try {
    const savedLessonIndex = localStorage.getItem(getStorageKey('lessonIndex'))
    const savedQuestionIndex = localStorage.getItem(getStorageKey('questionIndex'))

    if (savedLessonIndex !== null) {
      const lessonIndex = parseInt(savedLessonIndex)
      if (lessonIndex >= 0 && lessonIndex < lessons.value.length) {
        if (lessonIndex === 0 || lessons.value[lessonIndex - 1]?.completed) {
          currentLessonIndex.value = lessonIndex
        }
      }
    }

    if (savedQuestionIndex !== null) {
      const questionIndex = parseInt(savedQuestionIndex)
      if (questionIndex >= 0) {
        currentQuestionIndex.value = questionIndex
      }
    }
  } catch (error) {
    console.warn('Error cargando estado:', error)
  }
}

const clearState = () => {
  try {
    localStorage.removeItem(getStorageKey('lessonIndex'))
    localStorage.removeItem(getStorageKey('questionIndex'))
  } catch (error) {
    console.warn('Error limpiando estado:', error)
  }
}

// 🆕 DEPURACIÓN: Función para ver exactamente qué datos tenemos
const debugModuleData = () => {
  console.log('🔍 DEPURACIÓN DE DATOS:')
  console.log('📊 userProgress.value:', userProgress.value)
  console.log('📊 modulesStats.value:', modulesStats.value)

  // 🆕 Mostrar estructura de un módulo de ejemplo
  if (modulesStats.value && modulesStats.value.length > 0) {
    console.log('📊 Ejemplo de módulo desde Supabase:', modulesStats.value[0])
    console.log('📊 Campos disponibles:', Object.keys(modulesStats.value[0]))
  }

  console.log('📊 currentModule.value:', currentModule.value)
  console.log('📊 lessons.value:', lessons.value?.map(l => ({ title: l.title, completed: l.completed })))
}

// 🔧 ARREGLADO: Cargar datos reales desde Supabase
const modulesStats = computed(() => {
  // Si hay datos de userProgress en authStore, usarlos
  if (userProgress.value?.modules) {
    console.log('✅ Usando datos de userProgress:', userProgress.value.modules)
    return userProgress.value.modules
  }

  // 🆕 DEPURACIÓN: Verificar si hay datos en otra estructura
  if (userProgress.value) {
    console.log('⚠️ userProgress existe pero no tiene modules:', userProgress.value)
  }

  // Fallback temporal mientras se cargan los datos
  console.log('⚠️ No hay datos de módulos, usando fallback vacío')
  return []
})

// 🆕 MEJORADO: Cargar progreso real desde Supabase
const loadModuleData = async (moduleId) => {
  try {
    if (!user.value?.id) {
      console.log('⚠️ No hay usuario para cargar datos')
      return null
    }

    // Verificar si existe el método loadUserProgress
    if (authStore.loadUserProgress && typeof authStore.loadUserProgress === 'function') {
      console.log('📊 Cargando progreso desde Supabase...')
      await authStore.loadUserProgress()
      console.log('✅ Progreso cargado desde Supabase')

      return modulesStats.value.find(m => m.module_id === moduleId)
    } else {
      console.warn('⚠️ authStore.loadUserProgress no está disponible')
      console.log('💡 Funcionando con datos locales por ahora')
      return null
    }
  } catch (error) {
    console.error('💥 Error cargando datos del módulo:', error)
    return null
  }
}

// 📚 DEFINICIONES DE MÓDULOS COMPLETAS
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
          },
          {
            instruction: "Verifica tu configuración",
            command: "git config --list"
          }
        ]
      },
      {
        id: 'lesson-1-2',
        title: 'Crear tu Primer Repositorio',
        description: 'Inicializa tu primer repositorio Git',
        type: 'Práctica',
        duration: '20 min',
        points: 100,
        completed: false,
        objective: 'Crear un directorio, inicializar Git y hacer tu primer commit',
        steps: [
          {
            instruction: "Crea un directorio para tu proyecto",
            command: "mkdir mi-primer-repo && cd mi-primer-repo"
          },
          {
            instruction: "Inicializa un repositorio Git",
            command: "git init"
          },
          {
            instruction: "Crea un archivo README",
            command: "echo '# Mi Primer Repositorio' > README.md"
          },
          {
            instruction: "Verifica el estado del repositorio",
            command: "git status"
          },
          {
            instruction: "Añade el archivo al staging area",
            command: "git add README.md"
          },
          {
            instruction: "Realiza tu primer commit",
            command: "git commit -m \"Primer commit: añadir README\""
          }
        ]
      },
      {
        id: 'lesson-1-3',
        title: 'Entendiendo el Flujo de Git',
        description: 'Aprende las tres áreas de Git: Working Directory, Staging Area y Repository',
        type: 'Teoría',
        duration: '15 min',
        points: 75,
        completed: false,
        content: `
          <div class="content-section">
            <h3>Las Tres Áreas de Git</h3>
            <p>Git tiene tres áreas principales donde pueden estar tus archivos:</p>

            <h4>1. 🗂️ Working Directory (Directorio de Trabajo)</h4>
            <ul>
              <li>Es donde trabajas con tus archivos</li>
              <li>Los cambios aquí no están siendo rastreados por Git</li>
              <li>Cuando modificas un archivo, está en el working directory</li>
            </ul>

            <h4>2. 📋 Staging Area (Área de Preparación)</h4>
            <ul>
              <li>Es como una "lista de compras" de cambios</li>
              <li>Preparas los cambios que quieres incluir en el próximo commit</li>
              <li>Usas <code>git add</code> para mover archivos aquí</li>
            </ul>

            <h4>3. 📦 Repository (Repositorio)</h4>
            <ul>
              <li>Es donde Git guarda permanentemente tus cambios</li>
              <li>Cada commit crea una "fotografía" de tu proyecto</li>
              <li>Usas <code>git commit</code> para guardar cambios aquí</li>
            </ul>

            <div class="code-example">
              <div class="code-example__header">
                <span class="code-example__title">Flujo típico</span>
              </div>
              <pre class="code-example__body"><code># 1. Modificas archivos (Working Directory)
echo "Nuevo contenido" >> archivo.txt

# 2. Preparas los cambios (Staging Area)
git add archivo.txt

# 3. Confirmas los cambios (Repository)
git commit -m "Actualizar archivo.txt"</code></pre>
            </div>
          </div>
        `
      },
      {
        id: 'lesson-1-4',
        title: 'Trabajando con Archivos',
        description: 'Practica añadir, modificar y confirmar cambios',
        type: 'Práctica',
        duration: '25 min',
        points: 125,
        completed: false,
        objective: 'Crear múltiples archivos, hacer cambios y practicar el flujo de Git',
        steps: [
          {
            instruction: "Crea un archivo de código",
            command: "echo 'console.log(\"¡Hola mundo!\");' > app.js"
          },
          {
            instruction: "Crea un archivo de configuración",
            command: "echo '{\"name\": \"mi-proyecto\", \"version\": \"1.0.0\"}' > package.json"
          },
          {
            instruction: "Verifica qué archivos están sin rastrear",
            command: "git status"
          },
          {
            instruction: "Añade todos los archivos nuevos",
            command: "git add ."
          },
          {
            instruction: "Confirma los nuevos archivos",
            command: "git commit -m \"Añadir app.js y package.json\""
          },
          {
            instruction: "Modifica el archivo README",
            command: "echo '\\n## Descripción\\nEste es mi primer proyecto con Git' >> README.md"
          },
          {
            instruction: "Ve las diferencias de lo que cambió",
            command: "git diff"
          },
          {
            instruction: "Añade y confirma los cambios",
            command: "git add README.md && git commit -m \"Actualizar README con descripción\""
          }
        ]
      },
      {
        id: 'lesson-1-5',
        title: 'Quiz: Tu Primer Repositorio',
        description: 'Evalúa lo aprendido sobre repositorios y commits',
        type: 'Quiz',
        duration: '10 min',
        points: 150,
        completed: false,
        questions: [
          {
            question: '¿Qué comando usas para inicializar un repositorio Git?',
            options: [
              'git start',
              'git init',
              'git create',
              'git new'
            ],
            correct: 1,
            explanation: 'git init inicializa un nuevo repositorio Git en el directorio actual.'
          },
          {
            question: '¿En qué área están los archivos después de usar "git add"?',
            options: [
              'Working Directory',
              'Repository',
              'Staging Area',
              'Remote Repository'
            ],
            correct: 2,
            explanation: 'Después de git add, los archivos están en el Staging Area, listos para el próximo commit.'
          },
          {
            question: '¿Cuál es la diferencia entre "git add ." y "git add archivo.txt"?',
            options: [
              'No hay diferencia',
              'git add . añade todos los archivos, git add archivo.txt solo uno específico',
              'git add . es más lento',
              'git add archivo.txt no funciona'
            ],
            correct: 1,
            explanation: 'git add . añade todos los archivos modificados al staging area, mientras que git add archivo.txt solo añade ese archivo específico.'
          },
          {
            question: '¿Qué hace el comando "git status"?',
            options: [
              'Crea un nuevo commit',
              'Muestra el estado actual del repositorio',
              'Elimina archivos',
              'Configura Git'
            ],
            correct: 1,
            explanation: 'git status muestra el estado actual del repositorio, incluyendo archivos modificados, en staging area y sin rastrear.'
          }
        ]
      }
    ]
  },
  'module-2': {
    title: 'El Arte de Ramificar',
    description: 'Domina branches, merge y el trabajo colaborativo',
    difficulty: 'Intermedio',
    estimatedTime: '90 min',
    color: '#a5a5ff',
    icon: GitBranch,
    lessons: [
      {
        id: 'lesson-2-1',
        title: '¿Qué son las Ramas?',
        description: 'Introducción al concepto de branching',
        type: 'Teoría',
        duration: '15 min',
        points: 75,
        completed: false,
        content: `
          <div class="content-section">
            <h3>¿Qué son las Ramas (Branches)?</h3>
            <p>Las ramas en Git son como <strong>líneas de tiempo paralelas</strong> de tu proyecto. Te permiten trabajar en diferentes características sin afectar el código principal.</p>
            <p>Cada repositorio Git tiene una rama principal llamada <code>main</code> (o <code>master</code> en repositorios más antiguos).</p>
            <h4>¿Por qué usar ramas?</h4>
            <ul>
              <li><strong>Experimentación segura:</strong> Prueba ideas sin romper el código principal</li>
              <li><strong>Colaboración:</strong> Cada desarrollador puede trabajar en su propia rama</li>
              <li><strong>Organización:</strong> Separa diferentes características del proyecto</li>
              <li><strong>Historial limpio:</strong> Mantén un historial de commits organizado</li>
            </ul>
          </div>
        `
      }
    ]
  },
  'module-3': {
    title: 'Colaboración y Remotos',
    description: 'Trabaja en equipo con Git y GitHub',
    difficulty: 'Intermedio',
    estimatedTime: '75 min',
    color: '#c4b5fd',
    icon: Share2,
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Entendiendo los Remotos',
        description: 'Qué son los repositorios remotos y por qué los necesitas',
        type: 'Teoría',
        duration: '15 min',
        points: 75,
        completed: false,
        content: `
          <div class="content-section">
            <h3>Repositorios Remotos</h3>
            <p>Un <strong>repositorio remoto</strong> es una versión de tu proyecto que está hospedada en internet o en otra red.</p>
            <p>GitHub, GitLab y Bitbucket son ejemplos de servicios que hospedan repositorios remotos.</p>
            <h4>¿Por qué usar remotos?</h4>
            <ul>
              <li><strong>Backup:</strong> Tu código está seguro en la nube</li>
              <li><strong>Colaboración:</strong> Otros pueden contribuir a tu proyecto</li>
              <li><strong>Sincronización:</strong> Trabaja desde múltiples computadoras</li>
              <li><strong>Distribución:</strong> Comparte tu código con el mundo</li>
            </ul>
          </div>
        `
      }
    ]
  },
  'module-4': {
    title: 'La Forja',
    description: 'Técnicas avanzadas y herramientas especializadas',
    difficulty: 'Avanzado',
    estimatedTime: '120 min',
    color: '#fbbf24',
    icon: Zap,
    lessons: [
      {
        id: 'lesson-4-1',
        title: 'Técnicas Avanzadas',
        description: 'Herramientas avanzadas de Git',
        type: 'Teoría',
        duration: '20 min',
        points: 100,
        completed: false,
        content: `
          <div class="content-section">
            <h3>Técnicas Avanzadas de Git</h3>
            <p>Una vez que domines lo básico, Git tiene herramientas poderosas para situaciones más complejas.</p>
            <p>Este módulo cubre técnicas como rebase, cherry-pick, stash y resolución de conflictos.</p>
          </div>
        `
      }
    ]
  },
  'module-5': {
    title: 'Biblioteca de Comandos',
    description: 'Referencia completa de comandos Git',
    difficulty: 'Referencia',
    estimatedTime: '30 min',
    color: '#34d399',
    icon: Book,
    lessons: [
      {
        id: 'lesson-5-1',
        title: 'Guía de Referencia Rápida',
        description: 'Los comandos más importantes de Git',
        type: 'Teoría',
        duration: '30 min',
        points: 50,
        completed: false,
        content: `
          <div class="content-section">
            <h3>Comandos Esenciales de Git</h3>
            <p>Una referencia rápida de los comandos más utilizados en Git.</p>
            <div class="code-example">
              <div class="code-example__header">
                <span class="code-example__title">Comandos básicos</span>
              </div>
              <pre class="code-example__body"><code># Configuración
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Repositorio
git init
git clone url-del-repositorio

# Cambios
git status
git add .
git commit -m "Mensaje"
git push
git pull</code></pre>
            </div>
          </div>
        `
      }
    ]
  }
}

// 🔧 CORREGIDO: Sincronización real con datos de Supabase
const currentModule = computed(() => {
  const moduleId = route.params.moduleId
  const moduleDefinition = moduleDefinitions[moduleId]

  if (!moduleDefinition) {
    console.error('Definición de módulo no encontrada:', moduleId)
    return null
  }

  // Buscar datos reales de Supabase
  const moduleData = modulesStats.value?.find(m => m.module_id === moduleId)
  console.log('📊 Datos de Supabase para', moduleId, ':', moduleData)

  // Combinar definición local con datos de Supabase
  let combinedModule = {
    id: moduleId,
    ...moduleDefinition,
    // Sobrescribir con datos reales de Supabase si existen
    ...(moduleData || {}),
    // Asegurar que las lecciones vengan de la definición local
    lessons: [...(moduleDefinition.lessons || [])]
  }

  // 🆕 CORREGIDO: Sincronizar lecciones completadas con Supabase
  if (moduleData && combinedModule.lessons.length > 0) {
    // Usar los campos correctos de Supabase
    const completedLessonsCount = moduleData.completed_lessons || 0
    const progressPercentage = moduleData.progress_percentage || 0
    const pointsEarned = moduleData.points_earned || 0

    console.log('✅ Sincronizando lecciones:', {
      completedCount: completedLessonsCount,
      progress: progressPercentage,
      points: pointsEarned,
      totalLessons: combinedModule.lessons.length
    })

    // Marcar lecciones como completadas basándose en completed_lessons
    combinedModule.lessons = combinedModule.lessons.map((lesson, index) => ({
      ...lesson,
      completed: index < completedLessonsCount
    }))

    // Actualizar progress y otros datos con campos de Supabase
    combinedModule.progress = progressPercentage
    combinedModule.completedLessons = completedLessonsCount
    combinedModule.pointsEarned = pointsEarned
    combinedModule.isCompleted = progressPercentage >= 100
  }

  console.log('🎯 Módulo sincronizado:', {
    id: combinedModule.id,
    progress: combinedModule.progress,
    completedLessons: combinedModule.completedLessons,
    lessons: combinedModule.lessons.map(l => ({ title: l.title, completed: l.completed }))
  })

  return combinedModule
})

const lessons = computed(() => {
  if (!currentModule.value) {
    console.log('No current module available')
    return []
  }

  const lessonsList = currentModule.value.lessons || []
  console.log('Available lessons:', lessonsList.length)
  return lessonsList
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
  if (index === 0 || lessons.value[index - 1]?.completed) {
    currentLessonIndex.value = index
    resetQuizQuestion()
    saveState()
  }
}

const completeLesson = async () => {
  if (!currentLesson.value || !user.value || isCompletingLesson.value) return

  try {
    isCompletingLesson.value = true

    // Marcar como completada localmente
    currentLesson.value.completed = true

    // 🔧 MEJORADO: Verificar que existe el método antes de usarlo
    if (authStore.completeLesson && typeof authStore.completeLesson === 'function') {
      console.log('💾 Guardando en Supabase...')
      await authStore.completeLesson(
        currentModule.value.id,
        currentLesson.value.id,
        currentLesson.value.title,
        currentLesson.value.points
      )
      console.log('✅ Guardado en Supabase')
    } else {
      console.warn('⚠️ authStore.completeLesson no está disponible')
    }

    // Mostrar notificación
    if (typeof window !== 'undefined' && window.addToast) {
      window.addToast(
        `¡Lección completada! +${currentLesson.value.points} puntos`,
        'success',
        3000
      )
    }

    // Limpiar estado del localStorage
    clearState()

    // Auto-avanzar a la siguiente lección
    setTimeout(() => {
      if (currentLessonIndex.value < lessons.value.length - 1) {
        nextLesson()
      }
    }, 1500)

  } catch (error) {
    console.error('💥 Error completando lección:', error)
    // Revertir cambio local si hay error
    currentLesson.value.completed = false
  } finally {
    isCompletingLesson.value = false
  }
}

const nextLesson = () => {
  if (currentLessonIndex.value < lessons.value.length - 1) {
    currentLessonIndex.value++
    resetQuizQuestion()
    saveState()
  }
}

const previousLesson = () => {
  if (currentLessonIndex.value > 0) {
    currentLessonIndex.value--
    resetQuizQuestion()
    saveState()
  }
}

const completeModule = async () => {
  if (authStore.awardAchievement) {
    await authStore.awardAchievement(
      `module_${currentModule.value.id}_complete`,
      `Módulo Completado: ${currentModule.value.title}`,
      `Has completado exitosamente el módulo ${currentModule.value.title}`,
      '🎓',
      200
    )
  }

  clearState()
  router.push('/dashboard')
}

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    if (typeof window !== 'undefined' && window.addToast) {
      window.addToast('Código copiado al portapapeles', 'success', 2000)
    }
  } catch (err) {
    console.error('Error copying code:', err)
  }
}

// 🔧 Quiz methods - CORREGIDOS
const selectAnswer = (index) => {
  if (showCorrectAnswer.value) return
  selectedAnswer.value = index
  showCorrectAnswer.value = true
}

// 🆕 CORREGIDO: nextQuestion ya no resetea currentQuestionIndex incorrectamente
const nextQuestion = () => {
  if (currentQuestionIndex.value < currentLesson.value.questions.length - 1) {
    // Siguiente pregunta
    currentQuestionIndex.value++
    // Solo resetear respuesta, NO el índice de pregunta
    selectedAnswer.value = null
    showCorrectAnswer.value = false
    saveState()
  } else {
    // Quiz completado
    currentLesson.value.completed = true
    completeLesson()
  }
}

// 🔧 CORREGIDO: Solo para resetear respuestas, NO currentQuestionIndex
const resetQuizState = () => {
  selectedAnswer.value = null
  showCorrectAnswer.value = false
  // ❌ NO resetear currentQuestionIndex aquí
}

// 🆕 Método específico para resetear pregunta al cambiar lección
const resetQuizQuestion = () => {
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  showCorrectAnswer.value = false
}

// 🔧 MEJORADO: Lifecycle con carga de datos reales
onMounted(async () => {
  console.log('🚀 ModuleView iniciando...')

  if (!isAuthenticated.value) {
    console.log('❌ Usuario no autenticado')
    router.push('/login')
    return
  }

  try {
    isLoading.value = true

    // Verificar que el módulo existe en las definiciones
    const moduleId = route.params.moduleId
    if (!moduleDefinitions[moduleId]) {
      console.error('❌ Módulo no existe:', moduleId)
      router.push('/dashboard')
      return
    }

    // 🆕 DEPURACIÓN inicial
    console.log('🔍 Estado inicial:')
    debugModuleData()

    // 🆕 Cargar datos reales desde Supabase
    console.log('📊 Intentando cargar datos de Supabase...')
    await loadModuleData(moduleId)

    // 🆕 DEPURACIÓN después de cargar
    console.log('🔍 Estado después de cargar datos:')
    debugModuleData()

    // Esperar a que se actualicen los computed
    await new Promise(resolve => setTimeout(resolve, 200))

    // 🆕 DEPURACIÓN final
    console.log('🔍 Estado final:')
    debugModuleData()

    // 🆕 Cargar estado persistido (F5)
    loadState()

    // Seleccionar lección apropiada
    if (lessons.value.length > 0) {
      if (currentLessonIndex.value === 0) {
        // Buscar primera lección no completada
        const firstIncomplete = lessons.value.findIndex(lesson => !lesson.completed)
        if (firstIncomplete !== -1) {
          console.log('📚 Seleccionando primera lección no completada:', firstIncomplete)
          currentLessonIndex.value = firstIncomplete
        } else {
          console.log('🎉 Todas las lecciones están completadas!')
        }
      }
    }

    console.log('✅ ModuleView cargado correctamente')

  } catch (error) {
    console.error('💥 Error cargando módulo:', error)
  } finally {
    isLoading.value = false
  }
})

// 🔧 Watchers mejorados
watch(() => route.params.moduleId, () => {
  currentLessonIndex.value = 0
  resetQuizQuestion()
  clearState()
})

watch(currentLessonIndex, (newIndex, oldIndex) => {
  if (newIndex !== oldIndex) {
    resetQuizQuestion()
    saveState()
  }
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

  &__main {
    flex: 1;
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

  &__meta {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 1rem;
  }
}

.lesson-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid $border;
}

.lesson-completed {
  @include flex-center;
  gap: 0.5rem;
  color: $success;
  font-weight: 500;
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

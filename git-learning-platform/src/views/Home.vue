<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero__content">
          <div class="hero__text">
            <h1 class="hero__title">
              Domina <span class="gradient-text">Git & GitHub</span>
              <br>como un profesional
            </h1>
            <p class="hero__subtitle">
              La plataforma educativa más interactiva para aprender control de versiones.
              Simulador de terminal, ejercicios prácticos y un sistema de gamificación que te mantendrá motivado.
            </p>
            <div class="hero__actions">
              <button @click="startLearning" class="btn btn--primary btn--large">
                <Code class="w-5 h-5 mr-2" />
                Empezar Ahora
              </button>
              <button @click="viewDemo" class="btn btn--secondary btn--large">
                <Play class="w-5 h-5 mr-2" />
                Ver Demo
              </button>
            </div>
            <div class="hero__stats">
              <div class="stat">
                <span class="stat__number">6</span>
                <span class="stat__label">Módulos</span>
              </div>
              <div class="stat">
                <span class="stat__number">50+</span>
                <span class="stat__label">Ejercicios</span>
              </div>
              <div class="stat">
                <span class="stat__number">100%</span>
                <span class="stat__label">Gratis</span>
              </div>
            </div>
          </div>
          <div class="hero__visual">
            <div class="terminal-preview">
              <div class="terminal-preview__header">
                <div class="terminal-preview__dots">
                  <span class="dot dot--red"></span>
                  <span class="dot dot--yellow"></span>
                  <span class="dot dot--green"></span>
                </div>
                <span class="terminal-preview__title">Git Learning Terminal</span>
              </div>
              <div class="terminal-preview__body">
                <div class="terminal-line">
                  <span class="prompt">user@git-learning:~/proyecto$</span>
                  <span class="command">git init</span>
                </div>
                <div class="terminal-line output">
                  Inicializado repositorio Git vacío en .git/
                </div>
                <div class="terminal-line">
                  <span class="prompt">user@git-learning:~/proyecto$</span>
                  <span class="command typing">git add .</span>
                  <span class="cursor"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section__title">¿Por qué elegir nuestra plataforma?</h2>
        <div class="features__grid">
          <div class="feature-card">
            <div class="feature-card__icon">
              <Terminal class="w-8 h-8" />
            </div>
            <h3 class="feature-card__title">Simulador Real</h3>
            <p class="feature-card__description">
              Practica comandos Git en un terminal interactivo sin riesgo.
              Aprende haciendo con feedback instantáneo.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-card__icon">
              <Trophy class="w-8 h-8" />
            </div>
            <h3 class="feature-card__title">Gamificación</h3>
            <p class="feature-card__description">
              Sistema de insignias, puntos y desafíos que te motivan a seguir aprendiendo.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-card__icon">
              <Users class="w-8 h-8" />
            </div>
            <h3 class="feature-card__title">Enfoque Profesional</h3>
            <p class="feature-card__description">
              Aprende las mejores prácticas que usan los equipos de desarrollo profesionales.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-card__icon">
              <Smartphone class="w-8 h-8" />
            </div>
            <h3 class="feature-card__title">Mobile First</h3>
            <p class="feature-card__description">
              Diseño responsive que funciona perfectamente en cualquier dispositivo.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Learning Path Section -->
    <section class="learning-path">
      <div class="container">
        <h2 class="section__title">Tu Ruta de Aprendizaje</h2>
        <div class="path__container">
          <div
            v-for="(module, index) in learningModules"
            :key="module.id"
            class="path__module"
            :class="{ 'path__module--completed': module.completed }"
          >
            <div class="path__connector" v-if="index < learningModules.length - 1"></div>
            <div class="module-card">
              <div class="module-card__header">
                <div class="module-card__icon" :style="{ backgroundColor: module.color }">
                  <component :is="module.icon" class="w-6 h-6" />
                </div>
                <div class="module-card__level">{{ module.level }}</div>
              </div>
              <h3 class="module-card__title">{{ module.title }}</h3>
              <p class="module-card__description">{{ module.description }}</p>
              <div class="module-card__meta">
                <span class="meta__duration">
                  <Clock class="w-4 h-4" />
                  {{ module.duration }}
                </span>
                <span class="meta__exercises">
                  <BookOpen class="w-4 h-4" />
                  {{ module.exercises }} ejercicios
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta__content">
          <h2 class="cta__title">¿Listo para convertirte en un experto en Git?</h2>
          <p class="cta__subtitle">
            Únete a miles de desarrolladores que ya dominan el control de versiones
          </p>
          <button @click="startLearning" class="btn btn--success btn--large">
            <Rocket class="w-5 h-5 mr-2" />
            Comenzar Mi Viaje
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Code,
  Play,
  Terminal,
  Trophy,
  Users,
  Smartphone,
  Clock,
  BookOpen,
  Rocket,
  GitBranch,
  FileText,
  Share2,
  Zap,
  Database,
  Book
} from 'lucide-vue-next'

const router = useRouter()

// Datos de los módulos de aprendizaje
const learningModules = ref([
  {
    id: 'module-0',
    title: 'Fundamentos',
    description: '¿Qué es el control de versiones? Conceptos básicos de Git y GitHub.',
    level: 'Principiante',
    duration: '30 min',
    exercises: 5,
    color: '#58a6ff',
    icon: FileText,
    completed: false
  },
  {
    id: 'module-1',
    title: 'Tu Primer Repositorio',
    description: 'Aprende a crear tu primer repo y hacer commits paso a paso.',
    level: 'Principiante',
    duration: '45 min',
    exercises: 8,
    color: '#39d353',
    icon: Database,
    completed: false
  },
  {
    id: 'module-2',
    title: 'El Arte de Ramificar',
    description: 'Domina branches, merge y el trabajo colaborativo.',
    level: 'Intermedio',
    duration: '60 min',
    exercises: 12,
    color: '#a5a5ff',
    icon: GitBranch,
    completed: false
  },
  {
    id: 'module-3',
    title: 'Colaboración y Remotos',
    description: 'Push, pull, fetch y trabajo en equipo con GitHub.',
    level: 'Intermedio',
    duration: '50 min',
    exercises: 10,
    color: '#d29922',
    icon: Share2,
    completed: false
  },
  {
    id: 'module-4',
    title: 'La Forja',
    description: 'Ejercicios prácticos y resolución de conflictos.',
    level: 'Avanzado',
    duration: '90 min',
    exercises: 15,
    color: '#79c0ff',
    icon: Zap,
    completed: false
  },
  {
    id: 'module-5',
    title: 'Biblioteca de Comandos',
    description: 'Guía de referencia rápida y cheatsheet interactivo.',
    level: 'Referencia',
    duration: '∞',
    exercises: 'N/A',
    color: '#56d364',
    icon: Book,
    completed: false
  }
])

// Métodos
const startLearning = () => {
  router.push('/dashboard')
}

const viewDemo = () => {
  // Implementar demo modal o scroll a sección
  const featuresSection = document.querySelector('.features')
  featuresSection?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
}

// Hero Section
.hero {
  background: linear-gradient(135deg, $primary-dark 0%, #0a0e14 100%);
  padding: 6rem 0 4rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, rgba($accent-blue, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  @include mobile-only {
    padding: 4rem 0 3rem;
  }

  &__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    position: relative;
    z-index: 1;

    @include mobile-only {
      grid-template-columns: 1fr;
      gap: 3rem;
      text-align: center;
    }
  }

  &__title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    color: $text-primary;
  }

  &__subtitle {
    font-size: 1.25rem;
    color: $text-secondary;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;

    @include mobile-only {
      flex-direction: column;
      align-items: center;
    }
  }

  &__stats {
    display: flex;
    gap: 2rem;

    @include mobile-only {
      justify-content: center;
    }
  }
}

.stat {
  text-align: center;

  &__number {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: $accent-green;
  }

  &__label {
    display: block;
    font-size: 0.875rem;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

// Terminal Preview
.terminal-preview {
  @include terminal-style;
  max-width: 500px;
  margin-left: auto;
  @include fade-in();

  @include mobile-only {
    margin: 0 auto;
  }

  &__header {
    @include flex-between;
    background: $secondary-dark;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid $border;
  }

  &__dots {
    display: flex;
    gap: 0.5rem;
  }

  &__title {
    font-size: 0.875rem;
    color: $text-secondary;
  }

  &__body {
    padding: 1rem;
    font-family: $font-mono;
    font-size: 0.875rem;
  }
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;

  &--red { background: #ff5f57; }
  &--yellow { background: #ffbd2e; }
  &--green { background: #28ca42; }
}

.terminal-line {
  margin-bottom: 0.5rem;

  &.output {
    color: $text-secondary;
    margin-left: 1rem;
  }
}

.prompt {
  color: $accent-green;
  margin-right: 0.5rem;
}

.command {
  color: $text-primary;

  &.typing {
    animation: typing 2s infinite;
  }
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 1rem;
  background: $text-primary;
  animation: blink 1s infinite;
  margin-left: 2px;
}

// Sections
.section__title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: $text-primary;

  @include mobile-only {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
}

// Features Section
.features {
  padding: 6rem 0;
  background: $secondary-dark;

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }
}

.feature-card {
  @include card-base;
  text-align: center;
  @include transition();

  &:hover {
    transform: translateY(-5px);
    border-color: $accent-blue;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    background: linear-gradient(135deg, $accent-blue, $accent-green);
    border-radius: 50%;
    margin: 0 auto 1.5rem;
    color: white;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: $text-primary;
  }

  &__description {
    color: $text-secondary;
    line-height: 1.6;
  }
}

// Learning Path Section
.learning-path {
  padding: 6rem 0;
  background: $primary-dark;
}

.path__container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  position: relative;

  @include desktop-up {
    grid-template-columns: repeat(3, 1fr);
  }
}

.path__module {
  position: relative;

  &--completed {
    .module-card {
      border-color: $accent-green;
      background: rgba($accent-green, 0.05);
    }
  }
}

.path__connector {
  display: none;

  @include desktop-up {
    display: block;
    position: absolute;
    top: 50%;
    right: -1rem;
    width: 2rem;
    height: 2px;
    background: $border;
    transform: translateY(-50%);
    z-index: 1;
  }
}

.module-card {
  @include card-interactive;
  height: 100%;

  &__header {
    @include flex-between;
    margin-bottom: 1rem;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 0.5rem;
    color: white;
  }

  &__level {
    @include badge-base;
    background: rgba($accent-blue, 0.1);
    color: $accent-blue;
    border: 1px solid rgba($accent-blue, 0.2);
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: $text-primary;
  }

  &__description {
    color: $text-secondary;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  &__meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: $text-muted;

    .meta__duration,
    .meta__exercises {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }
}

// CTA Section
.cta {
  padding: 6rem 0;
  background: linear-gradient(135deg, $accent-blue, $accent-green);
  text-align: center;

  &__content {
    max-width: 600px;
    margin: 0 auto;
  }

  &__title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: white;

    @include mobile-only {
      font-size: 2rem;
    }
  }

  &__subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    color: rgba(white, 0.9);
  }
}

// Buttons
.btn {
  @include button-base;

  &--primary {
    @include button-primary;
  }

  &--secondary {
    @include button-base;
    background: transparent;
    color: $text-primary;
    border: 2px solid $border;

    &:hover:not(:disabled) {
      border-color: $accent-blue;
      background: rgba($accent-blue, 0.1);
    }
  }

  &--success {
    @include button-success;
  }

  &--large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }
}

.gradient-text {
  background: linear-gradient(45deg, $accent-blue, $accent-green);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

// Animations
@keyframes typing {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}
</style>

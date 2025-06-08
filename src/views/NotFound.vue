<template>
  <div class="not-found">
    <div class="container">
      <div class="not-found__content">
        <div class="not-found__visual">
          <div class="terminal-404">
            <div class="terminal-404__header">
              <div class="terminal-dots">
                <span class="dot dot--red"></span>
                <span class="dot dot--yellow"></span>
                <span class="dot dot--green"></span>
              </div>
              <span class="terminal-title">Terminal - Error</span>
            </div>
            <div class="terminal-404__body">
              <div class="terminal-line">
                <span class="prompt">user@git-learning:~$</span>
                <span class="command">cd {{ currentPath }}</span>
              </div>
              <div class="terminal-line error">
                bash: cd: {{ currentPath }}: No such file or directory
              </div>
              <div class="terminal-line">
                <span class="prompt">user@git-learning:~$</span>
                <span class="command">ls -la</span>
              </div>
              <div class="terminal-line output">
                total 3<br>
                drwxr-xr-x 3 user user 96 {{ currentDate }} .<br>
                drwxr-xr-x 4 root root 128 {{ currentDate }} ..<br>
                -rw-r--r-- 1 user user 404 {{ currentDate }} <span class="file-error">page_not_found.txt</span>
              </div>
              <div class="terminal-line">
                <span class="prompt">user@git-learning:~$</span>
                <span class="command typing">git status</span>
                <span class="cursor"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="not-found__text">
          <h1 class="not-found__title">
            <span class="error-code">404</span>
            Página no encontrada
          </h1>
          <p class="not-found__description">
            Parece que te has perdido en el repositorio. La página que buscas no existe
            o ha sido movida a otra rama.
          </p>

          <div class="git-suggestions">
            <h3 class="suggestions-title">🔍 Comandos útiles para encontrar tu camino:</h3>
            <div class="suggestions-list">
              <div class="suggestion-item">
                <code class="suggestion-command">git log --oneline</code>
                <span class="suggestion-description">Ver el historial de navegación</span>
              </div>
              <div class="suggestion-item">
                <code class="suggestion-command">git checkout main</code>
                <span class="suggestion-description">Volver a la rama principal</span>
              </div>
              <div class="suggestion-item">
                <code class="suggestion-command">git branch -a</code>
                <span class="suggestion-description">Listar todas las páginas disponibles</span>
              </div>
            </div>
          </div>

          <div class="not-found__actions">
            <button @click="goHome" class="btn btn--primary">
              <Home class="w-5 h-5 mr-2" />
              Ir al Inicio
            </button>
            <button @click="goDashboard" class="btn btn--secondary">
              <BarChart3 class="w-5 h-5 mr-2" />
              Dashboard
            </button>
            <button @click="goBack" class="btn btn--ghost">
              <ArrowLeft class="w-5 h-5 mr-2" />
              Volver Atrás
            </button>
          </div>

          <!-- Enlaces útiles -->
          <div class="quick-links">
            <h4 class="quick-links__title">Enlaces rápidos:</h4>
            <div class="quick-links__grid">
              <router-link to="/dashboard" class="quick-link">
                <BarChart3 class="w-4 h-4" />
                Dashboard
              </router-link>
              <router-link to="/module/module-0" class="quick-link">
                <BookOpen class="w-4 h-4" />
                Fundamentos
              </router-link>
              <router-link to="/exercises" class="quick-link">
                <Terminal class="w-4 h-4" />
                Ejercicios
              </router-link>
              <router-link to="/commands" class="quick-link">
                <Search class="w-4 h-4" />
                Comandos
              </router-link>
              <router-link to="/profile" class="quick-link">
                <User class="w-4 h-4" />
                Perfil
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Home, BarChart3, ArrowLeft, BookOpen, Terminal,
  Search, User
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Estado reactivo
const currentDate = ref('')

// Computed
const currentPath = computed(() => {
  return route.fullPath
})

// Métodos
const goHome = () => {
  router.push('/')
}

const goDashboard = () => {
  router.push('/dashboard')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// Lifecycle
onMounted(() => {
  // Formatear fecha actual para el terminal
  const now = new Date()
  const options = {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
  currentDate.value = now.toLocaleDateString('es-ES', options)
})
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  @include flex-center;
  padding: 2rem 0;
  background: $primary-dark;
}

.not-found__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;

  @include mobile-only {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
}

// Terminal 404
.terminal-404 {
  @include terminal-style;
  max-width: 500px;
  margin: 0 auto;

  &__header {
    @include flex-between;
    background: $secondary-dark;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid $border;
  }

  &__body {
    padding: 1rem;
    font-family: $font-mono;
    font-size: 0.875rem;
    min-height: 300px;
  }
}

.terminal-dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;

  &--red {
    background: #ff5f57;
  }

  &--yellow {
    background: #ffbd2e;
  }

  &--green {
    background: #28ca42;
  }
}

.terminal-title {
  font-size: 0.875rem;
  color: $text-secondary;
}

.terminal-line {
  margin-bottom: 0.5rem;

  &.error {
    color: $danger;
    margin-left: 0;
  }

  &.output {
    color: $text-secondary;
    margin-left: 1rem;
    line-height: 1.4;
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

.file-error {
  color: $danger;
  font-weight: 600;
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 1rem;
  background: $text-primary;
  animation: blink 1s infinite;
  margin-left: 2px;
}

// Contenido de texto
.not-found__text {
  max-width: 500px;

  @include mobile-only {
    max-width: 100%;
  }
}

.not-found__title {
  font-size: 2.5rem;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 1rem;
  line-height: 1.1;

  @include mobile-only {
    font-size: 2rem;
  }
}

.error-code {
  display: block;
  font-size: 4rem;
  background: linear-gradient(45deg, $danger, $warning);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  line-height: 0.8;
  margin-bottom: 0.5rem;

  @include mobile-only {
    font-size: 3rem;
  }
}

.not-found__description {
  color: $text-secondary;
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

// Sugerencias de Git
.git-suggestions {
  background: $secondary-dark;
  border: 1px solid $border;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.suggestions-title {
  font-size: 1rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 1rem;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background: $tertiary-dark;
  border-radius: 0.5rem;

  @include mobile-only {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

.suggestion-command {
  font-family: $font-mono;
  background: $primary-dark;
  color: $accent-blue;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  border: 1px solid $border;
  white-space: nowrap;
}

.suggestion-description {
  color: $text-secondary;
  font-size: 0.875rem;
  flex: 1;
}

// Acciones
.not-found__actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  @include mobile-only {
    justify-content: center;
  }
}

// Enlaces rápidos
.quick-links {
  background: rgba($accent-blue, 0.05);
  border: 1px solid rgba($accent-blue, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;

  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 1rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }
}

.quick-link {
  @include flex-center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: $tertiary-dark;
  border: 1px solid $border;
  border-radius: 0.5rem;
  color: $text-secondary;
  text-decoration: none;
  font-size: 0.875rem;
  @include transition();

  &:hover {
    color: $accent-blue;
    border-color: $accent-blue;
    background: rgba($accent-blue, 0.1);
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

  &--ghost {
    @include button-base;
    background: transparent;
    color: $text-secondary;
    border: none;

    &:hover:not(:disabled) {
      color: $text-primary;
      background: rgba($border, 0.5);
    }
  }
}

// Animaciones
@keyframes typing {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0.3;
  }
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}
</style>

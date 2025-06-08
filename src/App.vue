<template>
  <div id="app" class="app">
    <!-- Header Navigation -->
    <header class="app-header" :class="{ 'app-header--scrolled': isScrolled }">
      <nav class="navbar">
        <div class="container">
          <div class="navbar__content">
            <!-- Logo -->
            <router-link to="/" class="navbar__brand">
              <div class="logo">
                <GitBranch class="w-8 h-8" />
                <span class="logo__text">
                  Git<span class="logo__accent">Learning</span>
                </span>
              </div>
            </router-link>

            <!-- Desktop Navigation -->
            <div class="navbar__nav" :class="{ 'navbar__nav--open': isMobileMenuOpen }">
              <router-link
                v-for="link in navigationLinks"
                :key="link.name"
                :to="link.path"
                class="nav-link"
                :class="{ 'nav-link--active': $route.path === link.path }"
                @click="closeMobileMenu"
              >
                <component :is="link.icon" class="w-4 h-4" />
                {{ link.name }}
              </router-link>
            </div>

            <!-- User Actions -->
            <div class="navbar__actions">
              <!-- Theme Toggle -->
              <button
                class="icon-button"
                @click="toggleTheme"
                title="Cambiar tema"
              >
                <Moon v-if="isDarkMode" class="w-5 h-5" />
                <Sun v-else class="w-5 h-5" />
              </button>

              <!-- Notifications (placeholder) -->
              <button class="icon-button" title="Notificaciones">
                <Bell class="w-5 h-5" />
              </button>

              <!-- User Profile -->
              <router-link to="/profile" class="user-avatar">
                <User class="w-5 h-5" />
              </router-link>

              <!-- Mobile Menu Toggle -->
              <button
                class="mobile-menu-toggle"
                @click="toggleMobileMenu"
                :class="{ 'mobile-menu-toggle--open': isMobileMenuOpen }"
              >
                <Menu class="w-6 h-6" />
                <X class="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <router-view v-slot="{ Component, route }">
        <transition
          :name="getTransitionName(route)"
          mode="out-in"
          @enter="onPageEnter"
          @leave="onPageLeave"
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="app-footer" v-if="!isFullscreenRoute">
      <div class="container">
        <div class="footer__content">
          <div class="footer__section">
            <div class="footer__brand">
              <GitBranch class="w-6 h-6" />
              <span class="footer__brand-text">GitLearning</span>
            </div>
            <p class="footer__description">
              La plataforma más interactiva para aprender Git y GitHub.
              Domina el control de versiones como un profesional.
            </p>
          </div>

          <div class="footer__section">
            <h4 class="footer__title">Aprendizaje</h4>
            <div class="footer__links">
              <router-link to="/dashboard" class="footer__link">Módulos</router-link>
              <router-link to="/exercises" class="footer__link">Ejercicios</router-link>
              <router-link to="/commands" class="footer__link">Comandos</router-link>
            </div>
          </div>

          <div class="footer__section">
            <h4 class="footer__title">Recursos</h4>
            <div class="footer__links">
              <a href="https://git-scm.com/doc" target="_blank" class="footer__link">Documentación Git</a>
              <a href="https://github.com" target="_blank" class="footer__link">GitHub</a>
              <a href="https://docs.github.com" target="_blank" class="footer__link">GitHub Docs</a>
            </div>
          </div>

          <div class="footer__section">
            <h4 class="footer__title">Síguenos</h4>
            <div class="footer__social">
              <a href="#" class="social-link" title="GitHub">
                <Github class="w-5 h-5" />
              </a>
              <a href="#" class="social-link" title="Twitter">
                <Twitter class="w-5 h-5" />
              </a>
              <a href="#" class="social-link" title="LinkedIn">
                <Linkedin class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div class="footer__bottom">
          <p class="footer__copyright">
            © 2024 GitLearning Platform. Hecho con ❤️ para la comunidad de desarrolladores.
          </p>
        </div>
      </div>
    </footer>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">Cargando...</p>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <transition-group name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <component :is="getToastIcon(toast.type)" class="w-5 h-5" />
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" @click="removeToast(toast.id)">
            <X class="w-4 h-4" />
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  GitBranch, Home, BarChart3, User, BookOpen, Terminal,
  Moon, Sun, Bell, Menu, X, Github, Twitter, Linkedin,
  CheckCircle, AlertCircle, Info, AlertTriangle
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Estado reactivo
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isDarkMode = ref(true)
const isLoading = ref(false)
const toasts = ref([])

// Navegación
const navigationLinks = ref([
  { name: 'Inicio', path: '/', icon: Home },
  { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { name: 'Ejercicios', path: '/exercises', icon: Terminal },
  { name: 'Comandos', path: '/commands', icon: BookOpen }
])

// Computed
const isFullscreenRoute = computed(() => {
  const fullscreenRoutes = ['/module']
  return fullscreenRoutes.some(route => route.path.startsWith(route))
})

// Métodos
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  // Aquí implementarías el cambio de tema real
  console.log('Theme toggled:', isDarkMode.value ? 'dark' : 'light')
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const getTransitionName = (route) => {
  // Diferentes transiciones según la ruta
  if (route.path === '/') return 'fade'
  if (route.path.startsWith('/module')) return 'slide-left'
  return 'slide-up'
}

const onPageEnter = () => {
  isLoading.value = false
}

const onPageLeave = () => {
  isLoading.value = true
}

// Toast system
let toastIdCounter = 0

const addToast = (message, type = 'info', duration = 4000) => {
  const id = ++toastIdCounter
  const toast = { id, message, type }

  toasts.value.push(toast)

  setTimeout(() => {
    removeToast(id)
  }, duration)
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const getToastIcon = (type) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }
  return icons[type] || Info
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  // Cerrar menú móvil al cambiar de tamaño de ventana
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      isMobileMenuOpen.value = false
    }
  })

  // Toast de bienvenida
  setTimeout(() => {
    addToast('¡Bienvenido a GitLearning! 🚀', 'success')
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Watchers
watch(route, () => {
  closeMobileMenu()
})

// Exponer métodos globalmente para uso en componentes hijos
window.addToast = addToast
</script>

<style lang="scss" scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $primary-dark;
  color: $text-primary;
}

// Header
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-fixed;
  background: rgba($secondary-dark, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid transparent;
  @include transition();

  &--scrolled {
    border-bottom-color: $border;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  }
}

.navbar {
  padding: 1rem 0;

  &__content {
    @include flex-between;
    align-items: center;
  }

  &__brand {
    text-decoration: none;
    @include transition();

    &:hover {
      transform: scale(1.05);
    }
  }

  &__nav {
    display: flex;
    gap: 2rem;
    align-items: center;

    @include mobile-only {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: $secondary-dark;
      flex-direction: column;
      justify-content: center;
      gap: 2rem;
      transform: translateX(-100%);
      @include transition(transform, 0.3s);

      &--open {
        transform: translateX(0);
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
}

.logo {
  @include flex-center;
  gap: 0.5rem;
  color: $text-primary;

  &__text {
    font-size: 1.25rem;
    font-weight: 700;
  }

  &__accent {
    color: $accent-green;
  }
}

.nav-link {
  @include flex-center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: $text-secondary;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  @include transition();

  &:hover,
  &--active {
    color: $accent-blue;
    background: rgba($accent-blue, 0.1);
  }

  @include mobile-only {
    font-size: 1.125rem;
    padding: 1rem 2rem;
  }
}

.icon-button {
  @include flex-center;
  width: 2.5rem;
  height: 2.5rem;
  background: none;
  border: none;
  color: $text-secondary;
  border-radius: 50%;
  cursor: pointer;
  @include transition();

  &:hover {
    color: $text-primary;
    background: rgba($accent-blue, 0.1);
  }
}

.user-avatar {
  @include flex-center;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, $accent-blue, $accent-green);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  @include transition();

  &:hover {
    transform: scale(1.1);
  }
}

.mobile-menu-toggle {
  @include flex-center;
  width: 2.5rem;
  height: 2.5rem;
  background: none;
  border: none;
  color: $text-primary;
  cursor: pointer;
  position: relative;

  @include desktop-up {
    display: none;
  }

  .lucide {
    position: absolute;
    @include transition();
  }

  .lucide:last-child {
    opacity: 0;
    transform: rotate(90deg);
  }

  &--open {
    .lucide:first-child {
      opacity: 0;
      transform: rotate(-90deg);
    }

    .lucide:last-child {
      opacity: 1;
      transform: rotate(0deg);
    }
  }
}

// Main content
.app-main {
  flex: 1;
  margin-top: 5rem; // Header height
}

// Footer
.app-footer {
  background: $secondary-dark;
  border-top: 1px solid $border;
  padding: 3rem 0 1rem;
  margin-top: 4rem;
}

.footer__content {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;

  @include mobile-only {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.footer__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer__brand {
  @include flex-center;
  gap: 0.5rem;
  color: $text-primary;
  font-size: 1.125rem;
  font-weight: 600;
  justify-content: flex-start;
  margin-bottom: 0.5rem;
}

.footer__description {
  color: $text-secondary;
  line-height: 1.6;
  max-width: 300px;
}

.footer__title {
  color: $text-primary;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer__link {
  color: $text-secondary;
  text-decoration: none;
  font-size: 0.875rem;
  @include transition();

  &:hover {
    color: $accent-blue;
  }
}

.footer__social {
  display: flex;
  gap: 1rem;
}

.social-link {
  @include flex-center;
  width: 2.5rem;
  height: 2.5rem;
  background: $tertiary-dark;
  border-radius: 50%;
  color: $text-secondary;
  text-decoration: none;
  @include transition();

  &:hover {
    color: $text-primary;
    background: $accent-blue;
  }
}

.footer__bottom {
  padding-top: 2rem;
  border-top: 1px solid $border;
  text-align: center;
}

.footer__copyright {
  color: $text-muted;
  font-size: 0.875rem;
}

// Loading overlay
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba($primary-dark, 0.8);
  backdrop-filter: blur(4px);
  @include flex-center;
  z-index: $z-modal;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid $border;
  border-top: 3px solid $accent-blue;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  color: $text-secondary;
  font-size: 0.875rem;
}

// Toast notifications
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: $z-toast;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @include mobile-only {
    left: 1rem;
    right: 1rem;
  }
}

.toast {
  @include flex-center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: $secondary-dark;
  border: 1px solid $border;
  border-radius: 0.5rem;
  color: $text-primary;
  min-width: 300px;
  box-shadow: $shadow-lg;

  @include mobile-only {
    min-width: auto;
  }

  &--success {
    border-color: $success;
    background: rgba($success, 0.1);
    color: $success;
  }

  &--error {
    border-color: $danger;
    background: rgba($danger, 0.1);
    color: $danger;
  }

  &--warning {
    border-color: $warning;
    background: rgba($warning, 0.1);
    color: $warning;
  }

  &--info {
    border-color: $accent-blue;
    background: rgba($accent-blue, 0.1);
    color: $accent-blue;
  }

  &__message {
    flex: 1;
    font-size: 0.875rem;
  }

  &__close {
    @include flex-center;
    width: 1.5rem;
    height: 1.5rem;
    background: none;
    border: none;
    color: currentColor;
    cursor: pointer;
    border-radius: 0.25rem;
    @include transition();

    &:hover {
      color: $text-primary;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

// Animations
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

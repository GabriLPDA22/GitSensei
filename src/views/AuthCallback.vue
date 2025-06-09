<template>
  <div class="auth-callback">
    <div class="callback-container">
      <div class="callback-content">
        <!-- Loading State -->
        <div v-if="isProcessing" class="processing-state">
          <div class="github-logo">
            <Github class="w-16 h-16" />
          </div>
          <h2 class="processing-title">Completando autenticación...</h2>
          <p class="processing-text">Conectando con GitHub y obteniendo tu perfil</p>
          <div class="loading-bar">
            <div class="loading-progress" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="success" class="success-state">
          <div class="success-icon">
            <CheckCircle class="w-16 h-16" />
          </div>
          <h2 class="success-title">¡Bienvenido, {{ userName }}!</h2>
          <p class="success-text">Tu cuenta se ha conectado correctamente</p>
          <div class="redirect-info">
            <p>Redirigiendo al dashboard en {{ countdown }} segundos...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">
            <AlertCircle class="w-16 h-16" />
          </div>
          <h2 class="error-title">Error de autenticación</h2>
          <p class="error-text">{{ error }}</p>
          <button @click="handleRetry" class="retry-button">
            <RefreshCw class="w-4 h-4" />
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import {
  Github, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { userName } = storeToRefs(authStore)

const isProcessing = ref(true)
const success = ref(false)
const error = ref(null)
const progress = ref(0)
const countdown = ref(3)

// Simular progreso de carga
const simulateProgress = () => {
  const interval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 15
    }
  }, 200)

  return interval
}

// Countdown para redirect
const startCountdown = () => {
  const interval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(interval)
      router.push('/dashboard')
    }
  }, 1000)
}

const handleRetry = () => {
  window.location.href = '/'
}

const processCallback = async () => {
  try {
    const code = route.query.code
    const errorParam = route.query.error

    if (errorParam) {
      throw new Error(`GitHub Error: ${errorParam}`)
    }

    if (!code) {
      throw new Error('No se recibió código de autorización de GitHub')
    }

    // Simular progreso
    const progressInterval = simulateProgress()

    // Procesar autenticación
    const result = await authStore.handleGitHubCallback(code)

    clearInterval(progressInterval)
    progress.value = 100

    if (result) {
      success.value = true
      isProcessing.value = false
      startCountdown()
    } else {
      throw new Error('Error procesando la autenticación')
    }

  } catch (err) {
    console.error('Error en callback:', err)
    error.value = err.message
    isProcessing.value = false
  }
}

onMounted(() => {
  // Pequeño delay para mostrar la UI de carga
  setTimeout(processCallback, 500)
})
</script>

<style lang="scss" scoped>
.auth-callback {
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.callback-container {
  width: 100%;
  max-width: 400px;
}

.callback-content {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 16px 32px rgba(1, 4, 9, 0.85);
}

// Processing State
.processing-state {
  .github-logo {
    color: #8b949e;
    margin-bottom: 1.5rem;
    animation: pulse 2s ease-in-out infinite;
  }
}

.processing-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f0f6fc;
  margin-bottom: 0.5rem;
}

.processing-text {
  color: #8b949e;
  margin-bottom: 2rem;
  font-size: 0.875rem;
}

.loading-bar {
  width: 100%;
  height: 4px;
  background: #30363d;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #58a6ff, #39d353);
  border-radius: 2px;
  transition: width 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 1.5s ease-in-out infinite;
  }
}

// Success State
.success-state {
  .success-icon {
    color: #39d353;
    margin-bottom: 1.5rem;
    animation: bounceIn 0.6s ease-out;
  }
}

.success-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f0f6fc;
  margin-bottom: 0.5rem;
}

.success-text {
  color: #8b949e;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.redirect-info {
  padding: 1rem;
  background: rgba(57, 211, 83, 0.1);
  border: 1px solid rgba(57, 211, 83, 0.2);
  border-radius: 8px;

  p {
    color: #39d353;
    font-size: 0.875rem;
    margin: 0;
  }
}

// Error State
.error-state {
  .error-icon {
    color: #f85149;
    margin-bottom: 1.5rem;
  }
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f0f6fc;
  margin-bottom: 0.5rem;
}

.error-text {
  color: #f85149;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #58a6ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4969ed;
    transform: translateY(-1px);
  }
}

// Animations
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>

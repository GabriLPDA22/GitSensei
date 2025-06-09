<template>
  <div class="intro-splash">
    <!-- Floating Icons Background -->
    <div class="floating-icons" :class="{ 'blurred': loadingStats, 'hidden': loadingStats }">
      <div
        v-for="(item, index) in floatingIcons"
        :key="index"
        class="floating-icon"
        :style="{
          ...item.position,
          animationDelay: `${item.delay}s`
        }"
      >
        <component :is="item.icon" class="w-6 h-6" />
      </div>
    </div>

    <!-- Animated Grid Background -->
    <div class="grid-background"></div>

    <!-- Main Content -->
    <div class="intro-content" :class="{ 'blurred': loadingStats, 'hidden': loadingStats }">
      <div class="intro-hero">
        <!-- Avatar with pulse effect -->
        <div class="avatar-container">
          <div class="avatar-pulse"></div>
          <div class="avatar" @click="fetchGitHubStats">
            <img
              v-if="githubData.avatar_url"
              :src="githubData.avatar_url"
              :alt="githubData.name"
              class="avatar-image"
            />
            <span v-else class="avatar-text">GS</span>
          </div>
        </div>

        <!-- Typewriter Text -->
        <div class="typewriter-container">
          <h1 class="typewriter-text">
            {{ currentText }}
            <span class="cursor" :class="{ 'visible': showCursor }">|</span>
          </h1>
        </div>

        <!-- Subtitle with fade-in -->
        <div v-if="showButton" class="subtitle-container">
          <p class="subtitle">
            Si estás aquí es porque <span class="highlight">Git te tiene frito</span> 🔥
            <br />
            Tranqui, a mí también me pasaba. Pero juntos vamos a <span class="highlight">dominar esto</span>.
          </p>

          <!-- Real GitHub Stats Cards -->
          <div class="stats-cards">
            <div class="stat-card" :class="{ 'loading': loadingStats }">
              <Terminal class="w-5 h-5 stat-icon" />
              <span class="stat-text">
                <span v-if="!loadingStats">{{ formatNumber(githubStats.totalCommits) }} commits</span>
                <span v-else class="loading-dots">Cargando...</span>
              </span>
            </div>
            <div class="stat-card" :class="{ 'loading': loadingStats }">
              <GitBranch class="w-5 h-5 stat-icon" />
              <span class="stat-text">
                <span v-if="!loadingStats">{{ githubStats.publicRepos }} repositorios</span>
                <span v-else class="loading-dots">Cargando...</span>
              </span>
            </div>
            <div class="stat-card" :class="{ 'loading': loadingStats }">
              <Heart class="w-5 h-5 stat-icon" />
              <span class="stat-text">
                <span v-if="!loadingStats">{{ githubStats.yearsOnGitHub }} años en GitHub</span>
                <span v-else class="loading-dots">Cargando...</span>
              </span>
            </div>
          </div>

          <!-- GitHub Profile Link -->
          <div v-if="githubData.html_url" class="github-link">
            <a :href="githubData.html_url" target="_blank" class="github-profile-link">
              <Github class="w-4 h-4" />
              Ver mi GitHub completo
              <ExternalLink class="w-4 h-4" />
            </a>
          </div>

          <!-- Call to Action -->
          <div class="cta-container">
            <button
              class="start-button"
              @click="startJourney"
              :disabled="loadingStats"
            >
              <span>¡Vamos a arrasar con Git!</span>
              <ArrowRight class="w-5 h-5" />
              <div class="button-glow"></div>
            </button>

            <p class="cta-subtext">
              <Coffee class="w-4 h-4" />
              Tiempo estimado: 30 min para empezar a brillar
            </p>
          </div>

          <!-- Developer Languages (if available) -->
          <div v-if="githubStats.topLanguages.length > 0" class="languages-section">
            <h4 class="languages-title">🚀 Mis tecnologías favoritas:</h4>
            <div class="languages-list">
              <span
                v-for="language in githubStats.topLanguages.slice(0, 5)"
                :key="language"
                class="language-tag"
              >
                {{ language }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Particles Animation -->
    <div class="particles" :class="{ 'blurred': loadingStats, 'hidden': loadingStats }">
      <div
        v-for="i in 20"
        :key="i"
        class="particle"
        :style="{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`
        }"
      ></div>
    </div>

    <!-- Elegant Loading Overlay -->
    <div v-if="loadingStats" class="elegant-loader">
      <div class="loader-container">
        <!-- Git Logo Animado -->
        <div class="git-logo">
          <svg class="git-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Nodos -->
            <circle class="node node-1" cx="50" cy="25" r="8"/>
            <circle class="node node-2" cx="25" cy="60" r="8"/>
            <circle class="node node-3" cx="75" cy="60" r="8"/>
            <circle class="node node-4" cx="50" cy="75" r="6"/>

            <!-- Conexiones -->
            <line class="connection connection-1" x1="50" y1="25" x2="25" y2="60"/>
            <line class="connection connection-2" x1="50" y1="25" x2="75" y2="60"/>
            <line class="connection connection-3" x1="25" y1="60" x2="50" y2="75"/>
            <line class="connection connection-4" x1="75" y1="60" x2="50" y2="75"/>

            <!-- Línea central -->
            <line class="connection connection-main" x1="50" y1="33" x2="50" y2="67"/>
          </svg>

          <!-- Efecto de pulso -->
          <div class="pulse-ring"></div>
          <div class="pulse-ring pulse-ring-2"></div>
        </div>

        <!-- Texto de carga con efecto typewriter -->
        <div class="loading-text">
          <span class="loading-message">{{ loadingMessage }}</span>
          <span class="loading-cursor">|</span>
        </div>

        <!-- Barra de progreso -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${loadingProgress}%` }"></div>
          </div>
          <span class="progress-text">{{ loadingProgress }}%</span>
        </div>

        <!-- Partículas flotantes -->
        <div class="loader-particles">
          <div
            v-for="i in 8"
            :key="`loader-particle-${i}`"
            class="loader-particle"
            :style="{
              animationDelay: `${i * 0.2}s`,
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  GitBranch, Terminal, Coffee, Heart, ArrowRight, Github, ExternalLink,
  Code, Zap
} from 'lucide-vue-next'

// Emits
const emit = defineEmits(['start-journey'])

// Estado de la introducción
const currentText = ref('')
const showCursor = ref(true)
const animationPhase = ref(0)
const showButton = ref(false)
const loadingStats = ref(true)
const loadingProgress = ref(0)
const loadingMessage = ref('')

// Mensajes de carga
const loadingMessages = [
  'Conectando con GitHub...',
  'Analizando repositorios...',
  'Calculando commits...',
  'Obteniendo lenguajes...',
  '¡Casi listo!'
]

// GitHub Data
const githubData = ref({
  name: 'Gabriel Saiz',
  avatar_url: '',
  html_url: '',
  public_repos: 0,
  created_at: '',
  followers: 0,
  following: 0
})

const githubStats = ref({
  totalCommits: 0,
  publicRepos: 0,
  yearsOnGitHub: 0,
  topLanguages: [],
  totalStars: 0
})

// Inicialización
onMounted(() => {
  // Primero cargar stats, después typewriter
  fetchGitHubStats()
})

// Textos para la animación typewriter
const texts = [
  "Hola, soy Gabriel Saiz 👋",
  "Desarrollador recién graduado de DAW",
  "Y sí... Git también me daba dolor de cabeza",
  "Hasta que decidí dominarlo de una vez por todas"
]

// Iconos flotantes
const floatingIcons = [
  { icon: GitBranch, delay: 0, position: { top: '20%', left: '10%' } },
  { icon: Terminal, delay: 0.5, position: { top: '30%', right: '15%' } },
  { icon: Code, delay: 1, position: { bottom: '30%', left: '5%' } },
  { icon: Coffee, delay: 1.5, position: { top: '15%', right: '25%' } },
  { icon: Zap, delay: 2, position: { bottom: '20%', right: '10%' } },
]

// Simular progreso de carga
const simulateLoading = () => {
  let currentStep = 0
  const steps = loadingMessages.length

  const updateProgress = () => {
    if (currentStep < steps) {
      loadingMessage.value = loadingMessages[currentStep]
      loadingProgress.value = ((currentStep + 1) / steps) * 100
      currentStep++
      setTimeout(updateProgress, 600)
    }
  }

  updateProgress()
}

// Función para obtener estadísticas reales de GitHub
const fetchGitHubStats = async () => {
  try {
    loadingStats.value = true
    simulateLoading()

    // Obtener datos básicos del usuario
    const userResponse = await fetch('https://api.github.com/users/GabriLPDA22')
    const userData = await userResponse.json()

    if (userData && !userData.message) {
      githubData.value = userData

      // Calcular años en GitHub
      const joinDate = new Date(userData.created_at)
      const now = new Date()
      const yearsOnGitHub = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24 * 365))

      githubStats.value.publicRepos = userData.public_repos
      githubStats.value.yearsOnGitHub = Math.max(yearsOnGitHub, 1)
    }

    // Obtener repositorios para más estadísticas
    const reposResponse = await fetch(`https://api.github.com/users/GabriLPDA22/repos?per_page=100&sort=updated`)
    const reposData = await reposResponse.json()

    if (Array.isArray(reposData)) {
      // Calcular total de estrellas
      const totalStars = reposData.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0)
      githubStats.value.totalStars = totalStars

      // Obtener lenguajes más usados
      const languages = {}
      reposData.forEach(repo => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1
        }
      })

      const sortedLanguages = Object.entries(languages)
        .sort(([,a], [,b]) => b - a)
        .map(([lang]) => lang)

      githubStats.value.topLanguages = sortedLanguages

      // Estimación realista de commits
      const activeRepos = reposData.filter(repo =>
        !repo.fork &&
        repo.size > 0 &&
        new Date(repo.updated_at) > new Date('2022-01-01')
      ).length

      // Estimación basada en repos activos y tiempo en GitHub
      const baseCommits = Math.max(activeRepos * 20, 100)
      const yearBonus = githubStats.value.yearsOnGitHub * 50
      githubStats.value.totalCommits = baseCommits + yearBonus
    }

    // Delay para completar la animación de carga
    setTimeout(() => {
      loadingStats.value = false
      // AHORA sí empezar el typewriter
      startTypewriter()
    }, 3500)

  } catch (error) {
    console.error('Error fetching GitHub stats:', error)
    // Fallback con datos por defecto
    githubStats.value = {
      totalCommits: 300,
      publicRepos: githubData.value.public_repos || 12,
      yearsOnGitHub: 2,
      topLanguages: ['JavaScript', 'Vue.js', 'PHP', 'HTML', 'CSS'],
      totalStars: 8
    }
    setTimeout(() => {
      loadingStats.value = false
      // También empezar typewriter en caso de error
      startTypewriter()
    }, 3500)
  }
}

// Función para formatear números
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// Función para el efecto typewriter
const startTypewriter = () => {
  const animate = () => {
    if (animationPhase.value < texts.length) {
      const text = texts[animationPhase.value]
      let index = 0

      const typeWriter = setInterval(() => {
        currentText.value = text.slice(0, index + 1)
        index++

        if (index === text.length) {
          clearInterval(typeWriter)
          setTimeout(() => {
            if (animationPhase.value === texts.length - 1) {
              showButton.value = true
            } else {
              animationPhase.value++
              currentText.value = ''
              animate()
            }
          }, 1500)
        }
      }, 50)
    }
  }

  animate()
}

// Cursor parpadeante
onMounted(() => {
  const cursorBlink = setInterval(() => {
    showCursor.value = !showCursor.value
  }, 530)

  onUnmounted(() => {
    clearInterval(cursorBlink)
  })
})

// Función para iniciar el viaje
const startJourney = () => {
  localStorage.setItem('hasSeenGitIntro', 'true')
  emit('start-journey')
}
</script>

<style lang="scss" scoped>
.intro-splash {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #f0f6fc;
}

// Efecto blur para el fondo cuando está cargando
.blurred {
  filter: blur(8px);
  opacity: 0.3;
  transition: all 0.3s ease;
}

.hidden {
  opacity: 0;
  visibility: hidden;
}

.intro-content:not(.hidden):not(.blurred) {
  animation: contentAppear 0.8s ease-out forwards;
}

@keyframes contentAppear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.grid-background {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(88, 166, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(88, 166, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.floating-icons {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: filter 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
}

.floating-icon {
  position: absolute;
  color: rgba(88, 166, 255, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.intro-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 800px;
  padding: 2rem;
  transition: filter 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
}

.intro-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.avatar-container {
  position: relative;
  margin-bottom: 1rem;
}

.avatar-pulse {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: linear-gradient(45deg, #58a6ff, #39d353);
  animation: pulse 2s ease-in-out infinite;
}

.avatar {
  position: relative;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #58a6ff, #39d353);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: scale(1.05);
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-text {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.typewriter-container {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typewriter-text {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  background: linear-gradient(45deg, #58a6ff, #39d353, #a5a5ff);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.cursor {
  color: #39d353;
  font-weight: normal;
  transition: opacity 0.1s;

  &.visible {
    opacity: 1;
  }

  &:not(.visible) {
    opacity: 0;
  }
}

.subtitle-container {
  animation: fadeInUp 1s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #8b949e;
  margin-bottom: 2rem;
}

.highlight {
  color: #39d353;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(57, 211, 83, 0.3);
}

.stats-cards {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(33, 38, 45, 0.8);
  border: 1px solid rgba(88, 166, 255, 0.2);
  border-radius: 50px;
  backdrop-filter: blur(10px);
  font-size: 0.875rem;
  font-weight: 500;
  animation: slideInScale 0.6s ease-out forwards;
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  transition: all 0.3s ease;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }

  &.loading {
    border-color: rgba(88, 166, 255, 0.4);
    background: rgba(33, 38, 45, 0.9);
  }
}

@keyframes slideInScale {
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.stat-icon {
  color: #58a6ff;
}

.stat-text {
  color: #f0f6fc;
}

.loading-dots {
  animation: loadingDots 1.4s ease-in-out infinite;
}

@keyframes loadingDots {
  0%, 80%, 100% { opacity: 0.5; }
  40% { opacity: 1; }
}

.github-link {
  margin-bottom: 2rem;
  animation: fadeIn 1s ease-out 0.8s both;
  opacity: 0;
}

.github-profile-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(33, 38, 45, 0.6);
  border: 1px solid rgba(88, 166, 255, 0.3);
  border-radius: 25px;
  color: #58a6ff;
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(88, 166, 255, 0.1);
    border-color: #58a6ff;
    transform: translateY(-1px);
  }
}

.languages-section {
  margin-top: 1.5rem;
  animation: fadeIn 1s ease-out 1.2s both;
  opacity: 0;
}

.languages-title {
  font-size: 0.875rem;
  color: #8b949e;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.languages-list {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.language-tag {
  padding: 0.25rem 0.75rem;
  background: rgba(57, 211, 83, 0.1);
  border: 1px solid rgba(57, 211, 83, 0.3);
  border-radius: 15px;
  color: #39d353;
  font-size: 0.75rem;
  font-weight: 500;
  animation: popIn 0.3s ease-out forwards;
  opacity: 0;
  transform: scale(0.8);

  &:nth-child(1) { animation-delay: 1.3s; }
  &:nth-child(2) { animation-delay: 1.4s; }
  &:nth-child(3) { animation-delay: 1.5s; }
  &:nth-child(4) { animation-delay: 1.6s; }
  &:nth-child(5) { animation-delay: 1.7s; }
}

@keyframes popIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.cta-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.start-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 2.5rem;
  background: linear-gradient(135deg, #58a6ff, #39d353);
  border: none;
  border-radius: 50px;
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  animation: buttonPop 0.6s ease-out 0.5s both;
  transform: scale(0);

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 15px 35px rgba(88, 166, 255, 0.4);

    .button-glow {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
}

@keyframes buttonPop {
  0% { transform: scale(0); }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.button-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #58a6ff, #39d353, #58a6ff);
  background-size: 200% 200%;
  border-radius: 50px;
  z-index: -1;
  animation: glowRotate 2s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

@keyframes glowRotate {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.cta-subtext {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #656d76;
  font-size: 0.875rem;
  animation: fadeIn 1s ease-out 1s both;
  opacity: 0;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: filter 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #39d353;
  border-radius: 50%;
  animation: particleFloat linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
}

/* ===== ELEGANT LOADER ===== */
.elegant-loader {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(13, 17, 23, 0.85);
  backdrop-filter: blur(20px);
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  text-align: center;
  padding: 3rem;
  background: rgba(22, 27, 34, 0.8);
  border: 1px solid rgba(88, 166, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.git-logo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.git-icon {
  width: 80px;
  height: 80px;
  z-index: 2;
  position: relative;
}

.node {
  fill: #39d353;
  stroke: #39d353;
  stroke-width: 2;
  animation: nodeGlow 2s ease-in-out infinite;
}

.node-1 { animation-delay: 0s; }
.node-2 { animation-delay: 0.5s; }
.node-3 { animation-delay: 1s; }
.node-4 { animation-delay: 1.5s; }

@keyframes nodeGlow {
  0%, 100% {
    fill: #39d353;
    filter: drop-shadow(0 0 5px #39d353);
  }
  50% {
    fill: #58a6ff;
    filter: drop-shadow(0 0 15px #58a6ff);
  }
}

.connection {
  stroke: #58a6ff;
  stroke-width: 3;
  stroke-linecap: round;
  fill: none;
  opacity: 0.7;
  animation: connectionPulse 3s ease-in-out infinite;
}

.connection-1 { animation-delay: 0.2s; }
.connection-2 { animation-delay: 0.4s; }
.connection-3 { animation-delay: 0.6s; }
.connection-4 { animation-delay: 0.8s; }
.connection-main { animation-delay: 1s; }

@keyframes connectionPulse {
  0%, 100% {
    opacity: 0.7;
    stroke-width: 3;
  }
  50% {
    opacity: 1;
    stroke-width: 4;
    filter: drop-shadow(0 0 10px #58a6ff);
  }
}

.pulse-ring {
  position: absolute;
  inset: -20px;
  border: 2px solid rgba(57, 211, 83, 0.3);
  border-radius: 50%;
  animation: pulseRing 2s ease-out infinite;
}

.pulse-ring-2 {
  animation-delay: 1s;
  border-color: rgba(88, 166, 255, 0.3);
}

@keyframes pulseRing {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.125rem;
  color: #f0f6fc;
  font-weight: 500;
}

.loading-message {
  animation: fadeInOut 0.6s ease-in-out;
}

.loading-cursor {
  color: #39d353;
  animation: blink 1s infinite;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 300px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(48, 54, 61, 0.8);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #58a6ff, #39d353);
  border-radius: 10px;
  transition: width 0.6s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s ease-in-out infinite;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  color: #8b949e;
  font-weight: 500;
}

.loader-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.loader-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #39d353;
  border-radius: 50%;
  animation: loaderParticleFloat 3s ease-in-out infinite;
}

@keyframes loaderParticleFloat {
  0%, 100% {
    transform: translateY(0) scale(0.5);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1);
    opacity: 1;
  }
}

// Responsive
@media (max-width: 768px) {
  .intro-content {
    padding: 1rem;
  }

  .avatar {
    width: 100px;
    height: 100px;
  }

  .avatar-text {
    font-size: 2rem;
  }

  .stats-cards {
    flex-direction: column;
    align-items: center;
    max-width: 280px;
    margin: 0 auto 1.5rem;
  }

  .start-button {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .languages-list {
    max-width: 300px;
  }

  .loader-container {
    padding: 2rem;
    margin: 1rem;
  }

  .git-icon {
    width: 60px;
    height: 60px;
  }

  .progress-container {
    width: 250px;
  }
}
</style>

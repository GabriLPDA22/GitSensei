<template>
  <div class="commands">
    <div class="container">
      <!-- Header -->
      <div class="commands-header">
        <h1 class="commands-header__title">
          <BookOpen class="w-8 h-8" />
          Biblioteca de Comandos Git
        </h1>
        <p class="commands-header__subtitle">
          Tu guía de referencia rápida para todos los comandos de Git.
          Busca, aprende y domina la línea de comandos.
        </p>
      </div>

      <!-- Búsqueda y Filtros -->
      <div class="commands-filters">
        <div class="search-section">
          <div class="search-box">
            <Search class="w-5 h-5" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar comandos..."
              class="search-input"
            />
          </div>
          <div class="search-stats">
            <span class="search-stats__text">
              {{ filteredCommands.length }} comando{{ filteredCommands.length !== 1 ? 's' : '' }} encontrado{{ filteredCommands.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <div class="category-filters">
          <button
            v-for="category in categories"
            :key="category.value"
            class="category-filter"
            :class="{ 'category-filter--active': selectedCategory === category.value }"
            @click="selectedCategory = category.value"
          >
            <component :is="category.icon" class="w-4 h-4" />
            {{ category.label }}
          </button>
        </div>
      </div>

      <!-- Lista de Comandos -->
      <div class="commands-grid">
        <div
          v-for="command in filteredCommands"
          :key="command.id"
          class="command-card"
        >
          <div class="command-card__header">
            <div class="command-card__main">
              <h3 class="command-card__title">{{ command.name }}</h3>
              <p class="command-card__description">{{ command.description }}</p>
            </div>
            <div class="command-card__actions">
              <button
                @click="copyCommand(command.syntax)"
                class="action-button"
                title="Copiar comando"
              >
                <Copy class="w-4 h-4" />
              </button>
              <button
                @click="toggleFavorite(command.id)"
                class="action-button"
                :class="{ 'action-button--active': command.isFavorite }"
                title="Marcar como favorito"
              >
                <Heart class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="command-card__syntax">
            <div class="syntax-block">
              <span class="syntax-prompt">$</span>
              <code class="syntax-command">{{ command.syntax }}</code>
            </div>
          </div>

          <div v-if="command.examples && command.examples.length > 0" class="command-card__examples">
            <h4 class="examples-title">Ejemplos:</h4>
            <div class="examples-list">
              <div
                v-for="(example, index) in command.examples"
                :key="index"
                class="example-item"
              >
                <div class="example-command">
                  <code>{{ example.command }}</code>
                  <button
                    @click="copyCommand(example.command)"
                    class="copy-button"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
                <p class="example-description">{{ example.description }}</p>
              </div>
            </div>
          </div>

          <div v-if="command.options && command.options.length > 0" class="command-card__options">
            <h4 class="options-title">Opciones comunes:</h4>
            <div class="options-list">
              <div
                v-for="option in command.options"
                :key="option.flag"
                class="option-item"
              >
                <code class="option-flag">{{ option.flag }}</code>
                <span class="option-description">{{ option.description }}</span>
              </div>
            </div>
          </div>

          <div class="command-card__footer">
            <div class="command-tags">
              <span
                v-for="tag in command.tags"
                :key="tag"
                class="command-tag"
              >
                {{ tag }}
              </span>
            </div>
            <div class="command-difficulty">
              <span class="difficulty-label" :class="`difficulty--${command.difficulty}`">
                {{ getDifficultyLabel(command.difficulty) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="filteredCommands.length === 0" class="empty-state">
        <Search class="w-16 h-16 text-text-muted" />
        <h3 class="empty-state__title">No se encontraron comandos</h3>
        <p class="empty-state__text">
          Intenta buscar con otros términos o selecciona una categoría diferente.
        </p>
        <button @click="clearSearch" class="btn btn--secondary">
          Limpiar Búsqueda
        </button>
      </div>

      <!-- Sección de Favoritos -->
      <div v-if="favoriteCommands.length > 0" class="favorites-section">
        <h2 class="favorites-title">
          <Heart class="w-5 h-5" />
          Tus Comandos Favoritos
        </h2>
        <div class="favorites-grid">
          <div
            v-for="command in favoriteCommands"
            :key="`fav-${command.id}`"
            class="favorite-card"
          >
            <h4 class="favorite-card__title">{{ command.name }}</h4>
            <code class="favorite-card__syntax">{{ command.syntax }}</code>
            <button
              @click="copyCommand(command.syntax)"
              class="favorite-card__copy"
            >
              <Copy class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  BookOpen, Search, Copy, Heart, GitBranch, FileText,
  Share2, Settings, Zap, Archive
} from 'lucide-vue-next'

// Estado reactivo
const searchQuery = ref('')
const selectedCategory = ref('all')

// Datos
const categories = ref([
  { value: 'all', label: 'Todos', icon: FileText },
  { value: 'basics', label: 'Básicos', icon: FileText },
  { value: 'branching', label: 'Ramas', icon: GitBranch },
  { value: 'remote', label: 'Remotos', icon: Share2 },
  { value: 'advanced', label: 'Avanzado', icon: Zap },
  { value: 'config', label: 'Configuración', icon: Settings },
  { value: 'history', label: 'Historial', icon: Archive }
])

const commands = ref([
  {
    id: 'git-init',
    name: 'git init',
    description: 'Inicializa un nuevo repositorio Git',
    syntax: 'git init [directory]',
    category: 'basics',
    difficulty: 'beginner',
    tags: ['inicializar', 'repositorio', 'nuevo'],
    isFavorite: false,
    examples: [
      {
        command: 'git init',
        description: 'Inicializa un repositorio en el directorio actual'
      },
      {
        command: 'git init mi-proyecto',
        description: 'Crea un nuevo directorio e inicializa un repositorio'
      }
    ],
    options: []
  },
  {
    id: 'git-clone',
    name: 'git clone',
    description: 'Clona un repositorio remoto',
    syntax: 'git clone <url> [directory]',
    category: 'remote',
    difficulty: 'beginner',
    tags: ['clonar', 'remoto', 'descargar'],
    isFavorite: true,
    examples: [
      {
        command: 'git clone https://github.com/user/repo.git',
        description: 'Clona un repositorio desde GitHub'
      },
      {
        command: 'git clone https://github.com/user/repo.git mi-copia',
        description: 'Clona en un directorio específico'
      }
    ],
    options: [
      { flag: '--depth <n>', description: 'Crea un clon superficial con historial limitado' },
      { flag: '--branch <name>', description: 'Clona una rama específica' }
    ]
  },
  {
    id: 'git-add',
    name: 'git add',
    description: 'Añade archivos al área de preparación (staging)',
    syntax: 'git add <file>',
    category: 'basics',
    difficulty: 'beginner',
    tags: ['añadir', 'staging', 'preparar'],
    isFavorite: true,
    examples: [
      {
        command: 'git add archivo.txt',
        description: 'Añade un archivo específico'
      },
      {
        command: 'git add .',
        description: 'Añade todos los archivos modificados'
      },
      {
        command: 'git add *.js',
        description: 'Añade todos los archivos JavaScript'
      }
    ],
    options: [
      { flag: '-A', description: 'Añade todos los archivos (incluyendo eliminados)' },
      { flag: '-p', description: 'Añade de forma interactiva por partes' }
    ]
  },
  {
    id: 'git-commit',
    name: 'git commit',
    description: 'Crea un commit con los cambios en staging',
    syntax: 'git commit -m "mensaje"',
    category: 'basics',
    difficulty: 'beginner',
    tags: ['commit', 'guardar', 'mensaje'],
    isFavorite: true,
    examples: [
      {
        command: 'git commit -m "Add new feature"',
        description: 'Commit con mensaje inline'
      },
      {
        command: 'git commit -am "Fix bug"',
        description: 'Añade y hace commit en un comando'
      }
    ],
    options: [
      { flag: '-m', description: 'Especifica el mensaje de commit' },
      { flag: '-a', description: 'Añade automáticamente archivos modificados' },
      { flag: '--amend', description: 'Modifica el último commit' }
    ]
  },
  {
    id: 'git-branch',
    name: 'git branch',
    description: 'Lista, crea o elimina ramas',
    syntax: 'git branch [options] [name]',
    category: 'branching',
    difficulty: 'intermediate',
    tags: ['ramas', 'branch', 'crear'],
    isFavorite: false,
    examples: [
      {
        command: 'git branch',
        description: 'Lista todas las ramas locales'
      },
      {
        command: 'git branch nueva-feature',
        description: 'Crea una nueva rama'
      },
      {
        command: 'git branch -d feature-branch',
        description: 'Elimina una rama'
      }
    ],
    options: [
      { flag: '-a', description: 'Muestra todas las ramas (locales y remotas)' },
      { flag: '-d', description: 'Elimina una rama' },
      { flag: '-m', description: 'Renombra una rama' }
    ]
  },
  {
    id: 'git-checkout',
    name: 'git checkout',
    description: 'Cambia entre ramas o restaura archivos',
    syntax: 'git checkout <branch>',
    category: 'branching',
    difficulty: 'intermediate',
    tags: ['cambiar', 'rama', 'switch'],
    isFavorite: false,
    examples: [
      {
        command: 'git checkout main',
        description: 'Cambia a la rama main'
      },
      {
        command: 'git checkout -b nueva-feature',
        description: 'Crea y cambia a una nueva rama'
      }
    ],
    options: [
      { flag: '-b', description: 'Crea una nueva rama y cambia a ella' },
      { flag: '--', description: 'Restaura archivos del último commit' }
    ]
  },
  {
    id: 'git-merge',
    name: 'git merge',
    description: 'Fusiona una rama con la rama actual',
    syntax: 'git merge <branch>',
    category: 'branching',
    difficulty: 'intermediate',
    tags: ['fusionar', 'merge', 'combinar'],
    isFavorite: false,
    examples: [
      {
        command: 'git merge feature-branch',
        description: 'Fusiona feature-branch en la rama actual'
      },
      {
        command: 'git merge --no-ff feature-branch',
        description: 'Fusiona sin fast-forward'
      }
    ],
    options: [
      { flag: '--no-ff', description: 'Crea un commit de merge sin fast-forward' },
      { flag: '--squash', description: 'Combina todos los commits en uno' }
    ]
  },
  {
    id: 'git-push',
    name: 'git push',
    description: 'Sube commits al repositorio remoto',
    syntax: 'git push [remote] [branch]',
    category: 'remote',
    difficulty: 'intermediate',
    tags: ['subir', 'push', 'remoto'],
    isFavorite: true,
    examples: [
      {
        command: 'git push origin main',
        description: 'Sube la rama main al remoto origin'
      },
      {
        command: 'git push -u origin feature-branch',
        description: 'Sube y establece seguimiento de rama'
      }
    ],
    options: [
      { flag: '-u', description: 'Establece upstream para la rama' },
      { flag: '--force', description: 'Fuerza el push (usar con cuidado)' },
      { flag: '--tags', description: 'Sube también los tags' }
    ]
  }
])

// Computed
const filteredCommands = computed(() => {
  let filtered = commands.value

  // Filtrar por categoría
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(cmd => cmd.category === selectedCategory.value)
  }

  // Filtrar por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(cmd =>
      cmd.name.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.syntax.toLowerCase().includes(query) ||
      cmd.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

const favoriteCommands = computed(() => {
  return commands.value.filter(cmd => cmd.isFavorite)
})

// Métodos
const copyCommand = async (command) => {
  try {
    await navigator.clipboard.writeText(command)
    // Mostrar notificación de copiado
    if (window.addToast) {
      window.addToast(`Comando copiado: ${command}`, 'success', 2000)
    }
  } catch (err) {
    console.error('Error copying command:', err)
  }
}

const toggleFavorite = (commandId) => {
  const command = commands.value.find(cmd => cmd.id === commandId)
  if (command) {
    command.isFavorite = !command.isFavorite
  }
}

const getDifficultyLabel = (difficulty) => {
  const labels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  }
  return labels[difficulty] || difficulty
}

const clearSearch = () => {
  searchQuery.value = ''
  selectedCategory.value = 'all'
}

// Lifecycle
onMounted(() => {
  // Cargar favoritos del localStorage si existe
  const savedFavorites = localStorage.getItem('git-commands-favorites')
  if (savedFavorites) {
    const favorites = JSON.parse(savedFavorites)
    commands.value.forEach(cmd => {
      cmd.isFavorite = favorites.includes(cmd.id)
    })
  }
})

// Watcher para guardar favoritos
watch(() => favoriteCommands.value, (newFavorites) => {
  const favoriteIds = newFavorites.map(cmd => cmd.id)
  localStorage.setItem('git-commands-favorites', JSON.stringify(favoriteIds))
}, { deep: true })
</script>

<style lang="scss" scoped>
.commands {
  min-height: 100vh;
  background: $primary-dark;
  padding: 2rem 0;
}

// Header
.commands-header {
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
.commands-filters {
  background: $secondary-dark;
  border: 1px solid $border;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.search-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;

  @include mobile-only {
    flex-direction: column;
    align-items: stretch;
  }
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 500px;

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
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: $tertiary-dark;
  border: 1px solid $border;
  border-radius: 0.5rem;
  color: $text-primary;
  font-size: 1rem;
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

.search-stats {
  &__text {
    font-size: 0.875rem;
    color: $text-secondary;
    white-space: nowrap;
  }
}

.category-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-filter {
  @include flex-center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: $tertiary-dark;
  border: 1px solid $border;
  border-radius: 0.5rem;
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

// Grid de comandos
.commands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  @include mobile-only {
    grid-template-columns: 1fr;
  }
}

.command-card {
  @include card-base;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__header {
    @include flex-between;
    align-items: flex-start;
    gap: 1rem;
  }

  &__main {
    flex: 1;
  }

  &__title {
    font-family: $font-mono;
    font-size: 1.125rem;
    font-weight: 600;
    color: $accent-blue;
    margin-bottom: 0.5rem;
  }

  &__description {
    color: $text-secondary;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
  }

  &__syntax {
    background: $primary-dark;
    border: 1px solid $border;
    border-radius: 0.5rem;
    padding: 1rem;
    font-family: $font-mono;
  }

  &__examples,
  &__options {
    background: $tertiary-dark;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  &__footer {
    @include flex-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid $border;
  }
}

.syntax-block {
  @include flex-center;
  gap: 0.5rem;
  justify-content: flex-start;
}

.syntax-prompt {
  color: $accent-green;
  font-weight: 600;
}

.syntax-command {
  color: $text-primary;
}

.action-button {
  @include flex-center;
  width: 2rem;
  height: 2rem;
  background: $tertiary-dark;
  border: 1px solid $border;
  border-radius: 0.25rem;
  color: $text-secondary;
  cursor: pointer;
  @include transition();

  &:hover {
    color: $text-primary;
    border-color: $accent-blue;
  }

  &--active {
    color: $danger;
    border-color: $danger;
  }
}

.examples-title,
.options-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 0.75rem;
}

.examples-list,
.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.example-item {
  border-left: 2px solid $accent-blue;
  padding-left: 0.75rem;
}

.example-command {
  @include flex-between;
  align-items: center;
  margin-bottom: 0.25rem;

  code {
    font-family: $font-mono;
    color: $accent-blue;
    background: none;
    padding: 0;
  }
}

.copy-button {
  @include flex-center;
  width: 1.5rem;
  height: 1.5rem;
  background: none;
  border: none;
  color: $text-muted;
  cursor: pointer;
  border-radius: 0.25rem;
  @include transition();

  &:hover {
    color: $accent-blue;
    background: rgba($accent-blue, 0.1);
  }
}

.example-description {
  color: $text-secondary;
  font-size: 0.875rem;
}

.option-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.option-flag {
  font-family: $font-mono;
  color: $warning;
  background: none;
  padding: 0;
  flex-shrink: 0;
}

.option-description {
  color: $text-secondary;
  font-size: 0.875rem;
  line-height: 1.4;
}

.command-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.command-tag {
  @include badge-base;
  background: rgba($accent-blue, 0.1);
  color: $accent-blue;
  border: 1px solid rgba($accent-blue, 0.2);
  font-size: 0.75rem;
}

.command-difficulty {
  .difficulty-label {
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
}

// Favoritos
.favorites-section {
  background: $secondary-dark;
  border: 1px solid $border;
  border-radius: 0.75rem;
  padding: 2rem;
  margin-top: 3rem;
}

.favorites-title {
  @include flex-center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 1.5rem;
  justify-content: flex-start;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.favorite-card {
  position: relative;
  padding: 1rem;
  background: $tertiary-dark;
  border: 1px solid $border;
  border-radius: 0.5rem;
  @include transition();

  &:hover {
    border-color: $accent-blue;
  }

  &__title {
    font-family: $font-mono;
    font-size: 0.875rem;
    font-weight: 600;
    color: $accent-blue;
    margin-bottom: 0.5rem;
  }

  &__syntax {
    font-family: $font-mono;
    font-size: 0.75rem;
    color: $text-secondary;
    background: none;
    padding: 0;
    word-break: break-all;
  }

  &__copy {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    @include flex-center;
    width: 1.5rem;
    height: 1.5rem;
    background: none;
    border: none;
    color: $text-muted;
    cursor: pointer;
    border-radius: 0.25rem;
    @include transition();

    &:hover {
      color: $accent-blue;
      background: rgba($accent-blue, 0.1);
    }
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

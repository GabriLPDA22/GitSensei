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
          Tu guía de referencia completa con {{ commands.length }} comandos de Git.
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

        <div class="filter-row">
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

          <div class="difficulty-filters">
            <span class="filter-label">Dificultad:</span>
            <button
              v-for="difficulty in difficulties"
              :key="difficulty.value"
              class="difficulty-filter"
              :class="{ 'difficulty-filter--active': selectedDifficulty === difficulty.value }"
              @click="selectedDifficulty = difficulty.value"
            >
              {{ difficulty.label }}
            </button>
          </div>
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
  Share2, Settings, Zap, Archive, Terminal, Folder
} from 'lucide-vue-next'

// Estado reactivo
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedDifficulty = ref('all')

// Datos
const categories = ref([
  { value: 'all', label: 'Todos', icon: FileText },
  { value: 'basics', label: 'Básicos', icon: FileText },
  { value: 'branching', label: 'Ramas', icon: GitBranch },
  { value: 'remote', label: 'Remotos', icon: Share2 },
  { value: 'staging', label: 'Staging', icon: Folder },
  { value: 'history', label: 'Historial', icon: Archive },
  { value: 'advanced', label: 'Avanzado', icon: Zap },
  { value: 'config', label: 'Configuración', icon: Settings },
  { value: 'workflow', label: 'Workflow', icon: Terminal }
])

const difficulties = ref([
  { value: 'all', label: 'Todas' },
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' }
])

const commands = ref([
  // ===== COMANDOS BÁSICOS =====
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
      { command: 'git init', description: 'Inicializa un repositorio en el directorio actual' },
      { command: 'git init mi-proyecto', description: 'Crea un nuevo directorio e inicializa un repositorio' },
      { command: 'git init --bare', description: 'Crea un repositorio bare (sin directorio de trabajo)' }
    ],
    options: [
      { flag: '--bare', description: 'Crea un repositorio bare sin directorio de trabajo' },
      { flag: '--quiet', description: 'Solo muestra mensajes de error' }
    ]
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
      { command: 'git clone https://github.com/user/repo.git', description: 'Clona un repositorio desde GitHub' },
      { command: 'git clone https://github.com/user/repo.git mi-copia', description: 'Clona en un directorio específico' },
      { command: 'git clone --depth 1 https://github.com/user/repo.git', description: 'Clona solo el último commit' }
    ],
    options: [
      { flag: '--depth <n>', description: 'Crea un clon superficial con historial limitado' },
      { flag: '--branch <name>', description: 'Clona una rama específica' },
      { flag: '--single-branch', description: 'Clona solo una rama' }
    ]
  },
  {
    id: 'git-add',
    name: 'git add',
    description: 'Añade archivos al área de preparación (staging)',
    syntax: 'git add <file>',
    category: 'staging',
    difficulty: 'beginner',
    tags: ['añadir', 'staging', 'preparar'],
    isFavorite: true,
    examples: [
      { command: 'git add archivo.txt', description: 'Añade un archivo específico' },
      { command: 'git add .', description: 'Añade todos los archivos modificados' },
      { command: 'git add *.js', description: 'Añade todos los archivos JavaScript' },
      { command: 'git add -A', description: 'Añade todos los cambios (incluyendo eliminados)' }
    ],
    options: [
      { flag: '-A', description: 'Añade todos los archivos (incluyendo eliminados)' },
      { flag: '-p', description: 'Añade de forma interactiva por partes' },
      { flag: '-u', description: 'Solo añade archivos que ya están siendo rastreados' }
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
      { command: 'git commit -m "Add new feature"', description: 'Commit con mensaje inline' },
      { command: 'git commit -am "Fix bug"', description: 'Añade y hace commit en un comando' },
      { command: 'git commit --amend', description: 'Modifica el último commit' }
    ],
    options: [
      { flag: '-m', description: 'Especifica el mensaje de commit' },
      { flag: '-a', description: 'Añade automáticamente archivos modificados' },
      { flag: '--amend', description: 'Modifica el último commit' },
      { flag: '--no-edit', description: 'Usa el mensaje del commit anterior' }
    ]
  },
  {
    id: 'git-status',
    name: 'git status',
    description: 'Muestra el estado del directorio de trabajo',
    syntax: 'git status',
    category: 'basics',
    difficulty: 'beginner',
    tags: ['estado', 'cambios', 'información'],
    isFavorite: false,
    examples: [
      { command: 'git status', description: 'Muestra el estado completo' },
      { command: 'git status -s', description: 'Muestra un resumen corto' },
      { command: 'git status --porcelain', description: 'Formato para scripts' }
    ],
    options: [
      { flag: '-s', description: 'Muestra un resumen corto' },
      { flag: '--porcelain', description: 'Formato para scripts' },
      { flag: '--ignored', description: 'Muestra también archivos ignorados' }
    ]
  },

  // ===== COMANDOS DE RAMAS =====
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
      { command: 'git branch', description: 'Lista todas las ramas locales' },
      { command: 'git branch nueva-feature', description: 'Crea una nueva rama' },
      { command: 'git branch -d feature-branch', description: 'Elimina una rama' },
      { command: 'git branch -a', description: 'Lista todas las ramas (locales y remotas)' }
    ],
    options: [
      { flag: '-a', description: 'Muestra todas las ramas (locales y remotas)' },
      { flag: '-d', description: 'Elimina una rama' },
      { flag: '-D', description: 'Fuerza la eliminación de una rama' },
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
      { command: 'git checkout main', description: 'Cambia a la rama main' },
      { command: 'git checkout -b nueva-feature', description: 'Crea y cambia a una nueva rama' },
      { command: 'git checkout -- archivo.txt', description: 'Restaura un archivo' }
    ],
    options: [
      { flag: '-b', description: 'Crea una nueva rama y cambia a ella' },
      { flag: '--', description: 'Restaura archivos del último commit' },
      { flag: '-f', description: 'Fuerza el cambio de rama' }
    ]
  },
  {
    id: 'git-switch',
    name: 'git switch',
    description: 'Cambia entre ramas (comando moderno)',
    syntax: 'git switch <branch>',
    category: 'branching',
    difficulty: 'beginner',
    tags: ['cambiar', 'rama', 'moderno'],
    isFavorite: false,
    examples: [
      { command: 'git switch main', description: 'Cambia a la rama main' },
      { command: 'git switch -c nueva-feature', description: 'Crea y cambia a una nueva rama' },
      { command: 'git switch -', description: 'Cambia a la rama anterior' }
    ],
    options: [
      { flag: '-c', description: 'Crea una nueva rama y cambia a ella' },
      { flag: '-C', description: 'Fuerza la creación y cambio a una nueva rama' },
      { flag: '-', description: 'Cambia a la rama anterior' }
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
      { command: 'git merge feature-branch', description: 'Fusiona feature-branch en la rama actual' },
      { command: 'git merge --no-ff feature-branch', description: 'Fusiona sin fast-forward' },
      { command: 'git merge --squash feature-branch', description: 'Combina todos los commits en uno' }
    ],
    options: [
      { flag: '--no-ff', description: 'Crea un commit de merge sin fast-forward' },
      { flag: '--squash', description: 'Combina todos los commits en uno' },
      { flag: '--abort', description: 'Cancela el merge en curso' }
    ]
  },

  // ===== COMANDOS REMOTOS =====
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
      { command: 'git push origin main', description: 'Sube la rama main al remoto origin' },
      { command: 'git push -u origin feature-branch', description: 'Sube y establece seguimiento de rama' },
      { command: 'git push --tags', description: 'Sube también los tags' }
    ],
    options: [
      { flag: '-u', description: 'Establece upstream para la rama' },
      { flag: '--force', description: 'Fuerza el push (usar con cuidado)' },
      { flag: '--tags', description: 'Sube también los tags' },
      { flag: '--delete', description: 'Elimina una rama remota' }
    ]
  },
  {
    id: 'git-pull',
    name: 'git pull',
    description: 'Descarga cambios del remoto y los fusiona',
    syntax: 'git pull [remote] [branch]',
    category: 'remote',
    difficulty: 'intermediate',
    tags: ['descargar', 'pull', 'fusionar'],
    isFavorite: true,
    examples: [
      { command: 'git pull origin main', description: 'Descarga y fusiona cambios de main' },
      { command: 'git pull --rebase', description: 'Usa rebase en lugar de merge' },
      { command: 'git pull --ff-only', description: 'Solo fast-forward' }
    ],
    options: [
      { flag: '--rebase', description: 'Usa rebase en lugar de merge' },
      { flag: '--ff-only', description: 'Solo permite fast-forward' },
      { flag: '--no-commit', description: 'No hace commit automático' }
    ]
  },
  {
    id: 'git-fetch',
    name: 'git fetch',
    description: 'Descarga cambios sin fusionar',
    syntax: 'git fetch [remote]',
    category: 'remote',
    difficulty: 'intermediate',
    tags: ['descargar', 'fetch', 'remoto'],
    isFavorite: false,
    examples: [
      { command: 'git fetch origin', description: 'Descarga cambios del remoto origin' },
      { command: 'git fetch --all', description: 'Descarga de todos los remotos' },
      { command: 'git fetch --prune', description: 'Elimina referencias a ramas remotas eliminadas' }
    ],
    options: [
      { flag: '--all', description: 'Descarga de todos los remotos' },
      { flag: '--prune', description: 'Elimina referencias obsoletas' },
      { flag: '--tags', description: 'Descarga todos los tags' }
    ]
  },
  {
    id: 'git-remote',
    name: 'git remote',
    description: 'Gestiona repositorios remotos',
    syntax: 'git remote [subcommand]',
    category: 'remote',
    difficulty: 'intermediate',
    tags: ['remoto', 'gestionar', 'configurar'],
    isFavorite: false,
    examples: [
      { command: 'git remote -v', description: 'Lista todos los remotos con URLs' },
      { command: 'git remote add origin https://github.com/user/repo.git', description: 'Añade un remoto' },
      { command: 'git remote remove origin', description: 'Elimina un remoto' }
    ],
    options: [
      { flag: '-v', description: 'Muestra URLs de los remotos' },
      { flag: 'add', description: 'Añade un nuevo remoto' },
      { flag: 'remove', description: 'Elimina un remoto' },
      { flag: 'rename', description: 'Renombra un remoto' }
    ]
  },

  // ===== COMANDOS DE HISTORIAL =====
  {
    id: 'git-log',
    name: 'git log',
    description: 'Muestra el historial de commits',
    syntax: 'git log [options]',
    category: 'history',
    difficulty: 'beginner',
    tags: ['historial', 'log', 'commits'],
    isFavorite: false,
    examples: [
      { command: 'git log', description: 'Muestra el historial completo' },
      { command: 'git log --oneline', description: 'Muestra una línea por commit' },
      { command: 'git log --graph', description: 'Muestra gráfico de ramas' },
      { command: 'git log -5', description: 'Muestra los últimos 5 commits' }
    ],
    options: [
      { flag: '--oneline', description: 'Una línea por commit' },
      { flag: '--graph', description: 'Muestra gráfico ASCII' },
      { flag: '--stat', description: 'Muestra estadísticas de archivos' },
      { flag: '--since="date"', description: 'Commits desde una fecha' }
    ]
  },
  {
    id: 'git-show',
    name: 'git show',
    description: 'Muestra información sobre un commit específico',
    syntax: 'git show <commit>',
    category: 'history',
    difficulty: 'beginner',
    tags: ['mostrar', 'commit', 'información'],
    isFavorite: false,
    examples: [
      { command: 'git show HEAD', description: 'Muestra el último commit' },
      { command: 'git show abc123', description: 'Muestra un commit específico' },
      { command: 'git show --name-only', description: 'Solo muestra nombres de archivos' }
    ],
    options: [
      { flag: '--name-only', description: 'Solo muestra nombres de archivos' },
      { flag: '--stat', description: 'Muestra estadísticas' },
      { flag: '--pretty=format', description: 'Formato personalizado' }
    ]
  },
  {
    id: 'git-diff',
    name: 'git diff',
    description: 'Muestra diferencias entre commits, ramas o archivos',
    syntax: 'git diff [options]',
    category: 'history',
    difficulty: 'beginner',
    tags: ['diferencias', 'diff', 'cambios'],
    isFavorite: false,
    examples: [
      { command: 'git diff', description: 'Muestra cambios no preparados' },
      { command: 'git diff --staged', description: 'Muestra cambios en staging' },
      { command: 'git diff HEAD~1', description: 'Compara con el commit anterior' },
      { command: 'git diff branch1 branch2', description: 'Compara dos ramas' }
    ],
    options: [
      { flag: '--staged', description: 'Muestra cambios en staging' },
      { flag: '--name-only', description: 'Solo nombres de archivos' },
      { flag: '--word-diff', description: 'Diferencias palabra por palabra' }
    ]
  },

  // ===== COMANDOS AVANZADOS =====
  {
    id: 'git-rebase',
    name: 'git rebase',
    description: 'Reaplica commits sobre otra base',
    syntax: 'git rebase <branch>',
    category: 'advanced',
    difficulty: 'advanced',
    tags: ['rebase', 'reescribir', 'historial'],
    isFavorite: false,
    examples: [
      { command: 'git rebase main', description: 'Rebase la rama actual sobre main' },
      { command: 'git rebase -i HEAD~3', description: 'Rebase interactivo de los últimos 3 commits' },
      { command: 'git rebase --continue', description: 'Continúa un rebase pausado' }
    ],
    options: [
      { flag: '-i', description: 'Rebase interactivo' },
      { flag: '--continue', description: 'Continúa después de resolver conflictos' },
      { flag: '--abort', description: 'Cancela el rebase' },
      { flag: '--onto', description: 'Especifica una base diferente' }
    ]
  },
  {
    id: 'git-cherry-pick',
    name: 'git cherry-pick',
    description: 'Aplica un commit específico a la rama actual',
    syntax: 'git cherry-pick <commit>',
    category: 'advanced',
    difficulty: 'advanced',
    tags: ['cherry-pick', 'aplicar', 'commit'],
    isFavorite: false,
    examples: [
      { command: 'git cherry-pick abc123', description: 'Aplica el commit abc123' },
      { command: 'git cherry-pick abc123 def456', description: 'Aplica múltiples commits' },
      { command: 'git cherry-pick --no-commit abc123', description: 'Aplica sin hacer commit' }
    ],
    options: [
      { flag: '--no-commit', description: 'Aplica sin hacer commit automático' },
      { flag: '--continue', description: 'Continúa después de resolver conflictos' },
      { flag: '--abort', description: 'Cancela el cherry-pick' }
    ]
  },
  {
    id: 'git-reset',
    name: 'git reset',
    description: 'Resetea el HEAD a un estado específico',
    syntax: 'git reset [options] <commit>',
    category: 'advanced',
    difficulty: 'advanced',
    tags: ['reset', 'deshacer', 'head'],
    isFavorite: false,
    examples: [
      { command: 'git reset HEAD~1', description: 'Deshace el último commit (mantiene cambios)' },
      { command: 'git reset --hard HEAD~1', description: 'Deshace el último commit (elimina cambios)' },
      { command: 'git reset --soft HEAD~1', description: 'Deshace commit pero mantiene staging' }
    ],
    options: [
      { flag: '--soft', description: 'Mantiene cambios en staging' },
      { flag: '--mixed', description: 'Mantiene cambios en working directory (por defecto)' },
      { flag: '--hard', description: 'Elimina todos los cambios' }
    ]
  },
  {
    id: 'git-stash',
    name: 'git stash',
    description: 'Guarda temporalmente cambios sin hacer commit',
    syntax: 'git stash [subcommand]',
    category: 'workflow',
    difficulty: 'intermediate',
    tags: ['stash', 'guardar', 'temporal'],
    isFavorite: false,
    examples: [
      { command: 'git stash', description: 'Guarda cambios actuales' },
      { command: 'git stash pop', description: 'Aplica y elimina el último stash' },
      { command: 'git stash list', description: 'Lista todos los stashes' },
      { command: 'git stash drop', description: 'Elimina el último stash' }
    ],
    options: [
      { flag: 'push', description: 'Guarda cambios (comando explícito)' },
      { flag: 'pop', description: 'Aplica y elimina el último stash' },
      { flag: 'apply', description: 'Aplica el stash sin eliminarlo' },
      { flag: 'list', description: 'Lista todos los stashes' }
    ]
  },

  // ===== COMANDOS DE CONFIGURACIÓN =====
  {
    id: 'git-config',
    name: 'git config',
    description: 'Configura opciones de Git',
    syntax: 'git config [scope] <key> <value>',
    category: 'config',
    difficulty: 'beginner',
    tags: ['configurar', 'config', 'ajustes'],
    isFavorite: false,
    examples: [
      { command: 'git config --global user.name "Tu Nombre"', description: 'Configura tu nombre globalmente' },
      { command: 'git config --global user.email "tu@email.com"', description: 'Configura tu email' },
      { command: 'git config --list', description: 'Lista toda la configuración' }
    ],
    options: [
      { flag: '--global', description: 'Configuración global para todos los repos' },
      { flag: '--local', description: 'Configuración solo para el repo actual' },
      { flag: '--list', description: 'Lista toda la configuración' },
      { flag: '--unset', description: 'Elimina una configuración' }
    ]
  },
  {
    id: 'git-tag',
    name: 'git tag',
    description: 'Crea, lista o elimina tags',
    syntax: 'git tag [options] <tagname>',
    category: 'workflow',
    difficulty: 'intermediate',
    tags: ['tag', 'etiqueta', 'versión'],
    isFavorite: false,
    examples: [
      { command: 'git tag v1.0.0', description: 'Crea un tag ligero' },
      { command: 'git tag -a v1.0.0 -m "Version 1.0.0"', description: 'Crea un tag anotado' },
      { command: 'git tag -l', description: 'Lista todos los tags' }
    ],
    options: [
      { flag: '-a', description: 'Crea un tag anotado' },
      { flag: '-m', description: 'Mensaje para el tag anotado' },
      { flag: '-l', description: 'Lista todos los tags' },
      { flag: '-d', description: 'Elimina un tag' }
    ]
  },

  // ===== COMANDOS DE STAGING =====
  {
    id: 'git-restore',
    name: 'git restore',
    description: 'Restaura archivos del working tree',
    syntax: 'git restore [options] <file>',
    category: 'staging',
    difficulty: 'beginner',
    tags: ['restaurar', 'restore', 'deshacer'],
    isFavorite: false,
    examples: [
      { command: 'git restore archivo.txt', description: 'Restaura un archivo del último commit' },
      { command: 'git restore --staged archivo.txt', description: 'Quita un archivo del staging' },
      { command: 'git restore .', description: 'Restaura todos los archivos' }
    ],
    options: [
      { flag: '--staged', description: 'Restaura archivos del staging area' },
      { flag: '--source=<commit>', description: 'Especifica desde qué commit restaurar' },
      { flag: '--worktree', description: 'Restaura en el directorio de trabajo (por defecto)' }
    ]
  },
  {
    id: 'git-rm',
    name: 'git rm',
    description: 'Elimina archivos del repositorio',
    syntax: 'git rm [options] <file>',
    category: 'staging',
    difficulty: 'beginner',
    tags: ['eliminar', 'remove', 'borrar'],
    isFavorite: false,
    examples: [
      { command: 'git rm archivo.txt', description: 'Elimina un archivo del repo y disco' },
      { command: 'git rm --cached archivo.txt', description: 'Elimina del repo pero mantiene en disco' },
      { command: 'git rm -r carpeta/', description: 'Elimina una carpeta recursivamente' }
    ],
    options: [
      { flag: '--cached', description: 'Solo elimina del índice, mantiene en disco' },
      { flag: '-r', description: 'Elimina recursivamente' },
      { flag: '-f', description: 'Fuerza la eliminación' }
    ]
  },
  {
    id: 'git-mv',
    name: 'git mv',
    description: 'Mueve o renombra archivos',
    syntax: 'git mv <source> <destination>',
    category: 'staging',
    difficulty: 'beginner',
    tags: ['mover', 'renombrar', 'move'],
    isFavorite: false,
    examples: [
      { command: 'git mv archivo.txt nuevo_nombre.txt', description: 'Renombra un archivo' },
      { command: 'git mv archivo.txt carpeta/', description: 'Mueve un archivo a una carpeta' },
      { command: 'git mv carpeta1/ carpeta2/', description: 'Renombra una carpeta' }
    ],
    options: [
      { flag: '-f', description: 'Fuerza el movimiento' },
      { flag: '-k', description: 'Continúa con otros archivos si hay errores' }
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

  // Filtrar por dificultad
  if (selectedDifficulty.value !== 'all') {
    filtered = filtered.filter(cmd => cmd.difficulty === selectedDifficulty.value)
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
  selectedDifficulty.value = 'all'
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

.filter-row {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;

  @include mobile-only {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}

.category-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
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

.difficulty-filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-label {
  font-size: 0.875rem;
  color: $text-secondary;
  white-space: nowrap;
}

.difficulty-filter {
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid $border;
  border-radius: 9999px;
  color: $text-secondary;
  font-size: 0.75rem;
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

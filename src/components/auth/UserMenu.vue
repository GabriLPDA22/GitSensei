<template>
  <div class="user-menu" v-if="isAuthenticated">
    <div class="user-trigger" @click="toggleMenu" ref="triggerRef">
      <img :src="userAvatar" :alt="userName" class="user-avatar" />
      <span class="user-name">{{ userName }}</span>
      <ChevronDown class="w-4 h-4 chevron" :class="{ 'chevron--open': isMenuOpen }" />
    </div>

    <!-- Dropdown Menu -->
    <transition name="menu">
      <div v-if="isMenuOpen" class="user-dropdown" ref="dropdownRef">
        <div class="dropdown-header">
          <img :src="userAvatar" :alt="userName" class="dropdown-avatar">
          <div class="dropdown-info">
            <h4 class="dropdown-name">{{ userName }}</h4>
            <p class="dropdown-username">@{{ user.login }}</p>
          </div>
        </div>

        <div class="dropdown-divider"></div>

        <div class="dropdown-menu">
          <a :href="userProfile" target="_blank" class="dropdown-item">
            <ExternalLink class="w-4 h-4" />
            Ver perfil en GitHub
          </a>

          <router-link to="/profile" class="dropdown-item">
            <User class="w-4 h-4" />
            Mi perfil
          </router-link>

          <router-link to="/dashboard" class="dropdown-item">
            <BarChart3 class="w-4 h-4" />
            Dashboard
          </router-link>

          <div class="dropdown-divider"></div>

          <button @click="handleLogout" class="dropdown-item dropdown-item--danger">
            <LogOut class="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import {
  ChevronDown, ExternalLink, User, BarChart3, LogOut
} from 'lucide-vue-next'

const authStore = useAuthStore()
const {
  isAuthenticated,
  user,
  userAvatar,
  userName,
  userProfile
} = storeToRefs(authStore)

const isMenuOpen = ref(false)
const triggerRef = ref(null)
const dropdownRef = ref(null)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleLogout = () => {
  authStore.logout()
  closeMenu()
}

// Cerrar menú al hacer click fuera
const handleClickOutside = (event) => {
  if (
    triggerRef.value &&
    dropdownRef.value &&
    !triggerRef.value.contains(event.target) &&
    !dropdownRef.value.contains(event.target)
  ) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.user-menu {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(177, 186, 196, 0.12);
  }
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid rgba(88, 166, 255, 0.3);
  transition: border-color 0.2s ease;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #f0f6fc;

  @media (max-width: 768px) {
    display: none;
  }
}

.chevron {
  color: #8b949e;
  transition: transform 0.2s ease;

  &--open {
    transform: rotate(180deg);
  }
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 240px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  box-shadow: 0 16px 32px rgba(1, 4, 9, 0.85);
  z-index: 50;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #161b22;
}

.dropdown-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 2px solid rgba(88, 166, 255, 0.3);
}

.dropdown-info {
  flex: 1;
  min-width: 0;
}

.dropdown-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f0f6fc;
  margin: 0;
  line-height: 1.2;
}

.dropdown-username {
  font-size: 0.75rem;
  color: #8b949e;
  margin: 0;
  line-height: 1.2;
}

.dropdown-divider {
  height: 1px;
  background: #30363d;
  margin: 0.5rem 0;
}

.dropdown-menu {
  padding: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #f0f6fc;
  font-size: 0.875rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #30363d;
    color: #f0f6fc;
  }

  &--danger {
    color: #f85149;

    &:hover {
      background: rgba(248, 81, 73, 0.15);
      color: #f85149;
    }
  }

  .lucide {
    color: #8b949e;
    flex-shrink: 0;
  }
}

// Animaciones del menú
.menu-enter-active {
  transition: all 0.15s ease-out;
}

.menu-leave-active {
  transition: all 0.1s ease-in;
}

.menu-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.menu-enter-to,
.menu-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>

<template>
  <button @click="handleLogin" :disabled="isLoading" class="login-button"
    :class="{ 'login-button--loading': isLoading }">
    <div class="login-button__content">
      <Github class="w-5 h-5" />
      <span>{{ isLoading ? 'Conectando...' : 'Entrar con GitHub' }}</span>
      <div v-if="isLoading" class="spinner"></div>
    </div>
    <div class="login-button__glow"></div>
  </button>
</template>

<script setup>
import { Github } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { isLoading } = storeToRefs(authStore)

const handleLogin = () => {
  authStore.loginWithGitHub()
}
</script>

<style lang="scss" scoped>
.login-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #24292e, #2f363d);
  border: 1px solid rgba(240, 246, 252, 0.1);
  border-radius: 8px;
  color: #f0f6fc;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2f363d, #3d444d);
    border-color: rgba(240, 246, 252, 0.2);
    transform: translateY(-1px);

    .login-button__glow {
      opacity: 1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &--loading {
    .login-button__content span {
      margin-right: 0.5rem;
    }
  }
}

.login-button__content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
  position: relative;
}

.login-button__glow {
  position: absolute;
  inset: -1px;
  background: linear-gradient(45deg, #58a6ff, #39d353, #58a6ff);
  border-radius: 8px;
  opacity: 0;
  z-index: 1;
  transition: opacity 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 1px;
    background: linear-gradient(135deg, #24292e, #2f363d);
    border-radius: 7px;
  }
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(240, 246, 252, 0.2);
  border-top: 2px solid #f0f6fc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

// Variante para usar en la navbar
.login-button--navbar {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;

  .login-button__content {
    gap: 0.375rem;

    .lucide {
      width: 1rem;
      height: 1rem;
    }
  }
}

// Variante para usar como botón principal
.login-button--primary {
  padding: 1rem 2.5rem;
  font-size: 1rem;
  border-radius: 12px;

  .login-button__content {
    gap: 0.75rem;

    .lucide {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
}
</style>

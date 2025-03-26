// client/src/components/TheNavbar.vue
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import { featureFlags } from '@/utils/featureFlags'

const isMenuOpen = ref(false)
const route = useRoute()

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const isActiveRoute = (path: string) => {
  if (path === '/' && route.path === '/search' && featureFlags.searchAsDefault) {
    return true;
  }
  return route.path === path;
}

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Search', path: '/search' },
  { name: 'Playlists', path: '/playlists' },
  { name: 'Library', path: '/library' }
]
</script>

<template>
  <nav class="bg-white dark:bg-gray-900 border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and brand -->
        <div class="flex-shrink-0 flex items-center">
          <RouterLink to="/" class="flex items-center">
            <img src="/jukebox-logo.png" alt="Jukebox AI Logo" class="h-10 w-10 mr-2" />
            <span class="text-xl font-bold text-gray-900 dark:text-white">Jukebox AI</span>
          </RouterLink>
        </div>

        <!-- Desktop menu -->
        <div class="hidden md:flex md:items-center">
          <div class="ml-10 flex items-baseline space-x-4">
            <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            :class="{ 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': isActiveRoute(item.path) }"
            @click="closeMenu"
          >
            {{ item.name }}
          </RouterLink>
          </div>
          <div class="ml-4">
            <ThemeToggle data-cy="theme-toggle" />
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <ThemeToggle />
          <button
            @click="toggleMenu"
            class="ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-controls="mobile-menu"
            :aria-expanded="isMenuOpen"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              v-if="!isMenuOpen"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              v-else
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      v-show="isMenuOpen"
      class="md:hidden"
      id="mobile-menu"
    >
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium"
          :class="{ 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': $route.path === item.path }"
          @click="closeMenu"
        >
          {{ item.name }}
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
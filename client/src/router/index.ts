// client/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import { featureFlags } from '@/utils/featureFlags'

const MAX_REDIRECT = 1;
let redirectCount = 0;

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/playlists',
      name: 'playlists',
      component: () => import('../views/PlaylistsView.vue')
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/LibraryView.vue')
    }
  ]
})

// Redirect to search page if feature flag is enabled
router.beforeEach((to, from, next) => {
  if (to.name === 'home' && featureFlags.searchAsDefault && redirectCount < MAX_REDIRECT) {
    redirectCount++;
    next({ name: 'search' });
    // next();
  } else {
    next();
  }
});

export default router

import ProjectView from '@/views/ProjectView.vue';
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';

const router = createRouter({
  //   history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Projects',
      component: ProjectView,
    },
    {
      path: '/tasks',
      name: 'Tasks',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/TaskView.vue'),
    }
  ],
});

export default router;

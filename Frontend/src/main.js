import {createApp} from 'vue';
import App from './App.vue';
import router from './router/index.js';
import {createPinia} from 'pinia';

// Vuetify
import 'vuetify/styles';
import {createVuetify} from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';
import './assets/main.css';

const savedTheme = localStorage.getItem('theme') || 'dark'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: savedTheme,
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#1f2836',
          surface: '#2a3446',
          primary: '#3b82f6',
          secondary: '#f59e0b',
          error: '#ef4444',
        },
      },
      light: {
        dark: false,
        colors: {
          background: '#f5f6f8',
          surface: '#ffffff',
          primary: '#3b82f6',
          secondary: '#f59e0b',
          error: '#ef4444',
        },
      },
    },
  },
});

const app = createApp(App);
app.use(createPinia())
app.use(router);
app.use(vuetify);
app.mount('#app');

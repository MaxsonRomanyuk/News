<template>
  <div id="app">
    <nav>
      <router-link to="/">Главная</router-link>
      <router-link to="/about">О сайте</router-link>
      <template v-if="!authStore.isAuthenticated">
        <router-link to="/login">Вход</router-link>
        <router-link to="/register">Регистрация</router-link>
      </template>
      <template v-else>
        <span class="user-info">Привет, {{ authStore.user?.username }}!</span>
        <button @click="handleLogout" class="logout-btn">Выйти</button>
      </template>
    </nav>
    <router-view/>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

nav {
  padding: 20px;
  text-align: center;
  background: #f5f5f5;
  margin-bottom: 20px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 15px;
  padding: 5px 10px;
  border-radius: 4px;
}

nav a.router-link-exact-active {
  color: #42b983;
  background: white;
}
nav a:hover {
  background: #e9ecef;
}

.user-info {
  color: #2c3e50;
  font-weight: 500;
}

.logout-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn:hover {
  background: #c82333;
}
</style>
<template>
  <div id="app">
    <nav>
      <router-link to="/">Главная</router-link>
      <router-link to="/about">О сайте</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<script setup lang="ts">
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
</style>
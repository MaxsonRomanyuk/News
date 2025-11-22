<template>
  <div class="login-page">
    <h1>Вход</h1>
    
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="identifier">Email или имя пользователя</label>
        <input
          id="identifier"
          v-model="form.identifier"
          type="text"
          required
          :disabled="loading"
        >
      </div>

      <div class="form-group">
        <label for="password">Пароль</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          :disabled="loading"
        >
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button type="submit" :disabled="loading" class="submit-btn">
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>

      <p class="register-link">
        Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  identifier: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    await authStore.login(form)
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.login-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: #007bff;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8d7da;
  border-radius: 4px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
}
</style>
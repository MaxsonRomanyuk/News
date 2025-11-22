<template>
  <div class="register-page">
    <h1>Регистрация</h1>
    
    <form @submit.prevent="handleRegister" class="register-form">
      <div class="form-group">
        <label for="username">Имя пользователя</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          required
          :disabled="loading"
        >
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
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
        {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>

      <p class="login-link">
        Уже есть аккаунт? <router-link to="/login">Войти</router-link>
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
  username: '',
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref<string | null>(null)

const handleRegister = async () => {
  try {
    loading.value = true
    error.value = null
    await authStore.register(form)
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.error?.message || 'Ошибка регистрации'
    console.error('Register error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.register-form {
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
  background: #28a745;
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

.login-link {
  text-align: center;
  margin-top: 20px;
}
</style>
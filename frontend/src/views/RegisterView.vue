<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-decoration">
        <div class="decoration-content">
          <h2>Присоединяйтесь!</h2>
          <p>Создайте аккаунт чтобы читать и комментировать новости</p>
          <div class="decoration-image">
            <span class="emoji">🌟</span>
          </div>
        </div>
      </div>

      <div class="auth-form-section">
        <div class="form-container">
          <div class="form-header">
            <h1>Создание аккаунта</h1>
            <p>Заполните форму для регистрации</p>
          </div>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <label for="username">Имя пользователя *</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                placeholder="Придумайте имя пользователя"
                :class="{ error: authStore.error }"
                :disabled="authStore.loading"
              >
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="your@email.com"
                :class="{ error: authStore.error }"
                :disabled="authStore.loading"
              >
            </div>

            <div class="form-group">
              <label for="password">Пароль *</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                placeholder="Не менее 6 символов"
                :class="{ error: authStore.error }"
                :disabled="authStore.loading"
              >
              <div class="password-hint">
                Пароль должен содержать не менее 6 символов
              </div>
            </div>

            <div v-if="authStore.error" class="error-alert">
              <span class="error-icon">⚠️</span>
              <span>{{ authStore.error }}</span>
            </div>

            <button 
              type="submit" 
              :disabled="authStore.loading" 
              class="submit-btn primary-btn"
            >
              <span v-if="authStore.loading" class="btn-spinner"></span>
              {{ authStore.loading ? 'Регистрация...' : 'Создать аккаунт' }}
            </button>

            <div class="divider">
              <span>или</span>
            </div>

            <router-link to="/login" class="auth-switch-link">
              Уже есть аккаунт? <span>Войти</span>
            </router-link>

            <div class="auth-links">
              <router-link to="/" class="back-link">
                ← Вернуться на главную
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  email: '',
  password: ''
})

onMounted(() => {
  authStore.clearError()
})

const handleRegister = async () => {
  try {
    await authStore.register(form)
    router.push('/')
  } catch (error) {

    console.error('Register error:', error)
  }
}
</script>

<style scoped>
.password-hint {
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
}

.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 1000px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
}

.auth-decoration {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.decoration-content h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.decoration-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 40px;
  line-height: 1.5;
}

.decoration-image .emoji {
  font-size: 4rem;
  display: block;
}

.auth-form-section {
  padding: 60px 40px;
  display: flex;
  align-items: center;
}

.form-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.form-header p {
  color: #666;
  font-size: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-group input {
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #dc3545;
  background: #f8d7da;
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-alert {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.error-icon {
  font-size: 1.1rem;
}

.submit-btn {
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.divider {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
  font-size: 0.9rem;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e9ecef;
}

.auth-switch-link {
  text-align: center;
  color: #666;
  text-decoration: none;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.auth-switch-link:hover {
  border-color: #667eea;
  color: #667eea;
}

.auth-switch-link span {
  font-weight: 600;
  color: #667eea;
}

.auth-links {
  margin-top: 30px;
  text-align: center;
}

.back-link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #667eea;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .auth-decoration {
    padding: 40px 20px;
    display: none;
  }

  .auth-form-section {
    padding: 40px 20px;
  }

  .form-header h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .auth-page {
    padding: 10px;
  }

  .auth-container {
    border-radius: 15px;
  }

  .auth-form-section {
    padding: 30px 20px;
  }
}
</style>
<template>
  <div class="app-wrapper">
    <nav class="main-nav">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          <span class="logo">📰</span>
          <span class="brand-name">NewsPortal</span>
        </router-link>

        <div class="nav-links">
          <router-link to="/" class="nav-link">Главная</router-link>
          <router-link to="/about" class="nav-link">О сайте</router-link>
        </div>

        <div class="nav-auth">
          <template v-if="!authStore.isAuthenticated">
            <router-link to="/login" class="auth-link login-link">Вход</router-link>
            <router-link to="/register" class="auth-link register-link">Регистрация</router-link>
          </template>
          <template v-else>
            <div class="user-menu">
              <span class="user-greeting">Привет, {{ authStore.user?.username }}!</span>
              <div class="user-dropdown">
                <button class="user-toggle">
                  <span class="user-avatar">
                    {{ authStore.user?.username?.charAt(0).toUpperCase() }}
                  </span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="dropdown-menu">
                  <button v-if="authStore.user?.role?.name === 'Authenticated'" @click="goToCreateArticle" class="dropdown-item">
                    📝 Новая статья
                  </button>
                  <button @click="handleLogout" class="dropdown-item logout-item">
                    🚪 Выйти
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </nav>

    <main class="app-main">
      <router-view />
    </main>

    <footer class="main-footer">
      <div class="footer-container">
        <p>&copy; 2025 NewsPortal. Все права защищены.</p>
      </div>
    </footer>
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

const goToCreateArticle = () => {
  router.push('/create-article');
};
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-nav {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e9ecef;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: none;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #333;
  font-weight: 700;
  font-size: 1.2rem;
}

.logo {
  font-size: 1.5rem;
}

.brand-name {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 30px;
  align-items: center;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #333;
}

.nav-link.router-link-active {
  color: #667eea;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 15px;
}

.auth-link {
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.login-link {
  color: #667eea;
  border: 1px solid #667eea;
}

.login-link:hover {
  background: #667eea;
  color: white;
}

.register-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 1px solid transparent;
}

.register-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-greeting {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.user-dropdown {
  position: relative;
}

.user-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-toggle:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
}

.dropdown-arrow {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
}

.user-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
}

.user-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: #333;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  border-bottom: 1px solid #f8f9fa;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f8f9fa;
  color: #667eea;
}

.logout-item {
  color: #dc3545;
}

.logout-item:hover {
  background: #f8d7da;
  color: #dc3545;
}

.app-main {
  flex: 1;
  width: 100%;
  min-height: calc(100vh - 120px); /* Высота минус навигация и футер */
}

.main-footer {
  width: 100%;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 20px 0;
  margin-top: auto;
}

.footer-container {
  max-width: none;
  padding: 0 20px;
  text-align: center;
}

.main-footer p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 15px;
    height: 50px;
  }

  .brand-name {
    display: none;
  }

  .nav-links {
    gap: 20px;
  }

  .nav-link {
    font-size: 0.9rem;
  }

  .auth-link {
    padding: 6px 15px;
    font-size: 0.8rem;
  }

  .user-greeting {
    display: none;
  }

  .user-toggle {
    padding: 4px 8px;
  }

  .user-avatar {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .nav-links {
    gap: 15px;
  }

  .nav-link {
    font-size: 0.8rem;
  }

  .auth-link {
    padding: 4px 12px;
    font-size: 0.75rem;
  }
}
</style>
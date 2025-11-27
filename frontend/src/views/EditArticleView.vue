<template>
  <div class="edit-article-page">
    <div class="container">
      <!-- Состояния загрузки -->
      <div v-if="articleLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Загружаем статью...</p>
      </div>

      <div v-else-if="articleError" class="error-state">
        <div class="error-icon">😞</div>
        <h3>Не удалось загрузить статью</h3>
        <p>{{ articleError }}</p>
        <button @click="fetchArticle" class="retry-btn">Попробовать снова</button>
        <router-link to="/" class="home-link">Вернуться на главную</router-link>
      </div>

      <template v-else-if="article">
        <header class="page-header">
          <nav class="breadcrumb">
            <router-link to="/" class="breadcrumb-link">Главная</router-link>
            <span class="breadcrumb-separator">/</span>
            <router-link :to="`/article/${article.slug}`" class="breadcrumb-link">
              {{ article.title }}
            </router-link>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">Редактирование</span>
          </nav>
          
          <div class="header-content">
            <h1>Редактирование статьи</h1>
            <p>Внесите изменения в статью "{{ article.title }}"</p>
          </div>
        </header>

        <ArticleForm
          :article="article"
          :categories="categories"
          :loading="formLoading"
          @submit="handleUpdateArticle"
          @save-draft="handleSaveDraft"
          @cancel="handleCancel"
        />

        <div v-if="successMessage" class="success-message">
          ✅ {{ successMessage }}
        </div>

        <div v-if="formError" class="error-message">
          ❌ {{ formError }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ArticleForm from '@/components/ArticleForm.vue'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()


const article = ref<any>(null)
const categories = ref<any[]>([])
const articleLoading = ref(true)
const formLoading = ref(false)
const articleError = ref<string>('')
const formError = ref<string>('')
const successMessage = ref<string>('')

const fetchArticle = async () => {
  articleLoading.value = true
  articleError.value = ''

  try {
    const response = await api.get(`/articles?filters[slug][$eq]=${route.params.slug}&populate=category,author`)
    
    if (response.data.length === 0) {
      articleError.value = 'Статья не найдена'
      return
    }

    const foundArticle = response.data[0]
    
    if (authStore.user?.role?.name !== 'Editor' && foundArticle.author?.id !== authStore.user?.id) {
      alert("У вас нет прав для редактирования этой статьи")
      //alert("Чтобы изменять новости нужна роль \'Editor\' или изменение своих новостей")
      router.push('/')
      return
    }

    article.value = foundArticle

  } catch (err: any) {
    console.error('Error fetching article:', err)
    articleError.value = 'Не удалось загрузить статью'
  } finally {
    articleLoading.value = false
  }
}


const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data || response.data;

    console.log('Processed categories for create:', categories.value);
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

const handleUpdateArticle = async (articleData: any) => {
  formLoading.value = true
  formError.value = ''
  successMessage.value = ''

  try {
    const submitData = {
      data: articleData
    }

    await api.put(`/articles/${article.value.id}`, submitData)
    
    successMessage.value = 'Статья успешно обновлена!'
    
    Object.assign(article.value, articleData)

  } catch (err: any) {
    console.error('Error updating article:', err)
    
    if (err.response?.data?.error?.message) {
      formError.value = err.response.data.error.message
    } else if (err.response?.data?.error?.details?.errors) {
      const validationErrors = err.response.data.error.details.errors
      formError.value = Object.values(validationErrors)
        .map((error: any) => error.message)
        .join(', ')
    } else {
      formError.value = 'Не удалось обновить статью. Пожалуйста, попробуйте еще раз.'
    }
  } finally {
    formLoading.value = false
  }
}

const handleSaveDraft = async (articleData: any) => {
  formLoading.value = true
  formError.value = ''

  try {
    const submitData = {
      data: {
        ...articleData,
        publishDate: null // Сбрасываем дату публикации для черновика
      }
    }

    await api.put(`/articles/${article.value.id}`, submitData)
    
    successMessage.value = 'Черновик сохранен!'
    Object.assign(article.value, articleData)

  } catch (err: any) {
    console.error('Error saving draft:', err)
    formError.value = 'Не удалось сохранить черновик'
  } finally {
    formLoading.value = false
  }
}

const handleCancel = () => {
  router.push(`/article/${article.value.slug}`)
}

onMounted(async () => {
  // Проверяем авторизацию
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  await Promise.all([fetchArticle(), fetchCategories()])
})
</script>

<style scoped>
.edit-article-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 40px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #666;
}

.breadcrumb-link {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #999;
}

.breadcrumb-current {
  color: #333;
  font-weight: 500;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.header-content p {
  font-size: 1.1rem;
  color: #666;
}

.loading-state, .error-state {
  text-align: center;
  padding: 100px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e9ecef;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-state h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.error-state p {
  color: #666;
  margin-bottom: 30px;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 15px;
}

.home-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 15px 20px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #c3e6cb;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px 20px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #f5c6cb;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .edit-article-page {
    padding: 20px 0;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .breadcrumb {
    flex-wrap: wrap;
  }
}
</style>
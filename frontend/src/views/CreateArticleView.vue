<template>
  <div class="create-article-page">
    <div class="container">
      <header class="page-header">
        <nav class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">Главная</router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Новая статья</span>
        </nav>
        
        <div class="header-content">
          <h1>Создание новой статьи</h1>
          <p>Заполните информацию о новой статье</p>
        </div>
      </header>

      <ArticleForm
        ref="articleFormRef"
        :categories="categories"
        :loading="loading"
        @submit="handleCreateArticle"
        @cancel="handleCancel"
      />
      <<div v-if="authStore.user?.role?.name === 'Editor'" class="publish-section">
        <button 
          @click="handleCreateAndPublish" 
          :disabled="loading"
          class="btn-publish"
        >
          🚀 Создать и опубликовать
        </button>
        <p class="publish-hint">Статья будет сразу опубликована и доступна всем пользователям</p>
      </div>

      <div v-if="error" class="error-message">
        ❌ {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ArticleForm from '@/components/ArticleForm.vue'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const articleFormRef = ref<InstanceType<typeof ArticleForm>>()

const categories = ref<any[]>([])
const loading = ref(false)
const error = ref<string>('')
const successMessage = ref<string>('')

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data || response.data;

    console.log('Processed categories for create:', categories.value);
  } catch (err) {
    console.error('Error fetching categories:', err)
    error.value = 'Не удалось загрузить категории'
  }
}

const handleCreateArticle = async (articleData: any) => {
  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const submitData = {
      data: {
        ...articleData,
        author: authStore.user?.id,
        publishDate: articleData.publishDate || new Date().toISOString(),
        publishedAt: null
      }
    }

    const response = await api.post('/articles', submitData)
    
    successMessage.value = 'Статья успешно создана как черновик!'

    setTimeout(() => {
      router.push(`/article/${response.data.slug}`)
    }, 2000)

  } catch (err: any) {
    console.error('Error creating article:', err)
    
    if (err.response?.data?.error?.message) {
      error.value = err.response.data.error.message
    } else if (err.response?.data?.error?.details?.errors) {
      const validationErrors = err.response.data.error.details.errors
      error.value = Object.values(validationErrors)
        .map((error: any) => error.message)
        .join(', ')
    } else {
      error.value = 'Не удалось создать статью. Пожалуйста, попробуйте еще раз.'
    }
  } finally {
    loading.value = false
  }
}

const handleCreateAndPublish = async () => {
  if (!articleFormRef.value) {
    error.value = 'Форма не загружена'
    return
  }

  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const formData = articleFormRef.value.getFormData()
    
    if (!articleFormRef.value.validateForm()) {
      error.value = 'Пожалуйста, заполните все обязательные поля правильно'
      loading.value = false
      return
    }

    const submitData = {
      data: {
        ...formData,
        author: authStore.user?.id,
        publishDate: formData.publishDate || new Date().toISOString(),
        publishedAt: new Date().toISOString()
      }
    }

    const response = await api.post('/articles', submitData)
    
    successMessage.value = 'Статья создана и опубликована!'

    setTimeout(() => {
      const articleSlug = response.data.data?.attributes?.slug || response.data.slug
      router.push(`/article/${articleSlug}`)
    }, 2000)

  } catch (err: any) {
    console.error('Error creating and publishing article:', err)
    
    if (err.response?.data?.error?.message) {
      error.value = err.response.data.error.message
    } else if (err.response?.data?.error?.details?.errors) {
      const validationErrors = err.response.data.error.details.errors
      error.value = Object.values(validationErrors)
        .map((error: any) => error.message)
        .join(', ')
    } else {
      error.value = 'Не удалось создать и опубликовать статью'
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/')
}

onMounted(async () => {
  // if (authStore.user?.role?.name !== 'Editor') {
  //   router.push('/')
  //   return
  // }
  
  await fetchCategories()
})
</script>

<style scoped>
.create-article-page {
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
.publish-section {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 2px dashed #e9ecef;
  border-radius: 8px;
  text-align: center;
  background: #f8f9fa;
}

.btn-publish {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: #28a745 0.3s;
}

.btn-publish:hover:not(:disabled) {
  background: #218838;
}

.btn-publish:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.publish-hint {
  margin-top: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
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

@media (max-width: 768px) {
  .create-article-page {
    padding: 20px 0;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
}
</style>
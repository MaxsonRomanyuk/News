<template>
  <div class="article-page">
    <div v-if="loading" class="loading">Загрузка статьи...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="article" class="article-content">
      <h1>{{ article.title }}</h1>
      
      <div class="article-meta">
        <span class="date">{{ formatDate(article.publishedDate || article.createdAt) }}</span>
        <span class="category" v-if="article.category">
          {{ article.category.name }}
        </span>
        <span class="author" v-if="article.author">
          Автор: {{ article.author.username }}
        </span>
      </div>

      <div class="cover-image" v-if="article.coverImage">
        <img 
          :src="getImageUrl(article.coverImage)" 
          :alt="article.title"
        >
      </div>

      <div class="content">
        <p>{{ article.excerpt }}</p>
      </div>

      <router-link to="/" class="back-link">← Назад к списку новостей</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const article = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const fetchArticle = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get(`/articles?filters[slug][$eq]=${route.params.slug}&populate=coverImage,category,author`)
    
    if (response.data.length > 0) {
      article.value = response.data[0]
    } else {
      error.value = 'Статья не найдена'
    }
  } catch (err) {
    error.value = 'Не удалось загрузить статью'
    console.error('Error fetching article:', err)
  } finally {
    loading.value = false
  }
}

const getImageUrl = (coverImage: any): string => {
  if (coverImage?.url) {
    return `http://localhost:1337${coverImage.url}`
  }
  return ''
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.article-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 1.1em;
}

.error {
  color: #d9534f;
}

.article-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  color: #666;
  font-size: 0.9em;
}

.category {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.cover-image {
  margin-bottom: 20px;
}

.cover-image img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.content {
  line-height: 1.6;
  margin-bottom: 30px;
}

.back-link {
  color: #007bff;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
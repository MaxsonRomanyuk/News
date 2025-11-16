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
        <span class="views" v-if="article.views !== undefined">
          👁️ {{ article.views }} просмотров
        </span>
        <span class="reading-time" v-if="article.readingTime">
          ⏱️ {{ article.readingTime }} мин. чтения
        </span>
      </div>

      <div class="cover-image" v-if="article.coverImage">
        <img 
          :src="getImageUrl(article.coverImage)" 
          :alt="article.title"
        >
      </div>

      <div class="content" v-html="renderContent(article.content)"></div>

      <div class="article-navigation">
        <router-link to="/" class="nav-link back-to-list">
          ← Все новости
        </router-link>
        
        <div class="nav-buttons">
          <button 
            @click="goToPreviousArticle" 
            :disabled="!hasPreviousArticle"
            class="nav-button"
          >
            ← Предыдущая
          </button>
          <button 
            @click="goToNextArticle" 
            :disabled="!hasNextArticle"
            class="nav-button"
          >
            Следующая →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const article = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const allArticles = ref<any[]>([])

// Вычисляемые свойства для навигации
const currentArticleIndex = computed(() => 
  allArticles.value.findIndex(a => a.slug === route.params.slug)
)

const hasPreviousArticle = computed(() => 
  currentArticleIndex.value > 0
)

const hasNextArticle = computed(() => 
  currentArticleIndex.value < allArticles.value.length - 1
)

const fetchAllArticles = async () => {
  try {
    const response = await api.get('/articles?populate=coverImage,category,author&sort=publishedAt:desc')
    allArticles.value = response.data
  } catch (err) {
    console.error('Error fetching articles for navigation:', err)
  }
}

const goToPreviousArticle = () => {
  if (hasPreviousArticle.value) {
    const prevArticle = allArticles.value[currentArticleIndex.value - 1]
    router.push(`/article/${prevArticle.slug}`)
  }
}

const goToNextArticle = () => {
  if (hasNextArticle.value) {
    const nextArticle = allArticles.value[currentArticleIndex.value + 1]
    router.push(`/article/${nextArticle.slug}`)
  }
}

const incrementViews = async (articleId: number) => {
  try {
    // Увеличиваем счетчик просмотров
    await api.put(`/articles/${articleId}`, {
      data: {
        views: (article.value?.views || 0) + 1
      }
    })
  } catch (err) {
    console.error('Error incrementing views:', err)
  }
}

const fetchArticle = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Пробуем новый endpoint, если он есть, иначе старый
    try {
      const response = await api.get(`/articles/slug/${route.params.slug}`)
      if (response.data) {
        article.value = response.data
        await incrementViews(response.data.id)
        return
      }
    } catch (slugError) {
      console.log('Slug endpoint not available, using filter method')
    }

    // Fallback: используем старый метод
    const response = await api.get(`/articles?filters[slug][$eq]=${route.params.slug}&populate=coverImage,category,author`)
    
    if (response.data.length > 0) {
      article.value = response.data[0]
      await incrementViews(response.data[0].id)
    } else {
      error.value = 'Статья не найдена'
    }
  } catch (err: any) {
    if (err.response?.status === 404) {
      error.value = 'Статья не найдена'
    } else {
      error.value = 'Не удалось загрузить статью'
    }
    console.error('Error fetching article:', err)
  } finally {
    loading.value = false
  }
}

const renderContent = (content: any[]): string => {
  if (!Array.isArray(content)) return ''
  
  return content.map(item => {
    if (item.type === 'paragraph') {
      const text = item.children?.map((child: any) => child.text || '').join('') || ''
      return `<p>${text}</p>`
    }
    if (item.type === 'heading') {
      const level = item.level || 3
      const text = item.children?.map((child: any) => child.text || '').join('') || ''
      return `<h${level}>${text}</h${level}>`
    }
    if (item.type === 'list') {
      const tag = item.format === 'ordered' ? 'ol' : 'ul'
      const items = item.children?.map((child: any) => 
        `<li>${child.children?.map((grandchild: any) => grandchild.text || '').join('') || ''}</li>`
      ).join('') || ''
      return `<${tag}>${items}</${tag}>`
    }
    return ''
  }).join('')
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

onMounted(async () => {
  await fetchAllArticles()
  await fetchArticle()
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
  flex-wrap: wrap;
  align-items: center;
}

.category {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.views, .reading-time {
  display: flex;
  align-items: center;
  gap: 4px;
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

.article-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.nav-buttons {
  display: flex;
  gap: 10px;
}

.nav-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-button:hover:not(:disabled) {
  background: #f5f5f5;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-to-list {
  color: #007bff;
  text-decoration: none;
}

.back-to-list:hover {
  text-decoration: underline;
}
</style>

<style>
/* Глобальные стили для контента (без scoped) */
.content p {
  margin-bottom: 1em;
}

.content h2 {
  margin: 1.5em 0 0.5em 0;
  color: #333;
}

.content h3 {
  margin: 1.2em 0 0.5em 0;
  color: #444;
}

.content ul, .content ol {
  margin: 1em 0;
  padding-left: 2em;
}

.content li {
  margin-bottom: 0.5em;
}
</style>
<template>
  <div class="article-page">
    <!-- Хедер статьи -->
    <header class="article-header" v-if="article">
      <div class="container">
        <nav class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">Главная</router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ article.title }}</span>
        </nav>
        
        <div class="header-content">
          <div class="article-meta">
            <span class="category-badge">{{ article.category?.name }}</span>
            <span class="date">{{ formatDate(article.publishedDate || article.createdAt) }}</span>
            <span class="reading-time" v-if="article.readingTime">⏱️ {{ article.readingTime }} мин чтения</span>
            <span class="views">👁️ {{ article.views }} просмотров</span>
          </div>
          
          <h1 class="article-title">{{ article.title }}</h1>
          <p class="article-excerpt">{{ article.excerpt }}</p>
          
          <div class="author-info" v-if="article.author">
            <div class="author-avatar">
              <div class="avatar-placeholder">
                {{ article.author.username?.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="author-details">
              <span class="author-name">{{ article.author.username }}</span>
              <span class="author-role">Автор</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="article-cover" v-if="article?.coverImage">
      <div class="container">
        <img 
          :src="getImageUrl(article.coverImage)" 
          :alt="article.title"
          class="cover-image"
        >
      </div>
    </div>

    <main class="article-content" v-if="article">
      <div class="container">
        <div class="content-wrapper">
          <!-- Боковая панель с действиями -->
          <aside class="sidebar-actions">
            <div class="action-group">
              <button class="action-btn" @click="shareArticle" title="Поделиться">
                <span class="action-icon">📤</span>
                <span class="action-text">Поделиться</span>
              </button>
              
              <button class="action-btn" @click="toggleBookmark" :class="{ active: isBookmarked }" title="В закладки">
                <span class="action-icon">🔖</span>
                <span class="action-text">{{ isBookmarked ? 'В закладках' : 'В закладки' }}</span>
              </button>
              
              <div class="editor-actions" v-if="authStore.user?.role?.name === 'Editor'">
                <button class="action-btn edit-btn" @click="editArticle" title="Редактировать">
                  <span class="action-icon">✏️</span>
                  <span class="action-text">Редактировать</span>
                </button>
                
                <button class="action-btn delete-btn" @click="confirmDelete" title="Удалить">
                  <span class="action-icon">🗑️</span>
                  <span class="action-text">Удалить</span>
                </button>
              </div>
            </div>
          </aside>

          <article class="content-main">
            <div class="content-body" v-html="renderContent(article.content)"></div>
            
            <div class="article-tags" v-if="article.tags && article.tags.length > 0">
              <span class="tags-label">Теги:</span>
              <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </article>
        </div>
      </div>
    </main>

    <nav class="article-navigation" v-if="allArticles.length > 1">
      <div class="container">
        <button 
          @click="goToPreviousArticle" 
          :disabled="!hasPreviousArticle"
          class="nav-btn prev-btn"
        >
          <span class="nav-arrow">←</span>
          <div class="nav-content">
            <span class="nav-label">Предыдущая</span>
            <span class="nav-title">{{ previousArticle?.title }}</span>
          </div>
        </button>
        
        <button 
          @click="goToNextArticle" 
          :disabled="!hasNextArticle"
          class="nav-btn next-btn"
        >
          <div class="nav-content">
            <span class="nav-label">Следующая</span>
            <span class="nav-title">{{ nextArticle?.title }}</span>
          </div>
          <span class="nav-arrow">→</span>
        </button>
      </div>
    </nav>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загружаем статью...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">😞</div>
      <h3>Не удалось загрузить статью</h3>
      <p>{{ error }}</p>
      <button @click="fetchArticle" class="retry-btn">Попробовать снова</button>
      <router-link to="/" class="home-link">Вернуться на главную</router-link>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Подтверждение удаления</h3>
        <p>Вы уверены, что хотите удалить статью "{{ article?.title }}"?</p>
        <div class="modal-actions">
          <button @click="deleteArticle" class="btn-danger">Удалить</button>
          <button @click="showDeleteModal = false" class="btn-cancel">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const article = ref<any>(null)
const allArticles = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const isBookmarked = ref(false)
const showDeleteModal = ref(false)



const currentArticleIndex = computed(() => 
  allArticles.value.findIndex(a => a.slug === route.params.slug)
)

const hasPreviousArticle = computed(() => currentArticleIndex.value > 0)
const hasNextArticle = computed(() => currentArticleIndex.value < allArticles.value.length - 1)
const previousArticle = computed(() => 
  hasPreviousArticle.value ? allArticles.value[currentArticleIndex.value - 1] : null
)
const nextArticle = computed(() => 
  hasNextArticle.value ? allArticles.value[currentArticleIndex.value + 1] : null
)

const fetchAllArticles = async () => {
  try {
    const response = await api.get('/articles?populate=coverImage,category,author&sort=publishedAt:desc')
    allArticles.value = response.data
  } catch (err) {
    console.error('Error fetching articles for navigation:', err)
  }
}

const fetchArticle = async () => {
  loading.value = true
  error.value = null
  article.value = null
  
  try {
    const response = await api.get(`/articles?filters[slug][$eq]=${route.params.slug}&populate=coverImage,category,author`)
    
    if (response.data.length > 0) {
      article.value = response.data[0]
      await incrementViews(response.data[0].id)

    } else {
      error.value = 'Статья не найдена'
    }
  } catch (err: any) {
    console.error('Error fetching article:', err)
    error.value = 'Не удалось загрузить статью. Пожалуйста, попробуйте позже.'
  } finally {
    loading.value = false
  }
}

const incrementViews = async (articleId: number) => {
  try {
    await api.put(`/articles/${articleId}`, {
      data: {
        views: (article.value?.views || 0) + 1
      }
    })
  } catch (err) {
    console.error('Error incrementing views:', err)
  }
}
watch(
  () => route.params.slug,
  async (newSlug, oldSlug) => {
    console.log('🔄 Route changed:', oldSlug, '→', newSlug)
    if (newSlug && newSlug !== oldSlug) {
      await fetchArticle()
    }
  }
)
const shareArticle = () => {
  if (navigator.share) {
    navigator.share({
      title: article.value.title,
      text: article.value.excerpt,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('Ссылка скопирована в буфер обмена!')
  }
}

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
}

const editArticle = () => {
  if (article.value) {
    router.push(`/edit-article/${article.value.slug}`)
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deleteArticle = async () => {
  if (!article.value) return
  
  try {
    await api.delete(`/articles/${article.value.id}`)
    showDeleteModal.value = false
    router.push('/')
  } catch (err: any) {
    console.error('Error deleting article:', err)
    error.value = 'Не удалось удалить статью'
  }
}

const goToPreviousArticle = () => {
  if (hasPreviousArticle.value) {
    router.push(`/article/${previousArticle.value.slug}`)
  }
}

const goToNextArticle = () => {
  if (hasNextArticle.value) {
    router.push(`/article/${nextArticle.value.slug}`)
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
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Хедер статьи */
.article-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
}

.breadcrumb-link:hover {
  color: white;
}

.breadcrumb-separator {
  color: rgba(255, 255, 255, 0.6);
}

.breadcrumb-current {
  color: white;
  font-weight: 500;
}

.header-content {
  max-width: 800px;
}

.article-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.category-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.date, .reading-time, .views {
  font-size: 0.9rem;
  opacity: 0.9;
}

.article-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 20px;
}

.article-excerpt {
  font-size: 1.3rem;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 30px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-avatar .avatar-placeholder {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.author-role {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Обложка */
.article-cover {
  background: white;
  padding: 0;
}

.cover-image {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* Основной контент */
.article-content {
  padding: 60px 0;
  background: white;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 60px;
  align-items: start;
}

/* Боковая панель */
.sidebar-actions {
  position: sticky;
  top: 100px;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.action-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateX(5px);
}

.action-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.action-icon {
  font-size: 1.2rem;
}

.action-text {
  font-weight: 500;
}

.edit-btn:hover {
  background: #28a745;
  border-color: #28a745;
}

.delete-btn:hover {
  background: #dc3545;
  border-color: #dc3545;
}

/* Контент статьи */
.content-main {
  max-width: 100%;
}

.content-body {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
}

.article-tags {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #f8f9fa;
}

.tags-label {
  font-weight: 600;
  margin-right: 15px;
  color: #666;
}

.tag {
  background: #e9ecef;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  margin-right: 8px;
  margin-bottom: 8px;
  display: inline-block;
}

/* Навигация */
.article-navigation {
  background: white;
  padding: 40px 0;
  border-top: 2px solid #f8f9fa;
}

.article-navigation .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.nav-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev-btn {
  justify-content: flex-start;
}

.next-btn {
  justify-content: flex-end;
  text-align: right;
}

.nav-arrow {
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-label {
  font-size: 0.9rem;
  opacity: 0.8;
  display: block;
  margin-bottom: 5px;
}

.nav-title {
  font-weight: 600;
  display: block;
  line-height: 1.3;
}


.loading-state, .error-state {
  text-align: center;
  padding: 100px 20px;
  background: white;
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


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.modal-content h3 {
  margin-bottom: 15px;
  color: #333;
}

.modal-content p {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-cancel:hover {
  background: #5a6268;
}


@media (max-width: 968px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .sidebar-actions {
    position: static;
  }
  
  .action-group {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .action-btn {
    flex: 1;
    min-width: 150px;
  }
}

@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }
  
  .article-excerpt {
    font-size: 1.1rem;
  }
  
  .article-navigation .container {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

<style>

.content-body h2 {
  font-size: 1.8rem;
  margin: 2em 0 1em 0;
  color: #333;
  line-height: 1.3;
}

.content-body h3 {
  font-size: 1.4rem;
  margin: 1.5em 0 0.8em 0;
  color: #444;
}

.content-body p {
  margin-bottom: 1.5em;
}

.content-body ul, .content-body ol {
  margin: 1.5em 0;
  padding-left: 2em;
}

.content-body li {
  margin-bottom: 0.5em;
  line-height: 1.6;
}

.content-body strong {
  font-weight: 600;
  color: #333;
}

.content-body em {
  font-style: italic;
  color: #555;
}
</style>
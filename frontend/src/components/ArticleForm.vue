<template>
  <form @submit.prevent="handleSubmit" class="article-form">
    <section class="form-section">
      <h2>Основная информация</h2>
      
      <div class="form-group">
        <label for="title">Заголовок статьи *</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          required
          placeholder="Введите заголовок статьи"
          :class="{ error: errors.title }"
        >
        <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
      </div>

      <div class="form-group">
        <label for="slug">URL slug *</label>
        <input
          id="slug"
          v-model="formData.slug"
          type="text"
          required
          placeholder="article-url-slug"
          :class="{ error: errors.slug }"
        >
        <span class="field-hint">Используется в URL: /article/{{ formData.slug || 'article-url-slug' }}</span>
        <span v-if="errors.slug" class="error-message">{{ errors.slug }}</span>
      </div>

      <div class="form-group">
        <label for="excerpt">Краткое описание *</label>
        <textarea
          id="excerpt"
          v-model="formData.excerpt"
          required
          placeholder="Краткое описание статьи, которое будет отображаться в списке"
          rows="3"
          :class="{ error: errors.excerpt }"
        ></textarea>
        <span v-if="errors.excerpt" class="error-message">{{ errors.excerpt }}</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="category">Категория *</label>
          <select
            id="category"
            v-model="formData.category"
            required
            :class="{ error: errors.category }"
          >
            <option value="">Выберите категорию</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.attributes?.name || category.name }}
            </option>
          </select>
          <span v-if="errors.category" class="error-message">{{ errors.category }}</span>
        </div>

        <div class="form-group">
          <label for="readingTime">Время чтения (минуты)</label>
          <input
            id="readingTime"
            v-model.number="formData.readingTime"
            type="number"
            min="1"
            max="60"
            placeholder="5"
          >
        </div>
      </div>

      <div class="form-row">
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.isFeatured"
              :true-value="true"
              :false-value="false"
            >
            <span class="checkmark"></span>
            Избранная статья
          </label>
          <span class="checkbox-hint">Будет выделена на главной странице</span>
        </div>

        <div class="form-group">
          <label for="publishDate">Дата публикации</label>
          <input
            id="publishDate"
            v-model="formData.publishDate"
            type="datetime-local"
          >
        </div>
      </div>
    </section>

    <section class="form-section">
      <h2>Содержимое статьи</h2>
      
      <div class="form-group">
        <label for="content">Текст статьи *</label>
        <textarea
          id="content"
          v-model="formData.content"
          required
          placeholder="Напишите содержимое вашей статьи..."
          rows="12"
          :class="{ error: errors.content }"
        ></textarea>
        <span v-if="errors.content" class="error-message">{{ errors.content }}</span>
        <div class="field-hint">
          Поддерживается Markdown-разметка: **жирный**, *курсив*, списки и т.д.
        </div>
      </div>

      <div class="form-group">
        <label>Теги (через запятую)</label>
        <input
          v-model="formData.tagsInput"
          type="text"
          placeholder="технологии, наука, инновации"
        >
        <div class="tags-preview" v-if="tags.length > 0">
          <span v-for="tag in tags" :key="tag" class="tag-preview">
            {{ tag }}
          </span>
        </div>
      </div>
    </section>

    <section class="form-section">
      <h2>Обложка статьи</h2>
      
      <div class="cover-upload">
        <div v-if="formData.coverImage" class="cover-preview">
          <img :src="getImageUrl(formData.coverImage)" alt="Preview" class="cover-image">
          <button type="button" @click="removeCoverImage" class="remove-cover-btn">
            ✕
          </button>
        </div>
        
        <div v-else class="upload-placeholder">
          <label for="coverUpload" class="upload-label">
            <span class="upload-icon">📷</span>
            <span>Загрузить обложку</span>
            <input
              id="coverUpload"
              type="file"
              accept="image/*"
              @change="handleCoverUpload"
              class="upload-input"
            >
          </label>
        </div>
      </div>
    </section>

    <section class="form-actions">
      <button
        type="button"
        @click="$emit('cancel')"
        class="btn-secondary"
        :disabled="loading"
      >
        Отмена
      </button>
      
      <div class="primary-actions">
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary"
        >
          <span v-if="loading" class="btn-spinner"></span>
          {{ loading ? 'Сохранение...' : (isEditing ? 'Обновить статью' : 'Опубликовать статью') }}
        </button>
        
        <button
          v-if="isEditing"
          type="button"
          @click="handleSaveDraft"
          :disabled="loading"
          class="btn-outline"
        >
          Сохранить черновик
        </button>
      </div>
    </section>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Category {
  id: number
  attributes?: {
    name: string
  }
  name?: string
}

interface ArticleFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  category: number | string
  readingTime: number
  isFeatured: boolean
  publishDate: string
  tagsInput: string
  coverImage: any
}

interface Props {
  article?: any
  categories: Category[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  submit: [data: any]
  saveDraft: [data: any]
  cancel: []
}>()

const formData = ref<ArticleFormData>({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  readingTime: 5,
  isFeatured: false,
  publishDate: '',
  tagsInput: '',
  coverImage: null
})

const errors = ref<Record<string, string>>({})
const isEditing = computed(() => !!props.article)
const tags = computed(() => 
  formData.value.tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
)

const richTextToString = (richText: any[]): string => {
  if (!Array.isArray(richText)) return ''
  
  return richText.map(item => {
    if (item.type === 'paragraph' && Array.isArray(item.children)) {
      return item.children.map((child: any) => child.text || '').join('')
    }
    return ''
  }).join('\n\n')
}

const stringToRichText = (text: string): any[] => {
  if (!text.trim()) return []
  
  return text.split('\n\n').map(paragraph => ({
    type: 'paragraph',
    children: [{ type: 'text', text: paragraph.trim() }]
  })).filter(item => item.children[0].text.length > 0)
}

watch(() => props.article, (article) => {
  if (article) {
    let contentString = ''
    if (Array.isArray(article.attributes?.content)) {
      contentString = richTextToString(article.attributes.content)
    } else if (typeof article.attributes?.content === 'string') {
      contentString = article.attributes.content
    } else if (Array.isArray(article.content)) {
      contentString = richTextToString(article.content)
    } else if (typeof article.content === 'string') {
      contentString = article.content
    }

    console.log("formdata: " + formData.value)

    formData.value = {
      title: article.title || '',
      slug: article.slug || '',
      excerpt: article.excerpt || '',
      content: contentString,
      category: article.category?.id || article.category || '',
      readingTime: article.readingTime || 5,
      isFeatured: article.isFeatured || false,
      publishDate: article.publishDate ? new Date(article.publishDate).toISOString().slice(0, 16) : '',
      tagsInput: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      coverImage: article.coverImage || null
    }
    console.log("formdata2: " + formData.title)
  }
}, { immediate: true })

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.title.trim()) {
    errors.value.title = 'Заголовок обязателен'
  }

  if (!formData.value.slug.trim()) {
    errors.value.slug = 'Slug обязателен'
  } else if (!/^[a-z0-9-]+$/.test(formData.value.slug)) {
    errors.value.slug = 'Slug может содержать только латинские буквы, цифры и дефисы'
  }

  if (!formData.value.excerpt.trim()) {
    errors.value.excerpt = 'Краткое описание обязательно'
  }

  if (!formData.value.content.trim()) {
    errors.value.content = 'Содержимое статьи обязательно'
  }

  if (!formData.value.category) {
    errors.value.category = 'Категория обязательна'
  }

  return Object.keys(errors.value).length === 0
}

const prepareSubmitData = () => {
  const richTextContent = stringToRichText(formData.value.content.trim())
  const data: any = {
    title: formData.value.title.trim(),
    slug: formData.value.slug.trim(),
    excerpt: formData.value.excerpt.trim(),
    content: richTextContent,
    category: formData.value.category-1,
    readingTime: formData.value.readingTime,
    isFeatured: formData.value.isFeatured,
    publishDate: formData.value.publishDate || new Date().toISOString()
  }

  if (formData.value.coverImage) {
    data.coverImage = formData.value.coverImage
  }

  if (tags.value.length > 0) {
    data.tags = tags.value
  }
  console.log("data: " + data.publishedAt)
  return data
}

const handleSubmit = () => {
  if (!validateForm()) return
  
  const submitData = prepareSubmitData()
  emit('submit', submitData)
}

const handleSaveDraft = () => {
  if (!validateForm()) return
  
  const submitData = prepareSubmitData()
  emit('saveDraft', submitData)
}

const handleCoverUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Здесь будет логика загрузки файла в Strapi
    // Пока просто сохраняем файл
    formData.value.coverImage = file
    
    // Сбрасываем input чтобы можно было загрузить тот же файл снова
    target.value = ''
  }
}

const removeCoverImage = () => {
  formData.value.coverImage = null
}

const getImageUrl = (coverImage: any): string => {
  if (coverImage?.url) {
    return `http://localhost:1337${coverImage.url}`
  }
  if (coverImage instanceof File) {
    return URL.createObjectURL(coverImage)
  }
  return ''
}
</script>

<style scoped>
.article-form {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.form-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-section h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

input, select, textarea {
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  font-family: inherit;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input.error, select.error, textarea.error {
  border-color: #dc3545;
  background: #f8d7da;
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.field-hint {
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
}

.error-message {
  font-size: 0.8rem;
  color: #dc3545;
  margin-top: 5px;
}

/* Чекбокс */
.checkbox-group {
  margin-top: 25px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e9ecef;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-label input:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-label input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-hint {
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
  margin-left: 30px;
}

.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tag-preview {
  background: #e9ecef;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  color: #666;
}

.cover-upload {
  margin-top: 15px;
}

.cover-preview {
  position: relative;
  display: inline-block;
}

.cover-image {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}

.remove-cover-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  border: 2px dashed #e9ecef;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
}

.upload-icon {
  font-size: 2rem;
}

.upload-input {
  display: none;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
  border-top: 2px solid #f8f9fa;
}

.primary-actions {
  display: flex;
  gap: 15px;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .primary-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .primary-actions button {
    flex: 1;
  }
}
</style>
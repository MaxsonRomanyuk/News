import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { ArticleEntity } from '@/types/strapi';

export const useNewsStore = defineStore('news', () => {
  // State
  const articles = ref<ArticleEntity[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0
  });

  // Getters
  const hasArticles = computed(() => articles.value.length > 0);
  const currentPage = computed(() => pagination.value.page);
  const totalPages = computed(() => pagination.value.pageCount);

  // Actions
  const fetchArticles = async (page: number = 1): Promise<void> => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.get<ArticleEntity[]>('/articles', {
        params: {
          'populate': 'coverImage,category,author',
          'sort': 'publishedAt:desc',
          'pagination[page]': page,
          'pagination[pageSize]': pagination.value.pageSize
        }
      });

      console.log('API Response:', response.data); 

      if (Array.isArray(response.data)) {
        articles.value = response.data;
        
        pagination.value = {
          page: page,
          pageSize: pagination.value.pageSize,
          pageCount: Math.ceil(response.data.length / pagination.value.pageSize),
          total: response.data.length
        };
      } else {
        throw new Error('Unexpected API response format');
      }
      
    } catch (err) {
      error.value = 'Не удалось загрузить новости';
      console.error('Error fetching articles:', err);
    } finally {
      loading.value = false;
    }
  };

  const goToPage = (page: number): void => {
    if (page >= 1 && page <= totalPages.value) {
      fetchArticles(page);
    }
  };

  return {
    // State
    articles,
    loading,
    error,
    pagination,
    
    // Getters
    hasArticles,
    currentPage,
    totalPages,
    
    // Actions
    fetchArticles,
    goToPage
  };
});
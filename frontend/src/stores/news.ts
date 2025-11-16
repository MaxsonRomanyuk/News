import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { ArticleEntity, ArticleResponse } from '@/types/strapi';

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export const useNewsStore = defineStore('news', () => {
  // State
  const articles = ref<ArticleEntity[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    pageCount: 0
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
      const response = await api.get<ArticleResponse>('/articles', {
        params: {
          'populate': 'coverImage,category,author',
          'sort': 'publishedAt:desc',
          'pagination[page]': page,
          'pagination[pageSize]': pagination.value.pageSize
        }
      });

      articles.value = response.data.data;
      pagination.value = response.data.meta.pagination;
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
import { defineStore } from 'pinia';
import { ref, computed} from 'vue';
import api from '@/services/api';
import type { ArticleEntity } from '@/types/strapi';

export const useNewsStore = defineStore('news', () => {
  const articles = ref<ArticleEntity[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    page: 1,
    pageSize: 6,
    pageCount: 0,
    total: 0
  });

  const filters = ref({
    category: '',
    tags: [] as string[],
    isFeatured: false
  });

  const hasArticles = computed(() => {
    const has = articles.value.length > 0;
    return has;
  });
  const currentPage = computed(() => pagination.value.page);
  const totalPages = computed(() => pagination.value.pageCount);
  const hasActiveFilters = computed(() => {
    return filters.value.category !== '' || 
           filters.value.tags.length > 0 || 
           filters.value.isFeatured;
  });

  const fetchArticles = async (page: number = 1, newFilters?: any): Promise<void> => {
    loading.value = true;
    error.value = null;
    
    if (newFilters) {
      filters.value = { ...filters.value, ...newFilters };
    }
  
    try {
      const params: any = {
        'populate': 'coverImage,category,author',
        'sort': 'publishDate:desc',
        'pagination[page]': page,
        'pagination[pageSize]': pagination.value.pageSize
      };

      
      if (filters.value.category) {
        params['filters[category][slug][$eq]'] = filters.value.category;
      }
  
      if (filters.value.isFeatured) {
        params['filters[isFeatured][$eq]'] = 'true';
      }
  
      if (filters.value.tags.length > 0) {
        params['filters[tags][$containsi]'] = filters.value.tags[0];
      }
  
      const response = await api.get('/articles', { params });
      
      if (response.data && response.data.data) {
        articles.value = response.data.data;
        
        if (response.data.meta?.pagination) {
          pagination.value = {
            page: response.data.meta.pagination.page,
            pageSize: response.data.meta.pagination.pageSize,
            pageCount: response.data.meta.pagination.pageCount,
            total: response.data.meta.pagination.total
          };
        }
        
      }
      
    } catch (err) {
      error.value = 'Не удалось загрузить новости';
      console.error('❌ Error fetching articles:', err);
    } finally {
      loading.value = false;
    }
  };

  const goToPage = (page: number): void => {
    if (page >= 1 && page <= totalPages.value) {
      fetchArticles(page);
    }
  };
  const setCategoryFilter = (categorySlug: string) => {
    filters.value.category = categorySlug;
    fetchArticles(1); 
  };
  const setFeaturedFilter = (isFeatured: boolean) => {
    filters.value.isFeatured = isFeatured;
    fetchArticles(1);
  };

  const setTagFilter = (tags: string[]) => {
    filters.value.tags = tags;
    fetchArticles(1);
  };

  const clearFilters = () => {
    filters.value = {
      category: '',
      tags: [],
      isFeatured: false
    };
    fetchArticles(1);
  };

  return {
    // State
    articles,
    loading,
    error,
    pagination,
    filters,
    
    // Getters
    hasArticles,
    currentPage,
    totalPages,
    hasActiveFilters,
    
    // Actions
    fetchArticles,
    goToPage,
    setCategoryFilter,
    setFeaturedFilter,
    setTagFilter,
    clearFilters
  };
});
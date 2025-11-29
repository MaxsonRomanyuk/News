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
    pageSize: 5,
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

      const filterConditions = [];
      if (filters.value.category) {
        filterConditions.push({
          category: {
            slug: { $eq: filters.value.category }
          }
        });
      }

      if (filters.value.isFeatured) {
        filterConditions.push({
          isFeatured: { $eq: true }
        });
      }

      if (filters.value.tags.length > 0) {
        filters.value.tags.forEach(tag => {
          filterConditions.push({
            tags: { $containsi: tag }
          });
        });
      }

      if (filterConditions.length > 0) {
        params.filters = {
          $and: filterConditions
        };
      }
      console.log('🔍 Fetching articles with params:', params);

      const response = await api.get('/articles', { params });

      console.log('📦 API Response:', response.data); 
      

      
      let articlesData = [];
      let paginationData = null;

      if (Array.isArray(response.data)) {
        articlesData = response.data;
        paginationData = {
          page: page,
          pageSize: pagination.value.pageSize,
          pageCount: Math.ceil(response.data.length / pagination.value.pageSize),
          total: response.data.length
        };
      } else {
        throw new Error('Unexpected API response format');
      }
      
      const startIndex = (page - 1) * pagination.value.pageSize;
      const endIndex = startIndex + pagination.value.pageSize;
      const paginatedArticles = articlesData.slice(startIndex, endIndex);
      articles.value.splice(0, articles.value.length, ...paginatedArticles);
      
      pagination.value = {
        page: paginationData.page || page,
        pageSize: paginationData.pageSize || pagination.value.pageSize,
        pageCount: paginationData.pageCount || Math.ceil(articlesData.length / pagination.value.pageSize),
        total: paginationData.total || articlesData.length
      };
    
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
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

export interface StrapiImage {
  data: {
    id: number;
    attributes: {
      name: string;
      alternativeText: string | null;
      caption: string | null;
      width: number;
      height: number;
      formats: any;
      hash: string;
      ext: string;
      mime: string;
      size: number;
      url: string;
      previewUrl: string | null;
      provider: string;
      createdAt: string;
      updatedAt: string;
    };
  } | null;
}

// Типы для наших моделей
export interface Category {
  name: string;
  slug: string;
}

export interface Author {
  username: string;
  email: string;
}

export interface Article {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  publishedAt: string;
  coverImage: StrapiImage;
  views: number;
  isFeatured: boolean;
  readingTime?: number;
  tags?: string[];
  category: {
    data: StrapiEntity<Category>;
  };
  author: {
    data: StrapiEntity<Author>;
  };
}

export type ArticleEntity = StrapiEntity<Article>;
export type ArticleResponse = StrapiResponse<ArticleEntity[]>;
export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiMeta {
  pagination: StrapiPagination;
}

export interface StrapiResponse<T> {
  data: T;
  meta?: StrapiMeta;
}

export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  url: string;
}

export interface StrapiImageAttributes {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiImage {
  data: {
    id: number;
    attributes: StrapiImageAttributes;
  } | null;
}

export interface Category {
  name: string;
  slug: string;
}

export interface Author {
  username: string;
  email: string;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: any[]; // Rich text content
  excerpt: string;
  views: number;
  isFeatured: boolean;
  readingTime?: number;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  publishedDate: string;
  locale: string | null;
  coverImage: any; // Упростим для начала
  category: any;
  author: any;
}

export type ArticleEntity = Article;
export type ArticleResponse = StrapiResponse<ArticleEntity[]>;
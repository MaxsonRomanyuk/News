export interface Article {
  id: number;
  title: string;
  slug: string;
  content: any;
  excerpt?: string;
  views: number;
  isFeatured: boolean;
  readingTime?: number;
  tags?: string[];
  publishDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  coverImage?: any;
  category?: any;
  author?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  role: {
    id: number;
    name: string;
    description: string;
    type: string;
  };
}
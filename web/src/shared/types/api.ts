export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface ApiSuccess<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
  errorDetails: ApiErrorDetail[] | null;
}

export interface PageQuery {
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  items: T[];
  meta: ApiMeta;
}

/** Public `/properties` filter contract. */
export interface PropertyQuery extends PageQuery {
  searchTerm?: string;
  location?: string;
  category?: string;
  isAvailable?: boolean;
  priceMin?: number;
  priceMax?: number;
}

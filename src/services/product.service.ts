import api from '@/lib/api';
import {
  Product,
  ProductFilters,
  ProductsResponse,
  ApiResponse,
  PaginationParams,
} from '@/types';

export const productService = {
  /**
   * Listar produtos com filtros
   */
  async getProducts(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): Promise<ProductsResponse> {
    const response = await api.get<ProductsResponse>('/products', {
      params: { ...filters, ...pagination },
    });
    return response.data;
  },

  /**
   * Obter detalhes de um produto
   */
  async getProduct(id: string): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  /**
   * Marcar/desmarcar produto como favorito
   */
  async toggleFavorite(id: string, isFavorite: boolean): Promise<Product> {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/favorite`, {
      is_favorite: isFavorite,
    });
    return response.data.data;
  },

  /**
   * Deletar produto
   */
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  /**
   * Deletar múltiplos produtos
   */
  async deleteProducts(ids: string[]): Promise<void> {
    await api.post('/products/bulk-delete', { product_ids: ids });
  },

  /**
   * Marcar múltiplos produtos como favoritos
   */
  async bulkToggleFavorite(ids: string[], isFavorite: boolean): Promise<void> {
    await api.post('/products/bulk-favorite', {
      product_ids: ids,
      is_favorite: isFavorite,
    });
  },

  /**
   * Exportar produtos para CSV
   */
  async exportProducts(filters?: ProductFilters): Promise<Blob> {
    const response = await api.get('/products/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
import api, { uploadFile } from '@/lib/api';
import {
  Catalog,
  CatalogUploadParams,
  CatalogLog,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const catalogService = {
  /**
   * Listar todos os catálogos do usuário
   */
  async getCatalogs(params?: PaginationParams): Promise<PaginatedResponse<Catalog>> {
    const response = await api.get<PaginatedResponse<Catalog>>('/catalogs', { params });
    return response.data;
  },

  /**
   * Obter detalhes de um catálogo específico
   */
  async getCatalog(id: string): Promise<Catalog> {
    const response = await api.get<ApiResponse<Catalog>>(`/catalogs/${id}`);
    return response.data.data;
  },

  /**
   * Upload de catálogo
   */
  async uploadCatalog(
    params: CatalogUploadParams,
    onProgress?: (progress: number) => void
  ): Promise<Catalog> {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('tax_rate', params.tax_rate.toString());
    formData.append('extra_costs', params.extra_costs.toString());

    if (params.ml_links && params.ml_links.length > 0) {
      formData.append('ml_links', JSON.stringify(params.ml_links));
    }

    const response = await uploadFile('/catalogs/upload', formData, onProgress);
    return response.data.data;
  },

  /**
   * Iniciar análise de catálogo
   */
  async startAnalysis(id: string): Promise<void> {
    await api.post(`/catalogs/${id}/start`);
  },

  /**
   * Pausar análise
   */
  async pauseAnalysis(id: string): Promise<void> {
    await api.post(`/catalogs/${id}/pause`);
  },

  /**
   * Retomar análise pausada
   */
  async resumeAnalysis(id: string): Promise<void> {
    await api.post(`/catalogs/${id}/resume`);
  },

  /**
   * Cancelar análise
   */
  async cancelAnalysis(id: string): Promise<void> {
    await api.post(`/catalogs/${id}/cancel`);
  },

  /**
   * Reanalisar catálogo
   */
  async reanalyze(id: string): Promise<void> {
    await api.post(`/catalogs/${id}/reanalyze`);
  },

  /**
   * Deletar catálogo
   */
  async deleteCatalog(id: string): Promise<void> {
    await api.delete(`/catalogs/${id}`);
  },

  /**
   * Obter logs do catálogo
   */
  async getLogs(id: string): Promise<CatalogLog[]> {
    const response = await api.get<ApiResponse<CatalogLog[]>>(`/catalogs/${id}/logs`);
    return response.data.data;
  },
};
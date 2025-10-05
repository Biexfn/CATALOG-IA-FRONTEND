import api from '@/lib/api';
import {
  ReportStats,
  DashboardStats,
  ProductFilters,
  ApiResponse,
} from '@/types';

export const reportService = {
  /**
   * Obter estatísticas do dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data;
  },

  /**
   * Obter estatísticas de relatórios com filtros
   */
  async getReportStats(filters?: ProductFilters): Promise<ReportStats> {
    const response = await api.get<ApiResponse<ReportStats>>('/reports/stats', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Exportar relatório completo
   */
  async exportReport(filters?: ProductFilters): Promise<Blob> {
    const response = await api.get('/reports/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
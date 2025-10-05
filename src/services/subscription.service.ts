import api from '@/lib/api';
import {
  Plan,
  Subscription,
  UsageStats,
  ApiResponse,
} from '@/types';

export const subscriptionService = {
  /**
   * Listar planos disponíveis
   */
  async getPlans(): Promise<Plan[]> {
    const response = await api.get('/subscriptions/plans');
    return response.data.plans;
  },

  /**
   * Obter assinatura atual do usuário
   */
  async getCurrentSubscription(): Promise<Subscription> {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  /**
   * Obter estatísticas de uso
   */
  async getUsageStats(): Promise<UsageStats> {
    const response = await api.get('/subscriptions/usage');
    return response.data;
  },

  /**
   * Criar checkout session do Stripe
   */
  async createCheckoutSession(planId: string, successUrl: string, cancelUrl: string): Promise<{ checkout_url: string; session_id: string }> {
    const response = await api.post('/subscriptions/checkout', {
      plan_id: planId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return response.data;
  },

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(): Promise<void> {
    await api.post('/subscription/cancel');
  },
};
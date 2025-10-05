import { useState, useEffect } from 'react'
import { Check, Crown, Zap, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../api/client'

const Subscription = () => {
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(null)

  useEffect(() => {
    loadUsage()
  }, [])

  const loadUsage = async () => {
    try {
      const { data } = await api.get('/subscriptions/usage')
      setUsage(data)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId) => {
    setCheckoutLoading(planId)
    try {
      const { data } = await api.post('/subscriptions/checkout', {
        plan_id: planId,
        success_url: window.location.origin + '/subscription?success=true',
        cancel_url: window.location.origin + '/subscription'
      })
      window.location.href = data.checkout_url
    } catch (error) {
      alert('Erro ao processar pagamento')
      setCheckoutLoading(null)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    )
  }

  const usagePercentage = usage?.catalogs_limit === 'unlimited' 
    ? 0 
    : ((usage?.catalogs_used || 0) / parseInt(usage?.catalogs_limit || 10)) * 100

  const isCurrentPlanTrial = usage?.plan === 'trial'
  const isCurrentPlanPro = usage?.plan === 'pro'

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assinatura</h1>
          <p className="text-gray-600 mt-1">Gerencie seu plano e pagamentos</p>
        </div>

        {usage && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Plano Atual</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Status: <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{usage.status}</span>
                  </p>
                </div>
                <span className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 text-lg font-bold text-gray-900 uppercase">
                  {usage.plan}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Catálogos este mês</span>
                  <span className="font-medium text-gray-900">
                    {usage.catalogs_used || 0} de{' '}
                    {usage.catalogs_limit === 'unlimited' ? 'Ilimitado' : usage.catalogs_limit}
                  </span>
                </div>
                {usage.catalogs_limit !== 'unlimited' && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-900 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    {usagePercentage >= 80 && (
                      <p className="text-sm text-yellow-600">
                        ⚠️ Você está próximo do limite mensal
                      </p>
                    )}
                  </>
                )}
              </div>

              {usage.current_period_end && (
                <div className="flex justify-between text-sm pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-gray-600">Período atual</p>
                    <p className="font-medium text-gray-900">
                      Renovação em {new Date(usage.current_period_end).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Planos Disponíveis</h2>
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Trial Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 text-center border-b border-gray-200">
                <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Trial</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">Grátis</span>
                  <p className="text-sm text-gray-600 mt-2">2 dias de teste</p>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>10 catálogos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>50 produtos por catálogo</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Análise com IA</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Relatórios básicos</span>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                {isCurrentPlanTrial ? (
                  <button disabled className="w-full py-3 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                    Plano Atual
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade('trial')}
                    disabled={checkoutLoading !== null}
                    className="w-full py-3 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {checkoutLoading === 'trial' ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                      </span>
                    ) : (
                      'Começar Grátis'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Pro Card */}
            <div className="bg-white rounded-xl border-2 border-gray-900 overflow-hidden relative shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-900 text-white">
                  Mais Popular
                </span>
              </div>

              <div className="p-6 text-center border-b border-gray-200">
                <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                <div className="mt-4">
                  <div className="text-4xl font-bold text-gray-900">€1.500</div>
                  <div className="text-gray-600">/mês</div>
                  <p className="text-sm text-gray-500 mt-1">≈ R$ 9.900/mês</p>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="font-semibold">Catálogos ilimitados</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="font-semibold">Produtos ilimitados</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Análise com IA avançada</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Integração Mercado Livre</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Relatórios avançados</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Suporte prioritário</span>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                {isCurrentPlanPro ? (
                  <button disabled className="w-full py-3 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                    Plano Atual
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade('pro')}
                    disabled={checkoutLoading !== null}
                    className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {checkoutLoading === 'pro' ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                      </span>
                    ) : (
                      'Assinar Agora'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Perguntas Frequentes</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Posso cancelar a qualquer momento?
              </h4>
              <p className="text-sm text-gray-600">
                Sim! Você pode cancelar sua assinatura a qualquer momento. Você
                continuará tendo acesso até o fim do período pago.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Como funciona o período trial?
              </h4>
              <p className="text-sm text-gray-600">
                Você tem 2 dias para testar a plataforma com limite de 10 catálogos e 50 produtos por catálogo.
                Após esse período, faça upgrade para o plano Pro para continuar.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                O que acontece se eu exceder o limite no Trial?
              </h4>
              <p className="text-sm text-gray-600">
                Você não poderá fazer upload de novos catálogos até fazer upgrade para o plano Pro com catálogos ilimitados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Subscription
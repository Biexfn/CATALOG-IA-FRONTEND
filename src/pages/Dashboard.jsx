import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { FolderOpen, Package, TrendingUp, DollarSign } from 'lucide-react'
import Layout from '../components/Layout'

const Dashboard = () => {
  const { user } = useAuth()
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsage()
  }, [])

  const loadUsage = async () => {
    try {
      const { data } = await api.get('/subscriptions/usage')
      setUsage(data)
    } catch (error) {
      console.error('Erro ao carregar uso:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Catálogos', value: usage?.catalogs_used || 0, icon: FolderOpen },
    { label: 'Produtos Analisados', value: '0', icon: Package },
    { label: 'Taxa de Conversão', value: '0%', icon: TrendingUp },
    { label: 'ROI Médio', value: '0%', icon: DollarSign }
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo ao seu painel de análise inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon className="text-gray-700" size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Plano Atual</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 capitalize">{usage?.plan || 'Trial'}</p>
              <p className="text-gray-600 mt-1">
                {usage?.catalogs_used || 0} de {usage?.catalogs_limit === 'unlimited' ? '∞' : usage?.catalogs_limit} catálogos usados
              </p>
            </div>
            <div className="w-full max-w-xs ml-8">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-900 h-2 rounded-full transition-all"
                  style={{ 
                    width: usage?.catalogs_limit === 'unlimited' 
                      ? '0%' 
                      : `${Math.min(((usage?.catalogs_used || 0) / parseInt(usage?.catalogs_limit || 10)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Catálogos Recentes</h2>
            <div className="text-center py-12 text-gray-500">
              <FolderOpen size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhum catálogo ainda</p>
              <p className="text-sm mt-2">Faça upload do seu primeiro catálogo</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Produtos em Destaque</h2>
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhum produto analisado</p>
              <p className="text-sm mt-2">Comece a análise para ver resultados</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
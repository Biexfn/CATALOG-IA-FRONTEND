import { BarChart3 } from 'lucide-react'
import Layout from '../components/Layout'

const Reports = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises e insights dos seus produtos</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BarChart3 className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-600 text-lg mb-2">Nenhum relatório disponível</p>
          <p className="text-gray-500">Os relatórios aparecerão após análise dos produtos</p>
        </div>
      </div>
    </Layout>
  )
}

export default Reports
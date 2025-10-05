import { useState } from 'react'
import { Link as LinkIcon } from 'lucide-react'
import Layout from '../components/Layout'

const Analyzer = () => {
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  const handleAnalyze = () => {
    if (!url) return
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      alert('Análise implementada em breve!')
    }, 1000)
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analisador de Links</h1>
          <p className="text-gray-600 mt-1">Analise produtos do Mercado Livre</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              URL do Mercado Livre
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                placeholder="https://produto.mercadolivre.com.br/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!url || analyzing}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? 'Analisando...' : 'Analisar Produto'}
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default Analyzer
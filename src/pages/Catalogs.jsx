import { useState } from 'react'
import { FolderOpen, Search } from 'lucide-react'
import Layout from '../components/Layout'

const Catalogs = () => {
  const [search, setSearch] = useState('')

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Catálogos</h1>
          <p className="text-gray-600 mt-1">Gerencie seus catálogos enviados</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar catálogos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderOpen className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-600 text-lg mb-2">Nenhum catálogo encontrado</p>
          <p className="text-gray-500">Faça upload do seu primeiro catálogo para começar</p>
        </div>
      </div>
    </Layout>
  )
}

export default Catalogs
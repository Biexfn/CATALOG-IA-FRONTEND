import { useState } from 'react'
import { Upload as UploadIcon, FileText, AlertCircle } from 'lucide-react'
import Layout from '../components/Layout'

const Upload = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      alert('Upload implementado em breve!')
    }, 1000)
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload de Catálogo</h1>
          <p className="text-gray-600 mt-1">Envie seu catálogo em Excel ou CSV</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
            {!file ? (
              <>
                <UploadIcon className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-4">Arraste um arquivo ou clique para selecionar</p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors font-medium"
                >
                  Selecionar Arquivo
                </label>
              </>
            ) : (
              <div>
                <FileText className="mx-auto text-gray-900 mb-4" size={48} />
                <p className="font-medium text-gray-900 mb-2">{file.name}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
                  >
                    {uploading ? 'Enviando...' : 'Fazer Upload'}
                  </button>
                  <button
                    onClick={() => setFile(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg flex gap-3 border border-gray-200">
            <AlertCircle className="text-gray-600 flex-shrink-0" size={20} />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Formatos aceitos:</p>
              <p>Excel (.xlsx, .xls) ou CSV (.csv)</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Upload
import { useState, useRef } from 'react'
import { updateAvatar } from '../services/api'
import { Label } from './ui'
import type { ApiError } from '../types'

interface Props {
  currentImage?: string | null
  onImageChange: (imageUrl: string | null) => void
  label?: string
  className?: string
}

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  label = "Imagem",
  className = ""
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validação básica
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('A imagem deve ter no máximo 5MB')
      return
    }

    setError(null)
    setPreview(URL.createObjectURL(file))
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      // Usa o mesmo serviço de upload do User (updateAvatar)
      // Na prática, isso deveria ser um serviço genérico, mas por enquanto reutilizamos
      const result = await updateAvatar('temp', file) // ID temporário só para o upload
      onImageChange(result.image)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      {/* Preview da imagem */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586 1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Botão de upload */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white flex items-center justify-center shadow-md transition-colors"
            title="Fazer upload da imagem"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </button>
        </div>

        {/* Input hidden e informações */}
        <div className="flex-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors"
          >
            {fileRef.current?.files?.[0] ? `✓ ${fileRef.current.files[0].name}` : 'Clique para selecionar imagem'}
          </button>
          {fileRef.current?.files?.[0] && (
            <p className="text-xs text-gray-500 mt-1">
              {(fileRef.current.files[0].size / 1024).toFixed(0)} KB · {fileRef.current.files[0].type}
            </p>
          )}
        </div>
      </div>

      {/* URL da imagem (se houver) */}
      {currentImage && !fileRef.current?.files?.[0] && (
        <div>
          <Label>URL Atual</Label>
          <input
            type="text"
            value={currentImage}
            readOnly
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
            placeholder="Nenhuma imagem definida"
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

// Redimensiona imágenes antes de guardarlas como data URL, para no reventar
// la cuota de localStorage con fotos de móvil a tamaño completo.
export function fileToCompressedDataUrl(file: File, maxSize = 900, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      img.onload = () => {
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          } else {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(reader.result as string)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

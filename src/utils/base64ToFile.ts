export function base64ToFile(base64: string, filename: string): File | null {
  if (!base64.startsWith('data:image/jpeg;base64,')) {
    base64 = 'data:image/jpeg;base64,' + base64
  }

  const arr = base64.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)

  if (!mimeMatch) {
    console.error('Invalid base64 string')

    return null
  }

  const mime = mimeMatch[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

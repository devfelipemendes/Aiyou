export const getInitials = (str: string) => {
  if (!str) return ''

  return str
    .trim()
    .split(/\s+/) // quebra em palavras
    .slice(0, 2) // pega só as 2 primeiras
    .map(word => word[0]) // pega a primeira letra
    .join('') // junta
    .toLowerCase() // se quiser sempre minúsculo
}

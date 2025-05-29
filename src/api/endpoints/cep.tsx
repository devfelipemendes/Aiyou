import { externalApi, type CepResponse } from '../ApiCreate/cepApi'

// Injeção de endpoints para CEP
export const cepApi = externalApi.injectEndpoints({
  endpoints: builder => ({
    getCepInfo: builder.query<CepResponse, string>({
      query: cep => ({
        url: `https://viacep.com.br/ws/${cep}/json/`,
        method: 'GET'
      }),
      providesTags: (result, error, cep) => [{ type: 'Cep', id: cep }],

      // Cache por 5 minutos (300 segundos)
      keepUnusedDataFor: 300,

      // Transformar a resposta se necessário
      transformResponse: (response: CepResponse) => {
        // Se a API retornar erro, ainda retornamos o objeto com a flag erro
        return response
      },

      // Transformar erro se necessário
      transformErrorResponse: response => {
        return {
          status: response.status,
          message: 'Erro ao buscar informações do CEP'
        }
      }
    })
  }),
  overrideExisting: false
})

// Export dos hooks gerados automaticamente
export const { useGetCepInfoQuery, useLazyGetCepInfoQuery } = cepApi

// Export da API para uso em outros lugares se necessário
export default cepApi

// src/api/endpoints/activityApi.ts
import { apiSlice } from '@/api/ApiCreate/apiSlice'

/* ------------------------- 🎯 TYPES ------------------------- */

// Atividade individual
export type Activity = {
  id: string
  subject_type: string
  subject_id: string
  causer_type: string
  causer_id: string
  causer_name: string
  log_name: string
  description: string
  event: string
  created_at: string
  updated_at: string
  properties: { attributes: Attributes }
}
export type Attributes = {
  id: string
  user_id: string
  name: string
  img_url: string
  description: null
  created_at: string
  updated_at: string
  deleted_at: string
}

// GET /v1/activity response
export type GetActivitiesResponse = {
  message: string
  status: number
  data: Activity[]
}

// Filtros aceitos no endpoint
export type ActivityFilters = {
  subject_type?: string
  subject_id?: string
  causer_type?: string
  causer_id?: string
  log_name?: string
  description?: string
  event?: string
  created_at_between?: string // formato "YYYY-MM-DD,YYYY-MM-DD"
  updated_at_between?: string // formato "YYYY-MM-DD,YYYY-MM-DD"
  sort?: string // ex: "-created_at"
}

// Error
type ActivityError = {
  status: number
  message: string
}

/* ------------------------- 🎯 API ENDPOINTS ------------------------- */
export const activityApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // GET LIST activities
    getActivities: builder.query<GetActivitiesResponse, ActivityFilters>({
      query: (filters: ActivityFilters) => {
        const params = new URLSearchParams()

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (key === 'sort') {
              // envia sort como query normal, não como filter
              params.append('sort', value)
            } else {
              params.append(`filter[${key}]`, value)
            }
          }
        })

        return {
          url: `/activity?${params.toString()}`,
          method: 'GET',
          headers: { Accept: 'application/json' }
        }
      },
      transformResponse: (response: GetActivitiesResponse) => {
        console.log('🔍 DEBUG - GET activities:', response)

        return response
      },
      transformErrorResponse: (response: any): ActivityError => ({
        status: response.status || 500,
        message: response?.data?.message || response?.message || 'Erro ao carregar atividades'
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(activity => ({ type: 'Activity' as const, id: activity.id })),
              { type: 'Activity', id: 'LIST' }
            ]
          : [{ type: 'Activity', id: 'LIST' }]
    })
  })
})

/* ------------------------- 🎯 EXPORT HOOKS ------------------------- */
export const { useGetActivitiesQuery } = activityApi

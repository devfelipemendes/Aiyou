'use client'

// app/protocol/[id]/page.tsx (App Router)
import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import ProtocolChat from '@/components/ProtocolChat'

interface PageProps {
  params: Promise<{ id: string }> // params is now a Promise
}

/**
 * Protocol Chat Page
 *
 * This page displays the chat interface for a specific protocol
 * The protocol ID is extracted from the URL parameters
 */
const ProtocolPage = ({ params }: PageProps) => {
  const router = useRouter()
  const [id, setId] = useState<string>('')
  const [authToken, setAuthToken] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Await params to get the id
        const resolvedParams = await params
        const { id: protocolId } = resolvedParams

        setId(protocolId)

        // Get token from localStorage
        const storedToken = localStorage.getItem('auth_token')

        if (storedToken) {
          setAuthToken(storedToken)
        } else {
          // Redirect to login if no token
          // router.push('/login');
          setAuthToken('5|czTc4dRSLvzyyAo5s0YN442f3BQq7THjmOYosldR5fbafb01') // TODO: REMOVE auth token and redirect do login
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params, router])

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-gray-500'>Loading...</div>
      </div>
    )
  }

  if (!id) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-red-500'>Invalid protocol ID</div>
      </div>
    )
  }

  if (!authToken) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-red-500'>Authentication required</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto p-4'>
        <div className='bg-white shadow-lg rounded-lg overflow-hidden h-[600px] flex flex-col'>
          <div className='bg-blue-600 text-white p-4'>
            <h1 className='text-xl font-semibold'>Protocol Chat - {id}</h1>
            <p className='text-sm opacity-75'>Real-time conversation</p>
          </div>

          <div className='flex-1 overflow-hidden'>
            <ProtocolChat protocolId={id} authToken={authToken} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProtocolPage

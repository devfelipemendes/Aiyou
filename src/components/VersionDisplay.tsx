// src/components/VersionDisplay.tsx
'use client'
import { useState, useEffect } from 'react'

import { Chip, Typography } from '@mui/material'

interface VersionInfo {
  version: string
  buildDate: string
  commit: string
  pipeline?: string
  releaseType?: string
}

const VersionDisplay = ({
  color = 'primary',
  size = 'small'
}: {
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'small' | 'medium'
}) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)

  useEffect(() => {
    const loadVersion = async () => {
      try {
        const response = await fetch('/version.json')

        if (response.ok) {
          const data = await response.json()

          console.log('🏷️ Versão carregada:', data)
          setVersionInfo(data)
        } else {
          throw new Error('version.json não encontrado')
        }
      } catch (error) {
        console.warn('⚠️ Erro ao carregar versão:', error)

        // Fallback
        setVersionInfo({
          version: '1.0.0',
          buildDate: new Date().toISOString(),
          commit: 'local',
          releaseType: 'development'
        })
      }
    }

    loadVersion()
  }, [])

  if (!versionInfo) {
    return <Chip label='...' size={size} variant='outlined' />
  }

  const version = versionInfo.version.startsWith('v') ? versionInfo.version : `v${versionInfo.version}`

  return (
    <Typography
      color={color}
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      {version}
    </Typography>
  )
}

export default VersionDisplay

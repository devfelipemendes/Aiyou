// src/utils/notifications/soundNotifications.ts

export type NotificationType = 'operator_called' | 'new_protocol'

interface SoundConfig {
  frequency: number
  duration: number
  volume: number
  repetitions: number
  interval?: number
  waveType: OscillatorType
}

class SoundNotificationManager {
  private audioContext: AudioContext | null = null
  private isEnabled: boolean = true

  private soundConfigs: Record<NotificationType, SoundConfig> = {
    operator_called: {
      frequency: 1000,
      duration: 300,
      volume: 0.7,
      repetitions: 3,
      interval: 400,
      waveType: 'sine'
    },
    new_protocol: {
      frequency: 600,
      duration: 200,
      volume: 0.5,
      repetitions: 1,
      waveType: 'sine'
    }
  }

  constructor() {
    this.initializeAudioContext()
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('🔇 Web Audio API não suportada:', error)
      this.isEnabled = false
    }
  }

  private async ensureAudioContextResumed() {
    if (!this.audioContext) return false

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume()
      } catch (error) {
        console.warn('🔇 Erro ao resumir AudioContext:', error)

        return false
      }
    }

    return this.audioContext.state === 'running'
  }

  private createTone(frequency: number, duration: number, volume: number, waveType: OscillatorType): Promise<void> {
    return new Promise(resolve => {
      if (!this.audioContext) {
        resolve()

        return
      }

      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      oscillator.type = waveType

      // Envelope ADSR suave
      const now = this.audioContext.currentTime
      const endTime = now + duration / 1000

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.03) // Attack
      gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, endTime - 0.05) // Sustain
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime) // Release

      oscillator.start(now)
      oscillator.stop(endTime)

      oscillator.onended = () => resolve()
    })
  }

  async playNotification(type: NotificationType): Promise<void> {
    if (!this.isEnabled) {
      console.log('🔇 Notificações sonoras desabilitadas')

      return
    }

    const canPlay = await this.ensureAudioContextResumed()

    if (!canPlay) {
      console.warn('🔇 AudioContext não pode ser iniciado')

      return
    }

    const config = this.soundConfigs[type]

    console.log(`🔊 Reproduzindo notificação: ${type}`)

    try {
      for (let i = 0; i < config.repetitions; i++) {
        await this.createTone(config.frequency, config.duration, config.volume, config.waveType)

        if (i < config.repetitions - 1 && config.interval) {
          await this.delay(config.interval)
        }
      }
    } catch (error) {
      console.error('🔇 Erro ao reproduzir notificação:', error)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Métodos de controle
  enable() {
    this.isEnabled = true

    if (!this.audioContext) {
      this.initializeAudioContext()
    }
  }

  disable() {
    this.isEnabled = false
  }

  isNotificationEnabled(): boolean {
    return this.isEnabled && !!this.audioContext
  }

  // Método para testar sons
  async testSound(type: NotificationType) {
    console.log(`🧪 Testando som: ${type}`)
    await this.playNotification(type)
  }

  // Atualizar configurações
  updateConfig(type: NotificationType, config: Partial<SoundConfig>) {
    this.soundConfigs[type] = { ...this.soundConfigs[type], ...config }
  }

  getConfig(type: NotificationType): SoundConfig {
    return { ...this.soundConfigs[type] }
  }
}

// Singleton instance
export const soundNotificationManager = new SoundNotificationManager()

// Hook para usar no React
export const useSoundNotifications = () => {
  const playOperatorCalled = () => soundNotificationManager.playNotification('operator_called')
  const playNewProtocol = () => soundNotificationManager.playNotification('new_protocol')

  return {
    playOperatorCalled,
    playNewProtocol,
    testOperatorSound: () => soundNotificationManager.testSound('operator_called'),
    testProtocolSound: () => soundNotificationManager.testSound('new_protocol'),
    enableSounds: () => soundNotificationManager.enable(),
    disableSounds: () => soundNotificationManager.disable(),
    isEnabled: soundNotificationManager.isNotificationEnabled()
  }
}

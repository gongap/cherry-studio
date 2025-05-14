import { isWindows } from '@renderer/config/constant'
import { IpcChannel } from '@shared/IpcChannel'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function useFullScreenNotice() {
  const { t } = useTranslation()

  useEffect(() => {
    // Check if running in an Electron environment before accessing window.electron.ipcRenderer
    if (typeof window !== 'undefined' && typeof window.electron !== 'undefined' && typeof window.electron.ipcRenderer !== 'undefined') {
      const cleanup = window.electron.ipcRenderer.on(IpcChannel.FullscreenStatusChanged, (_, isFullscreen) => {
        if (isWindows && isFullscreen) {
          window.message.info({
            content: t('common.fullscreen'),
            duration: 3,
            key: 'fullscreen-notification'
          })
        }
      })

      return () => {
        cleanup()
      }
    }
    // If not in Electron, return a cleanup function that does nothing
    return () => {}
  }, [t])
}

export default useFullScreenNotice

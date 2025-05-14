import { backup } from '@renderer/services/BackupService'
import { IpcChannel } from '@shared/IpcChannel'
import { Modal, Progress } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TopView } from '../TopView'

// Define a helper to check for Electron renderer environment locally
const isElectronRenderer = () =>
  typeof window !== 'undefined' &&
  typeof window.electron !== 'undefined' &&
  typeof window.electron.ipcRenderer !== 'undefined';

interface Props {
  resolve: (data: any) => void
}

interface ProgressData {
  stage: string
  progress: number
  total: number
}

const PopupContainer: React.FC<Props> = ({ resolve }) => {
  const [open, setOpen] = useState(true)
  const [progressData, setProgressData] = useState<ProgressData>()
  const { t } = useTranslation()

  // Only register IPC listener in Electron environment
  useEffect(() => {
    if (isElectronRenderer()) {
      const removeListener = window.electron.ipcRenderer.on(IpcChannel.BackupProgress, (_, data: ProgressData) => {
        setProgressData(data)
      })

      return () => {
        removeListener()
      }
    }
    // If not in Electron, return a cleanup function that does nothing
    return () => {};
  }, [])

  const onOk = async () => {
    // The actual backup logic also likely needs to be Electron-specific or handled differently in web
    // For now, we'll assume the backup service itself handles the environment or we'll address it later if needed.
    await backup()
    setOpen(false)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve({})
  }

  const getProgressText = () => {
    if (!progressData) return ''

    if (progressData.stage === 'copying_files') {
      return t(`backup.progress.${progressData.stage}`, {
        progress: Math.floor(progressData.progress)
      })
    }
    return t(`backup.progress.${progressData.stage}`)
  }

  BackupPopup.hide = onCancel

  const isDisabled = progressData ? progressData.stage !== 'completed' : false

  return (
    <Modal
      title={t('backup.title')}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={onClose}
      okButtonProps={{ disabled: isDisabled }}
      cancelButtonProps={{ disabled: isDisabled }}
      okText={t('backup.confirm.button')}
      maskClosable={false}
      transitionName="animation-move-down"
      centered>
      {!progressData && <div>{t('backup.content')}</div>}
      {progressData && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Progress percent={Math.floor(progressData.progress)} strokeColor="var(--color-primary)" />
          <div style={{ marginTop: 16 }}>{getProgressText()}</div>
        </div>
      )}
    </Modal>
  )
}

const TopViewKey = 'BackupPopup'

export default class BackupPopup {
  static topviewId = 0
  static hide() {
    TopView.hide(TopViewKey)
  }
  static show() {
    // Prevent showing popup or its Electron-specific logic in web environment
    if (!isElectronRenderer()) {
      console.warn('Backup functionality is only available in the Electron client.');
      return Promise.resolve({}); // Return a resolved promise to avoid breaking expected flow
    }

    // Original logic to show the popup using TopView.show - only executed in Electron
    return new Promise<any>((resolve) => {
      TopView.show(
        <PopupContainer
          resolve={(v) => {
            resolve(v)
            TopView.hide(TopViewKey)
          }}
        />,
        TopViewKey
      )
    })
  }
}

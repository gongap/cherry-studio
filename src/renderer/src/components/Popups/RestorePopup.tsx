import { restore } from '@renderer/services/BackupService'
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

  // Only set up IPC listener effect in Electron environment
  if (isElectronRenderer()) {
    useEffect(() => {
      const removeListener = window.electron.ipcRenderer.on(IpcChannel.RestoreProgress, (_, data: ProgressData) => {
        setProgressData(data)
      })

      return () => {
        removeListener()
      }
    }, []) // Empty dependency array as the effect should only run once on mount in Electron
  }

  const onOk = async () => {
    await restore()
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
      return t(`restore.progress.${progressData.stage}`, {
        progress: Math.floor(progressData.progress)
      })
    }
    return t(`restore.progress.${progressData.stage}`)
  }

  RestorePopup.hide = onCancel

  const isDisabled = progressData ? progressData.stage !== 'completed' : false

  return (
    <Modal
      title={t('restore.title')}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={onClose}
      okText={t('restore.confirm.button')}
      okButtonProps={{ disabled: isDisabled }}
      cancelButtonProps={{ disabled: isDisabled }}
      maskClosable={false}
      transitionName="animation-move-down"
      centered>
      {!progressData && <div>{t('restore.content')}</div>}
      {progressData && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Progress percent={Math.floor(progressData.progress)} strokeColor="var(--color-primary)" />
          <div style={{ marginTop: 16 }}>{getProgressText()}</div>
        </div>
      )}
    </Modal>
  )
}

const TopViewKey = 'RestorePopup'

export default class RestorePopup {
  static topviewId = 0
  static hide() {
    TopView.hide(TopViewKey)
  }
  static show() {
    // Prevent showing popup or its Electron-specific logic in web environment
    if (!isElectronRenderer()) {
      console.warn('Restore functionality is only available in the Electron client.');
      return Promise.resolve({}); // Return a resolved promise to avoid breaking expected flow
    }

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

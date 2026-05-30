import './InstallBanner.css'

interface InstallBannerProps {
  isIOS: boolean
  onInstall: () => void
  onDismiss: () => void
}

export default function InstallBanner({ isIOS, onInstall, onDismiss }: InstallBannerProps) {
  return (
    <div className="install-banner">
      <div className="install-content">
        <span className="install-icon">📲</span>
        <div className="install-text">
          {isIOS ? (
            <>
              <p className="install-title">Установить приложение</p>
              <p className="install-hint">Нажмите ⬆ → «На экран «Домой»»</p>
            </>
          ) : (
            <>
              <p className="install-title">Установите приложение</p>
              <p className="install-hint">Быстрый доступ из главного экрана</p>
            </>
          )}
        </div>
      </div>

      <div className="install-actions">
        {!isIOS && (
          <button className="install-btn primary" onClick={onInstall}>
            Установить
          </button>
        )}
        <button className="install-btn close" onClick={onDismiss}>
          ✕
        </button>
      </div>
    </div>
  )
}

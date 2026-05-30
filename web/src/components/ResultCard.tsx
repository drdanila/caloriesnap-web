import { Meal } from '../services/mealService'
import { Modal, Badge, Stat, Button } from '../ui'
import { useT } from '../i18n/I18nProvider'
import './ResultCard.css'

interface ResultCardProps {
  result: Omit<Meal, 'id' | 'userId' | 'createdAt'>
  imageUrl: string
  onClose: () => void
}

export function ResultCard({ result, imageUrl, onClose }: ResultCardProps) {
  const { t } = useT()
  const confTone = result.confidence >= 80 ? 'success' : result.confidence >= 60 ? 'warning' : 'danger'
  const confEmoji = result.confidence >= 80 ? '✅' : result.confidence >= 60 ? '⚠️' : '❌'

  return (
    <Modal open onClose={onClose} variant="sheet" ariaLabel={result.dishName}>
      <div className="result">
        {imageUrl && <img src={imageUrl} alt={result.dishName} className="result__image" />}

        <div className="result__body">
          <h2 className="result__dish">{result.dishName}</h2>

          <div className="result__header">
            <Badge tone="mint">🔥 {result.calories} {t('kcal')}</Badge>
            <Badge tone={confTone}>{confEmoji} {result.confidence}%</Badge>
          </div>

          <div className="result__macros">
            <Stat value={`${result.protein}${t('unit_g')}`} label={`🥩 ${t('protein')}`} />
            <Stat value={`${result.fat}${t('unit_g')}`} label={`🧈 ${t('fat')}`} />
            <Stat value={`${result.carbs}${t('unit_g')}`} label={`🍞 ${t('carbs')}`} />
          </div>

          <div className="result__rows">
            <div className="result__row">🌾 {t('fiber')}: {result.fiber ?? 0}{t('unit_g')}</div>
            <div className="result__row">📏 {t('portion')}: {result.portionSize}</div>
            {result.ingredients && result.ingredients.length > 0 && (
              <div className="result__row">
                <strong>{t('ingredients')}:</strong> {result.ingredients.join(', ')}
              </div>
            )}
            {result.notes && <div className="result__row result__note">📝 {result.notes}</div>}
          </div>

          <Button fullWidth size="lg" onClick={onClose}>{t('gotIt')}</Button>
        </div>
      </div>
    </Modal>
  )
}

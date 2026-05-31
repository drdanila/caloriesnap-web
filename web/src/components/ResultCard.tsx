import { Meal } from '../services/mealService'
import { Modal, Badge, Stat, Button } from '../ui'
import { useT } from '../i18n/I18nProvider'
import { confidenceBand, formatCalories, isLowConfidence, hasPortion } from '../lib/nutrition'
import './ResultCard.css'

interface ResultCardProps {
  result: Omit<Meal, 'id' | 'userId' | 'createdAt'>
  imageUrl: string
  onClose: () => void
  /** Offered on the low-confidence banner; when absent, only the hint is shown (e.g. in history). */
  onRetake?: () => void
}

export function ResultCard({ result, imageUrl, onClose, onRetake }: ResultCardProps) {
  const { t } = useT()
  const conf = confidenceBand(result.confidence)
  const lowConfidence = isLowConfidence(result)
  const allergens = result.allergens ?? []
  const tags = result.tags ?? []
  const recommendations = result.recommendations ?? []
  const warnings = result.warnings ?? []
  const summaryText = result.summary || result.notes

  return (
    <Modal open onClose={onClose} variant="sheet" ariaLabel={result.dishName}>
      <div className="result">
        {imageUrl && <img src={imageUrl} alt={result.dishName} className="result__image" />}

        <div className="result__body">
          <h2 className="result__dish">{result.dishName}</h2>

          {lowConfidence && (
            <div className="result__banner">
              <div className="result__banner-text">
                <strong>⚠️ {t('lowConfidenceTitle')}</strong>
                <span>{t('lowConfidenceHint')}</span>
              </div>
              {onRetake && (
                <Button size="sm" variant="secondary" onClick={onRetake}>
                  {t('retakePhoto')}
                </Button>
              )}
            </div>
          )}

          <div className="result__header">
            <Badge tone="mint">🔥 {formatCalories(result)} {t('kcal')}</Badge>
            <Badge tone={conf.tone}>{conf.emoji} {result.confidence}%</Badge>
            {result.healthScore != null && (
              <Badge tone="neutral">🌿 {t('healthScore')}: {result.healthScore}</Badge>
            )}
            {result.mealType && result.mealType !== 'unknown' && (
              <Badge tone="neutral">{t(`mealType_${result.mealType}`)}</Badge>
            )}
          </div>

          <div className="result__macros">
            <Stat value={`${result.protein}${t('unit_g')}`} label={`🥩 ${t('protein')}`} />
            <Stat value={`${result.fat}${t('unit_g')}`} label={`🧈 ${t('fat')}`} />
            <Stat value={`${result.carbs}${t('unit_g')}`} label={`🍞 ${t('carbs')}`} />
          </div>

          <div className="result__rows">
            <div className="result__row">🌾 {t('fiber')}: {result.fiber ?? 0}{t('unit_g')}</div>
            {hasPortion(result.portionSize) && (
              <div className="result__row">📏 {t('portion')}: {result.portionSize}</div>
            )}
            {result.ingredients && result.ingredients.length > 0 && (
              <div className="result__row">
                <strong>{t('ingredients')}:</strong> {result.ingredients.join(', ')}
              </div>
            )}

            {allergens.length > 0 && (
              <div className="result__row">
                <strong>{t('allergens')}:</strong>
                <div className="result__chips">
                  {allergens.map((a) => (
                    <Badge key={a} tone="danger">{a}</Badge>
                  ))}
                </div>
              </div>
            )}

            {tags.length > 0 && (
              <div className="result__chips">
                {tags.map((tag) => (
                  <Badge key={tag} tone="neutral">{tag}</Badge>
                ))}
              </div>
            )}

            {summaryText && <div className="result__row result__note">📝 {summaryText}</div>}

            {recommendations.length > 0 && (
              <div className="result__row">
                <strong>{t('recommendations')}:</strong>
                <ul className="result__list">
                  {recommendations.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="result__row result__warn">
                <strong>{t('warnings')}:</strong>
                <ul className="result__list">
                  {warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Button fullWidth size="lg" onClick={onClose}>{t('gotIt')}</Button>
        </div>
      </div>
    </Modal>
  )
}

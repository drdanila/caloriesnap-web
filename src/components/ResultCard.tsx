import { Meal } from '../services/mealService'
import './ResultCard.css'

interface ResultCardProps {
  result: Omit<Meal, 'id' | 'userId' | 'createdAt'>
  imageUrl: string
  onClose: () => void
}

export function ResultCard({ result, imageUrl, onClose }: ResultCardProps) {
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return '✅'
    if (confidence >= 60) return '⚠️'
    return '❌'
  }

  return (
    <>
      <div className="result-backdrop" onClick={onClose} />
      <div className="result-card">
        <button className="result-close" onClick={onClose}>✕</button>

        <img src={imageUrl} alt={result.dishName} className="result-image" />

        <h2 className="result-dish">{result.dishName}</h2>

        <div className="result-header">
          <div className="result-calories">
            <span className="calories-icon">🔥</span>
            <span className="calories-value">{result.calories} kcal</span>
          </div>
          <div className="result-confidence">
            {getConfidenceBadge(result.confidence)}
            <span className="confidence-value">{result.confidence}%</span>
          </div>
        </div>

        <div className="result-macros">
          <div className="macro">
            <span className="macro-icon">🥩</span>
            <span className="macro-label">Protein</span>
            <span className="macro-value">{result.protein}g</span>
          </div>
          <div className="macro">
            <span className="macro-icon">🧈</span>
            <span className="macro-label">Fat</span>
            <span className="macro-value">{result.fat}g</span>
          </div>
          <div className="macro">
            <span className="macro-icon">🍞</span>
            <span className="macro-label">Carbs</span>
            <span className="macro-value">{result.carbs}g</span>
          </div>
        </div>

        {result.fiber && (
          <div className="result-fiber">
            🌾 Fiber: {result.fiber}g
          </div>
        )}

        <div className="result-portion">
          📏 Portion: {result.portionSize}
        </div>

        {result.ingredients && result.ingredients.length > 0 && (
          <div className="result-ingredients">
            <span className="ingredients-label">Ingredients:</span>
            <span className="ingredients-list">{result.ingredients.join(', ')}</span>
          </div>
        )}

        {result.notes && (
          <div className="result-notes">
            📝 {result.notes}
          </div>
        )}

        <button className="result-ok" onClick={onClose}>Got it</button>
      </div>
    </>
  )
}

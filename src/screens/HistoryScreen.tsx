import { useState } from 'react'
import { Meal, deleteMeal } from '../services/mealService'
import { ResultCard } from '../components/ResultCard'
import './HistoryScreen.css'

export default function HistoryScreen({ meals, onMealDelete }: { meals: Meal[]; onMealDelete: (id: string) => Promise<void> }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  const dateLabel = isToday
    ? 'Сегодня'
    : selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  const dayMeals = meals.filter(meal =>
    new Date(meal.createdAt).toDateString() === selectedDate.toDateString()
  )

  const dayCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0)

  if (meals.length === 0) {
    return (
      <div className="history-screen empty">
        <div className="empty-state">
          <div className="empty-emoji">📸</div>
          <p>No meals logged yet</p>
          <span>Start by taking a photo of your meal</span>
        </div>
      </div>
    )
  }

  return (
    <div className="history-screen">
      <div className="date-nav">
        <button onClick={() => setSelectedDate(d => new Date(d.getTime() - 86400000))}>←</button>
        <span className="date-label">{dateLabel}</span>
        <button onClick={() => setSelectedDate(d => new Date(d.getTime() + 86400000))} disabled={isToday}>→</button>
      </div>

      <div className="day-summary">
        <span>{dayCalories} kcal</span>
        <span>{dayMeals.length} блюд</span>
      </div>

      <div className="meals-list">
        {dayMeals.length === 0 ? (
          <div className="empty-day">
            <p>Нет блюд в этот день</p>
          </div>
        ) : (
          dayMeals.map((meal) => {
            const time = new Date(meal.createdAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })
            return (
              <div key={meal.id} className="meal-item">
                <button
                  className="meal-delete-btn"
                  onClick={() => setConfirmingId(meal.id)}
                  title="Delete meal"
                >
                  🗑️
                </button>

                <div className="meal-image-col">
                  <div className="meal-image meal-clickable" onClick={() => setSelectedMeal(meal)}>
                    {meal.imageUrl ? (
                      <img src={meal.imageUrl} alt={meal.dishName} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <span className="meal-emoji">🍽️</span>
                    )}
                  </div>
                  <span className="meal-cal-badge">{meal.calories}</span>
                </div>

                <div className="meal-details meal-clickable" onClick={() => setSelectedMeal(meal)}>
                  <div className="meal-header">
                    <h4 style={{ cursor: 'pointer' }}>{meal.dishName}</h4>
                    <span className="meal-time">{time}</span>
                  </div>
                  <p className="meal-macros">
                    P: {meal.protein}g · F: {meal.fat}g · C: {meal.carbs}g
                  </p>
                  <div className="confidence-bar-wrap">
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{
                          width: `${meal.confidence}%`,
                          background: meal.confidence >= 80 ? '#3fa876' : meal.confidence >= 60 ? '#f39c12' : '#e74c3c'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {selectedMeal && (() => {
        const { id, userId, createdAt, ...mealResult } = selectedMeal
        return (
          <ResultCard
            result={mealResult}
            imageUrl={selectedMeal.imageUrl || ''}
            onClose={() => setSelectedMeal(null)}
          />
        )
      })()}

      {confirmingId && (
        <>
          <div className="confirm-backdrop" onClick={() => setConfirmingId(null)} />
          <div className="confirm-dialog">
            <h3>Удалить это блюдо?</h3>
            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={() => setConfirmingId(null)}
              >
                Отмена
              </button>
              <button
                className="confirm-delete"
                onClick={async () => {
                  await onMealDelete(confirmingId)
                  setConfirmingId(null)
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

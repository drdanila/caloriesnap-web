import { useState } from 'react'
import { Meal } from '../services/mealService'
import './HistoryScreen.css'

export default function HistoryScreen({ meals }: { meals: Meal[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

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
                <div className="meal-image">
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.dishName} />
                  ) : (
                    <span className="meal-emoji">🍽️</span>
                  )}
                </div>
                <div className="meal-details">
                  <div className="meal-header">
                    <h4>{meal.dishName}</h4>
                    <span className="meal-time">{time}</span>
                  </div>
                  <p className="meal-portion">{meal.portionSize}</p>
                  <p className="meal-macros">
                    P: {meal.protein}g | F: {meal.fat}g | C: {meal.carbs}g
                    {meal.fiber && ` | Fiber: ${meal.fiber}g`}
                  </p>
                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <p className="meal-ingredients">
                      {meal.ingredients.slice(0, 3).join(', ')}
                      {meal.ingredients.length > 3 && ` +${meal.ingredients.length - 3}`}
                    </p>
                  )}
                  {meal.notes && <p className="meal-notes">📝 {meal.notes}</p>}
                  <p className="confidence-level">
                    {meal.confidence >= 80 ? '✅' : meal.confidence >= 60 ? '⚠️' : '❌'} Confidence: {meal.confidence}%
                  </p>
                </div>
                <div className="meal-calories">
                  <span className="calories-badge">{meal.calories}</span>
                  <span className="calories-unit">kcal</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

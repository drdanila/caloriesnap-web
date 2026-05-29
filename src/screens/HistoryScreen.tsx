import { Meal } from '../services/mealService'
import './HistoryScreen.css'

export default function HistoryScreen({ meals }: { meals: Meal[] }) {
  const groupedMeals = groupByDate(meals)

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

  const stats = {
    total: meals.length,
    avgCalories: Math.round(
      meals.reduce((sum, m) => sum + m.calories, 0) / meals.length
    ),
    totalCalories: meals.reduce((sum, m) => sum + m.calories, 0),
  }

  return (
    <div className="history-screen">
      <h2>Meal History</h2>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">Total Meals</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total Calories</span>
          <span className="stat-value">{stats.totalCalories}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Avg per Meal</span>
          <span className="stat-value">{stats.avgCalories}</span>
        </div>
      </div>

      <div className="meals-list">
        {Object.entries(groupedMeals).map(([date, dayMeals]) => (
          <div key={date}>
            <h3 className="date-header">{date}</h3>
            {dayMeals.map((meal) => (
              <div key={meal.id} className="meal-item">
                <div className="meal-emoji">🍽️</div>
                <div className="meal-details">
                  <h4>{meal.dishName}</h4>
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
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function groupByDate(meals: Meal[]): Record<string, Meal[]> {
  const grouped: Record<string, Meal[]> = {}

  meals.forEach((meal) => {
    const date = new Date(meal.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let dateStr: string
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateStr = 'Yesterday'
    } else {
      dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }

    if (!grouped[dateStr]) {
      grouped[dateStr] = []
    }
    grouped[dateStr].push(meal)
  })

  return grouped
}

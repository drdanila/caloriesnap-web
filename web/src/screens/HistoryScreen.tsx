import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Meal } from '../services/mealService'
import { ResultCard } from '../components/ResultCard'
import { Badge, Button, Card, EmptyState, IconButton, Modal } from '../ui'
import { useT } from '../i18n/I18nProvider'
import './HistoryScreen.css'

export default function HistoryScreen({
  meals,
  onMealDelete,
}: {
  meals: Meal[]
  onMealDelete: (id: string) => Promise<void>
}) {
  const { t, lang } = useT()
  const locale = lang === 'ru' ? 'ru-RU' : 'en-US'
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const isToday = selectedDate.toDateString() === new Date().toDateString()
  const dateLabel = isToday
    ? t('history_today')
    : selectedDate.toLocaleDateString(locale, { day: 'numeric', month: 'long' })

  const dayMeals = meals.filter(
    (meal) => new Date(meal.createdAt).toDateString() === selectedDate.toDateString()
  )
  const dayCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0)

  if (meals.length === 0) {
    return (
      <div className="history-screen history-screen--empty">
        <EmptyState emoji="📸" title={t('history_emptyTitle')} subtitle={t('history_emptySubtitle')} />
      </div>
    )
  }

  const confidenceColor = (c: number) =>
    c >= 80 ? 'var(--c-success)' : c >= 60 ? 'var(--c-warning)' : 'var(--c-danger)'

  return (
    <div className="history-screen">
      <div className="date-nav">
        <IconButton
          label="←"
          size="sm"
          variant="soft"
          onClick={() => setSelectedDate((d) => new Date(d.getTime() - 86400000))}
        >
          <ChevronLeft size={18} />
        </IconButton>
        <span className="date-nav__label">{dateLabel}</span>
        <IconButton
          label="→"
          size="sm"
          variant="soft"
          disabled={isToday}
          onClick={() => setSelectedDate((d) => new Date(d.getTime() + 86400000))}
        >
          <ChevronRight size={18} />
        </IconButton>
      </div>

      <div className="day-summary">
        <span>{dayCalories} {t('kcal')}</span>
        <span>{t('history_meals', { count: dayMeals.length })}</span>
      </div>

      <div className="meals-list">
        {dayMeals.length === 0 ? (
          <p className="empty-day">{t('history_noMealsDay')}</p>
        ) : (
          dayMeals.map((meal) => {
            const time = new Date(meal.createdAt).toLocaleTimeString(locale, {
              hour: '2-digit',
              minute: '2-digit',
            })
            return (
              <Card key={meal.id} interactive padding="sm" className="meal-item" onClick={() => setSelectedMeal(meal)}>
                <div className="meal-item__media">
                  <div className="meal-thumb">
                    {meal.imageUrl ? (
                      <img
                        src={meal.imageUrl}
                        alt={meal.dishName}
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    ) : (
                      <span className="meal-thumb__emoji">🍽️</span>
                    )}
                  </div>
                  <Badge tone="mint">{meal.calories}</Badge>
                </div>

                <div className="meal-item__body">
                  <div className="meal-item__head">
                    <h4>{meal.dishName}</h4>
                    <span className="meal-item__time">{time}</span>
                  </div>
                  <p className="meal-item__macros">
                    {t('protein')[0]} {meal.protein} · {t('fat')[0]} {meal.fat} · {t('carbs')[0]} {meal.carbs} {t('unit_g')}
                  </p>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{ width: `${meal.confidence}%`, background: confidenceColor(meal.confidence) }}
                    />
                  </div>
                </div>

                <IconButton
                  className="meal-item__delete"
                  variant="ghost"
                  size="sm"
                  label={t('delete')}
                  onClick={(e) => {
                    e.stopPropagation()
                    setConfirmingId(meal.id)
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Card>
            )
          })
        )}
      </div>

      {selectedMeal &&
        (() => {
          const { id, userId, createdAt, ...mealResult } = selectedMeal
          return (
            <ResultCard
              result={mealResult}
              imageUrl={selectedMeal.imageUrl || ''}
              onClose={() => setSelectedMeal(null)}
            />
          )
        })()}

      <Modal open={!!confirmingId} onClose={() => setConfirmingId(null)} variant="center">
        <div className="confirm-dialog">
          <h3>{t('history_deleteConfirm')}</h3>
          <div className="confirm-actions">
            <Button variant="secondary" fullWidth onClick={() => setConfirmingId(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={async () => {
                if (confirmingId) await onMealDelete(confirmingId)
                setConfirmingId(null)
              }}
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

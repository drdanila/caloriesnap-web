import { useEffect, useState } from 'react'
import {
  ActivityLevel,
  Gender,
  UserProfile,
  calculateTargets,
  saveUserProfile,
} from '../services/profileService'
import { Toast } from '../components/Toast'
import './ProfileScreen.css'

interface ProfileScreenProps {
  userId: string
  initialProfile: UserProfile | null
  onSaved: (profile: UserProfile) => void
  onBack: () => void
}

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Сидячий образ жизни' },
  { value: 'light', label: 'Лёгкая активность' },
  { value: 'moderate', label: 'Умеренная активность' },
  { value: 'active', label: 'Высокая активность' },
  { value: 'very_active', label: 'Очень высокая активность' },
]

export default function ProfileScreen({ userId, initialProfile, onSaved, onBack }: ProfileScreenProps) {
  const [heightCm, setHeightCm] = useState(initialProfile ? String(initialProfile.heightCm) : '')
  const [weightKg, setWeightKg] = useState(initialProfile ? String(initialProfile.weightKg) : '')
  const [targetWeightKg, setTargetWeightKg] = useState(
    initialProfile ? String(initialProfile.targetWeightKg) : ''
  )
  const [age, setAge] = useState(initialProfile ? String(initialProfile.age) : '')
  const [gender, setGender] = useState<Gender>(initialProfile?.gender || 'male')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initialProfile?.activityLevel || 'moderate'
  )
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null)

  // Профиль грузится асинхронно в родителе: если экран открыли раньше загрузки,
  // initialProfile приходит позже — досинхронизируем поля формы.
  useEffect(() => {
    if (!initialProfile) return
    setHeightCm(String(initialProfile.heightCm))
    setWeightKg(String(initialProfile.weightKg))
    setTargetWeightKg(String(initialProfile.targetWeightKg))
    setAge(String(initialProfile.age))
    setGender(initialProfile.gender)
    setActivityLevel(initialProfile.activityLevel)
  }, [initialProfile])

  const h = parseFloat(heightCm)
  const w = parseFloat(weightKg)
  const tw = parseFloat(targetWeightKg)
  const a = parseFloat(age)

  const isValid =
    Number.isFinite(h) && h >= 50 && h <= 250 &&
    Number.isFinite(w) && w >= 20 && w <= 400 &&
    Number.isFinite(tw) && tw >= 20 && tw <= 400 &&
    Number.isFinite(a) && a >= 10 && a <= 120

  const candidate: UserProfile = {
    userId,
    heightCm: h,
    weightKg: w,
    targetWeightKg: tw,
    age: a,
    gender,
    activityLevel,
    updatedAt: new Date(),
  }

  const targets = isValid ? calculateTargets(candidate) : null

  const handleSave = async () => {
    if (!isValid) {
      setToast({ type: 'error', message: 'Заполните все поля корректными значениями' })
      return
    }
    setSaving(true)
    try {
      await saveUserProfile(candidate)
      setToast({ type: 'success', message: 'Профиль сохранён' })
      onSaved(candidate)
      onBack()
    } catch (error) {
      console.error('Failed to save profile:', error)
      setToast({ type: 'error', message: 'Не удалось сохранить профиль' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-screen">
      <div className="profile-form">
        <h2>Профиль</h2>

        <div className="form-row">
          <label htmlFor="height">Рост (см)</label>
          <input
            id="height"
            type="number"
            inputMode="numeric"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="180"
          />
        </div>

        <div className="form-row">
          <label htmlFor="weight">Вес (кг)</label>
          <input
            id="weight"
            type="number"
            inputMode="decimal"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="85"
          />
        </div>

        <div className="form-row">
          <label htmlFor="target">Целевой вес (кг)</label>
          <input
            id="target"
            type="number"
            inputMode="decimal"
            value={targetWeightKg}
            onChange={(e) => setTargetWeightKg(e.target.value)}
            placeholder="80"
          />
        </div>

        <div className="form-row">
          <label htmlFor="age">Возраст</label>
          <input
            id="age"
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="30"
          />
        </div>

        <div className="form-row">
          <label>Пол</label>
          <div className="gender-toggle">
            <button
              type="button"
              className={gender === 'male' ? 'active' : ''}
              onClick={() => setGender('male')}
            >
              Мужской
            </button>
            <button
              type="button"
              className={gender === 'female' ? 'active' : ''}
              onClick={() => setGender('female')}
            >
              Женский
            </button>
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="activity">Уровень активности</label>
          <select
            id="activity"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
          >
            {ACTIVITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="targets-preview">
        <h3>Дневная норма</h3>
        {targets ? (
          <div className="targets-grid">
            <div className="target-item">
              <span className="target-value">{targets.calories}</span>
              <span className="target-label">ккал</span>
            </div>
            <div className="target-item">
              <span className="target-value">{targets.protein}</span>
              <span className="target-label">белки, г</span>
            </div>
            <div className="target-item">
              <span className="target-value">{targets.fat}</span>
              <span className="target-label">жиры, г</span>
            </div>
            <div className="target-item">
              <span className="target-value">{targets.carbs}</span>
              <span className="target-label">углеводы, г</span>
            </div>
          </div>
        ) : (
          <p className="targets-placeholder">Заполните все поля</p>
        )}
      </div>

      <button className="profile-save-btn" onClick={handleSave} disabled={saving || !isValid}>
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

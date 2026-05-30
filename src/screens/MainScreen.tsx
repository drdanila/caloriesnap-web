import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { User } from 'firebase/auth'
import { signOut } from '../services/authService'
import { analyzeMealImage, fetchUserMeals, Meal, saveMeal, deleteMeal } from '../services/mealService'
import {
  getUserProfile,
  calculateTargets,
  UserProfile,
  NutritionTargets,
} from '../services/profileService'
import { ResultCard } from '../components/ResultCard'
import { Toast } from '../components/Toast'
import './MainScreen.css'

const HistoryScreen = lazy(() => import('./HistoryScreen'))
const ProfileScreen = lazy(() => import('./ProfileScreen'))

const DEFAULT_TARGETS: NutritionTargets = { calories: 1800, protein: 90, fat: 50, carbs: 225 }

export default function MainScreen({ user }: { user: User }) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home')
  const [result, setResult] = useState<Omit<Meal, 'id' | 'userId' | 'createdAt'> | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [toast, setToast] = useState<{message: string; type: 'error'|'success'} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadMeals()
    loadProfile()
  }, [])

  const loadMeals = async () => {
    if (!user.uid) return
    try {
      const userMeals = await fetchUserMeals(user.uid)
      setMeals(userMeals)
    } catch (error) {
      console.error('Failed to load meals:', error)
    }
  }

  const loadProfile = async () => {
    if (!user.uid) return
    try {
      setProfile(await getUserProfile(user.uid))
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const handleImageSelect = async (file: File) => {
    if (!user.uid || !file) return

    setCurrentFile(file)
    const previewDataUrl = URL.createObjectURL(file)
    setPreviewUrl(previewDataUrl)
    setAnalyzing(true)

    try {
      const analysisResult = await analyzeMealImage(file, user.uid)
      setResult(analysisResult)
      setAnalyzing(false)

      try {
        await saveMeal({ ...analysisResult, userId: user.uid })
      } catch (saveError) {
        console.warn('Failed to save meal:', saveError)
      }
      await loadMeals()
    } catch (error: any) {
      console.error('Analysis error:', error)
      const errorMessage = error?.message || 'Не удалось анализировать блюдо. Попробуйте снова.'
      setToast({ type: 'error', message: errorMessage })
      setResult(null)
      setPreviewUrl(null)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageSelect(file)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const todayMeals = meals.filter(meal => {
    const today = new Date().toDateString()
    return new Date(meal.createdAt).toDateString() === today
  })

  const totals = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      fat: acc.fat + (meal.fat || 0),
      carbs: acc.carbs + (meal.carbs || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  )

  const targets = profile ? calculateTargets(profile) : DEFAULT_TARGETS

  const metrics = [
    { key: 'protein', label: 'Белки', unit: 'г', value: totals.protein, goal: targets.protein },
    { key: 'fat', label: 'Жиры', unit: 'г', value: totals.fat, goal: targets.fat },
    { key: 'carbs', label: 'Углеводы', unit: 'г', value: totals.carbs, goal: targets.carbs },
  ]

  return (
    <div className="main-container">
      <header className="header">
        <div className="header-left">
          <img id="logo" src="/favicon.svg" alt="logo" className="logo" />
          <h1>CalorieSnap</h1>
        </div>
        <div className="header-actions">
          <span className="user-name">Hi, {user.displayName?.split(' ')[0]}</span>
          <button
            onClick={() => setActiveTab('profile')}
            className="profile-icon-btn"
            aria-label="Профиль"
            title="Профиль"
          >
            👤
          </button>
          <button onClick={handleSignOut} className="signout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {activeTab === 'home' ? (
        <div className="home-screen">
          {!profile && (
            <div className="profile-prompt">
              <span>Заполните профиль для персональных целей</span>
              <button onClick={() => setActiveTab('profile')}>Заполнить</button>
            </div>
          )}

          <div className={`calories-card${totals.calories > targets.calories ? ' exceeded' : ''}`}>
            <h2>Калории за сегодня</h2>
            <div className="calories-display">
              <span className="calories-number">{Math.round(totals.calories)}</span>
              <span className="calories-goal">/ {targets.calories} ккал</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${targets.calories > 0 ? Math.min((totals.calories / targets.calories) * 100, 100) : 0}%`,
                }}
              ></div>
            </div>
            <p className="meal-count">{todayMeals.length} блюд за сегодня</p>
          </div>

          <div className="macro-targets">
            {metrics.map((m) => {
              const exceeded = m.value > m.goal
              const pct = m.goal > 0 ? Math.min(m.value / m.goal, 1) : 0
              const radius = 26
              const circumference = 2 * Math.PI * radius
              return (
                <div key={m.key} className={`macro-ring${exceeded ? ' exceeded' : ''}`}>
                  <div className="ring-wrap">
                    <svg width="64" height="64" viewBox="0 0 64 64">
                      <circle className="ring-track" cx="32" cy="32" r={radius} />
                      <circle
                        className="ring-fill"
                        cx="32"
                        cy="32"
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - pct)}
                        transform="rotate(-90 32 32)"
                      />
                    </svg>
                    <span className="ring-value">{Math.round(m.value)}</span>
                  </div>
                  <span className="macro-ring-label">{m.label}</span>
                  <span className="macro-ring-goal">
                    / {m.goal} {m.unit}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="action-buttons">
            <button
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.capture = 'environment'
                input.onchange = (e: any) => handleFileChange(e)
                input.click()
              }}
              disabled={analyzing}
              className="action-btn primary"
            >
              📷 Take Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={analyzing}
              className="action-btn"
            >
              🖼️ Choose File
            </button>
          </div>

          {analyzing && (
            <div className="analyzing-overlay">
              <div className="loader-spinner"></div>
              <p>Analyzing your meal...</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : activeTab === 'history' ? (
        <Suspense fallback={<div className="loading-fallback">Loading history...</div>}>
          <HistoryScreen
            meals={meals}
            onMealDelete={async (id) => {
              await deleteMeal(id)
              await loadMeals()
            }}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<div className="loading-fallback">Загрузка...</div>}>
          <ProfileScreen
            userId={user.uid}
            initialProfile={profile}
            onSaved={(p) => setProfile(p)}
            onBack={() => setActiveTab('home')}
          />
        </Suspense>
      )}

      {result && previewUrl && (
        <ResultCard
          result={result}
          imageUrl={previewUrl}
          onClose={() => {
            setResult(null)
            setPreviewUrl(null)
            setCurrentFile(null)
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Главная</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-label">История</span>
        </button>
      </nav>
    </div>
  )
}

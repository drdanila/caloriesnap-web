import { useEffect, useRef, useState } from 'react'
import { User } from 'firebase/auth'
import { signOut } from '../services/authService'
import { analyzeMealImage, fetchUserMeals, Meal, saveMeal } from '../services/mealService'
import HistoryScreen from './HistoryScreen'
import { ResultCard } from '../components/ResultCard'
import { Toast } from '../components/Toast'
import './MainScreen.css'

export default function MainScreen({ user }: { user: User }) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'home' | 'history'>('home')
  const [result, setResult] = useState<Omit<Meal, 'id' | 'userId' | 'createdAt'> | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [toast, setToast] = useState<{message: string; type: 'error'|'success'} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadMeals()
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
        await saveMeal({ ...analysisResult, userId: user.uid }, file)
        await loadMeals()
      } catch (saveError) {
        console.warn('Failed to save meal:', saveError)
      }
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

  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0)

  return (
    <div className="main-container">
      <header className="header">
        <h1>CalorieSnap</h1>
        <div className="header-actions">
          <span className="user-name">Hi, {user.displayName?.split(' ')[0]}</span>
          <button onClick={handleSignOut} className="signout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {activeTab === 'home' ? (
        <div className="home-screen">
          <div className="calories-card">
            <h2>Today's Calories</h2>
            <div className="calories-display">
              <span className="calories-number">{totalCalories}</span>
              <span className="calories-goal">/ 2000 kcal</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min((totalCalories / 2000) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="meal-count">{todayMeals.length} meals logged today</p>
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
      ) : (
        <HistoryScreen meals={meals} />
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
          🏠 Home
        </button>
        <button
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 History
        </button>
      </nav>
    </div>
  )
}

import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { User } from 'firebase/auth'
import { Camera, CalendarDays, Home, Image as ImageIcon, LogOut, User as UserIcon } from 'lucide-react'
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
import { Button, IconButton, Card, ProgressBar, ProgressRing, BottomNav, LoadingOverlay, LanguageToggle } from '../ui'
import { useT } from '../i18n/I18nProvider'
import './MainScreen.css'

const HistoryScreen = lazy(() => import('./HistoryScreen'))
const ProfileScreen = lazy(() => import('./ProfileScreen'))

const DEFAULT_TARGETS: NutritionTargets = { calories: 1800, protein: 90, fat: 50, carbs: 225 }

type Tab = 'home' | 'history' | 'profile'

export default function MainScreen({ user }: { user: User }) {
  const { t, lang } = useT()
  const [meals, setMeals] = useState<Meal[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [result, setResult] = useState<Omit<Meal, 'id' | 'userId' | 'createdAt'> | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [, setCurrentFile] = useState<File | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadMeals()
    loadProfile()
  }, [])

  const loadMeals = async () => {
    if (!user.uid) return
    try {
      setMeals(await fetchUserMeals(user.uid))
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
    setPreviewUrl(URL.createObjectURL(file))
    setAnalyzing(true)

    try {
      const analysisResult = await analyzeMealImage(file, user.uid, lang)
      setResult(analysisResult)
      try {
        await saveMeal({ ...analysisResult, userId: user.uid })
      } catch (saveError) {
        console.warn('Failed to save meal:', saveError)
      }
      await loadMeals()
    } catch (error: any) {
      console.error('Analysis error:', error)
      setToast({ type: 'error', message: error?.message || t('analyzeError') })
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

  const todayMeals = meals.filter(
    (meal) => new Date(meal.createdAt).toDateString() === new Date().toDateString()
  )

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
  const caloriesExceeded = totals.calories > targets.calories

  const metrics = [
    { key: 'protein', label: t('protein'), value: totals.protein, goal: targets.protein },
    { key: 'fat', label: t('fat'), value: totals.fat, goal: targets.fat },
    { key: 'carbs', label: t('carbs'), value: totals.carbs, goal: targets.carbs },
  ]

  return (
    <div className="main-container">
      <header className="app-header">
        <div className="app-header__brand">
          <img src="/favicon.svg" alt="" className="app-header__logo" />
          <h1>{t('brand')}</h1>
        </div>
        <div className="app-header__actions">
          <span className="app-header__greeting">
            {t('greeting', { name: user.displayName?.split(' ')[0] || '' })}
          </span>
          <LanguageToggle />
          <IconButton variant="onAccent" size="sm" label={t('signOut')} onClick={handleSignOut}>
            <LogOut size={16} />
          </IconButton>
        </div>
      </header>

      {activeTab === 'home' ? (
        <div className="home-screen">
          {!profile && (
            <div className="profile-prompt">
              <span>{t('fillProfilePrompt')}</span>
              <Button size="sm" onClick={() => setActiveTab('profile')}>
                {t('fillProfileCta')}
              </Button>
            </div>
          )}

          <Card className={`cal-card${caloriesExceeded ? ' is-exceeded' : ''}`}>
            <h2 className="cal-card__title">{t('caloriesToday')}</h2>
            <div className="cal-card__display">
              <span className="cal-card__number">{Math.round(totals.calories)}</span>
              <span className="cal-card__goal">{t('caloriesGoal', { goal: targets.calories })}</span>
            </div>
            <ProgressBar
              value={targets.calories > 0 ? totals.calories / targets.calories : 0}
              exceeded={caloriesExceeded}
            />
            <p className="cal-card__meals">{t('mealsToday', { count: todayMeals.length })}</p>
          </Card>

          <Card className="macro-card">
            {metrics.map((m) => {
              const exceeded = m.value > m.goal
              return (
                <div key={m.key} className="macro-item">
                  <ProgressRing
                    value={m.goal > 0 ? m.value / m.goal : 0}
                    center={Math.round(m.value)}
                    exceeded={exceeded}
                  />
                  <span className="macro-item__label">{m.label}</span>
                  <span className="macro-item__goal">/ {m.goal} {t('unit_g')}</span>
                </div>
              )
            })}
          </Card>

          <div className="action-buttons">
            <Button
              size="lg"
              leftIcon={<Camera size={20} />}
              disabled={analyzing}
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.capture = 'environment'
                input.onchange = (e: any) => handleFileChange(e)
                input.click()
              }}
            >
              {t('takePhoto')}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              leftIcon={<ImageIcon size={20} />}
              disabled={analyzing}
              onClick={() => fileInputRef.current?.click()}
            >
              {t('choosePhoto')}
            </Button>
          </div>

          {analyzing && <LoadingOverlay message={t('analyzing')} />}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : activeTab === 'history' ? (
        <Suspense fallback={<div className="loading-fallback">{t('loading')}</div>}>
          <HistoryScreen
            meals={meals}
            onMealDelete={async (id) => {
              await deleteMeal(id)
              await loadMeals()
            }}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<div className="loading-fallback">{t('loading')}</div>}>
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <BottomNav<Tab>
        items={[
          { key: 'home', label: t('nav_home'), icon: <Home size={22} /> },
          { key: 'history', label: t('nav_history'), icon: <CalendarDays size={22} /> },
          { key: 'profile', label: t('nav_profile'), icon: <UserIcon size={22} /> },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />
    </div>
  )
}

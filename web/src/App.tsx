import { useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange, completeRedirectSignIn } from './services/authService'
import LoginScreen from './screens/LoginScreen'
import MainScreen from './screens/MainScreen'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // redirectPending: пока getRedirectResult не завершился, не скрываем спиннер
    // при null-ответе onAuthStateChanged — иначе на мобильном мелькает LoginScreen.
    let redirectPending = true
    let lastUser: User | null = null

    const unsubscribe = onAuthChange((authUser) => {
      lastUser = authUser
      if (authUser) {
        // Вошёл — показываем сразу (popup на десктопе или успешный редирект)
        setUser(authUser)
        setLoading(false)
      } else if (!redirectPending) {
        // Не вошёл и редирект уже обработан — показываем LoginScreen
        setUser(null)
        setLoading(false)
      }
      // Иначе: null + редирект ещё в процессе — держим спиннер
    })

    completeRedirectSignIn().finally(() => {
      redirectPending = false
      if (!lastUser) {
        // Редирект завершился, пользователя нет — показываем LoginScreen
        setUser(null)
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return user ? <MainScreen user={user} /> : <LoginScreen />
}

export default App

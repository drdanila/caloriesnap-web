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
    // Завершаем вход через редирект (мобильные/iOS), затем слушаем авторизацию.
    completeRedirectSignIn()
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser)
      setLoading(false)
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

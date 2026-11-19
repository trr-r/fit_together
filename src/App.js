import "./App.css"
import { useState, useEffect } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import WorkoutDetails from "./pages/WorkoutDetails"
import CalendarPage from "./pages/CalendarPage"
import Navigation from "./components/Navigation"
import Register from "./pages/Register"
import TrainerHome from "./pages/TrainerHome"
import ComingSoon from "./components/ComingSoon"

import { supabase } from "./supabaseClient"

import Profile from "./pages/Profile"

function loadUserData(userId, dataName) {
  const userKey = `${dataName}_${userId}`
  const savedUserData = localStorage.getItem(userKey)

  if (savedUserData !== null) {
    return JSON.parse(savedUserData)
  }

  return []
}

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light"
  })

  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const authUser = session.user
        const metadata = authUser.user_metadata || {}

        const appUser = {
          id: authUser.id,
          name: metadata.name || authUser.email,
          role: metadata.role || "client",
          email: authUser.email,
        }

        setUser(appUser)
      } else {
        setUser(null)
      }

      setAuthLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    if (authLoading) return

    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [user, authLoading])

  async function logout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert("Не удалось выйти: " + error.message)
    }
  }

  return (
    <HashRouter>
      {authLoading ? (
        <div className="register-page">
          <h2>FitTogether 💜</h2>
          <p>Проверяем авторизацию...</p>
        </div>
      ) : !user ? (
        <Routes>
          <Route path="*" element={<Register />} />
        </Routes>
      ) : (
        <UserApp
          key={user.id}
          user={user}
          theme={theme}
          setTheme={setTheme}
          onLogout={logout}
        />
      )}
    </HashRouter>
  )
}

function UserApp({ user, theme, setTheme, onLogout }) {
  const [workouts, setWorkouts] = useState(() =>
    loadUserData(user.id, "workouts")
  )

  const [exercises] = useState(() =>
    loadUserData(user.id, "exercises")
  )

  const [history, setHistory] = useState(() => loadUserData(user.id, "history"))

  const [plannedWorkouts, setPlannedWorkouts] = useState(() =>
    loadUserData(user.id, "plannedWorkouts")
  )

  const [trainingBlocks, setTrainingBlocks] = useState(() =>
    loadUserData(user.id, "trainingBlocks")
  )

  const [planHistory, setPlanHistory] = useState(() =>
    loadUserData(user.id, "planHistory")
  )

  useEffect(() => {
    localStorage.setItem(`workouts_${user.id}`, JSON.stringify(workouts))
  }, [workouts, user.id])

  useEffect(() => {
    localStorage.setItem(`exercises_${user.id}`, JSON.stringify(exercises))
  }, [exercises, user.id])

  useEffect(() => {
    localStorage.setItem(`history_${user.id}`, JSON.stringify(history))
  }, [history, user.id])

  useEffect(() => {
    localStorage.setItem(
      `plannedWorkouts_${user.id}`,
      JSON.stringify(plannedWorkouts)
    )
  }, [plannedWorkouts, user.id])

  useEffect(() => {
    localStorage.setItem(
      `trainingBlocks_${user.id}`,
      JSON.stringify(trainingBlocks)
    )
  }, [trainingBlocks, user.id])

  useEffect(() => {
    localStorage.setItem(`planHistory_${user.id}`, JSON.stringify(planHistory))
  }, [planHistory, user.id])

  return (
    <div className="app" data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            user.role === "trainer" ? (
              <TrainerHome user={user} />
            ) : (
              <Home
  user={user}
  trainingBlocks={trainingBlocks}
  plannedWorkouts={plannedWorkouts}
  history={history}
  exercises={exercises}
/>
            )
          }
        />

        <Route
          path="/workouts"
          element={<ComingSoon title="Тренировки" emoji="🏋️" />}
        />

        <Route
          path="/workouts/:id"
          element={
            <WorkoutDetails
              workouts={workouts}
              setWorkouts={setWorkouts}
              history={history}
              setHistory={setHistory}
            />
          }
        />

        <Route
          path="/calendar"
          element={
            <CalendarPage
              history={history}
              setHistory={setHistory}
              plannedWorkouts={plannedWorkouts}
              setPlannedWorkouts={setPlannedWorkouts}
              exercises={exercises}
              planHistory={planHistory}
              setPlanHistory={setPlanHistory}
              trainingBlocks={trainingBlocks}
              setTrainingBlocks={setTrainingBlocks}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <Profile
              user={user}
              theme={theme}
              setTheme={setTheme}
              onLogout={onLogout}
            />
          }
        />

        <Route
          path="/exercises"
          element={<ComingSoon title="Упражнения" emoji="💪" />}
        />
      </Routes>

      <Navigation role={user.role} />
    </div>
  )
}

export default App

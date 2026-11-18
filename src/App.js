import "./App.css"
import { useState, useEffect } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Workouts from "./pages/Workouts"
import WorkoutDetails from "./pages/WorkoutDetails"
import CalendarPage from "./pages/CalendarPage"
import Profile from "./pages/Profile"
import Exercises from "./pages/Exercises"

import Navigation from "./components/Navigation"

function App() {
  const [workouts, setWorkouts] = useState(() => {
    return JSON.parse(localStorage.getItem("workouts")) || []
  })

  const [exercises, setExercises] = useState(() => {
    return JSON.parse(localStorage.getItem("exercises")) || []
  })

  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("history")) || []
  })

  const [plannedWorkouts, setPlannedWorkouts] = useState(() => {
    return JSON.parse(localStorage.getItem("plannedWorkouts")) || []
  })

  const [trainingBlocks, setTrainingBlocks] = useState(() => {
    return JSON.parse(localStorage.getItem("trainingBlocks")) || []
  })

  const [planHistory, setPlanHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("planHistory")) || []
  })

  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts))
  }, [workouts])

  useEffect(() => {
    localStorage.setItem("exercises", JSON.stringify(exercises))
  }, [exercises])

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem("plannedWorkouts", JSON.stringify(plannedWorkouts))
  }, [plannedWorkouts])

  useEffect(() => {
    localStorage.setItem("trainingBlocks", JSON.stringify(trainingBlocks))
  }, [trainingBlocks])

  useEffect(() => {
    localStorage.setItem("planHistory", JSON.stringify(planHistory))
  }, [planHistory])

  return (
    <HashRouter>
     <div className="app">
  <Routes>
    <Route
      path="/"
      element={
        <Home
          trainingBlocks={trainingBlocks}
          plannedWorkouts={plannedWorkouts}
          history={history}
          exercises={exercises}
        />
      }
    />

          <Route
            path="/workouts"
            element={
              <Workouts
                workouts={workouts}
                setWorkouts={setWorkouts}
                exercises={exercises}
              />
            }
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

          <Route path="/profile" element={<Profile />} />

          <Route
            path="/exercises"
            element={
              <Exercises exercises={exercises} setExercises={setExercises} />
            }
          />
        </Routes>

        <Navigation />
      </div>
    </HashRouter>
  )
}

export default App

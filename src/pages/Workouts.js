
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Workouts({ workouts, setWorkouts, exercises }) {
  const navigate = useNavigate()

  const [showForm, setShowForm] = useState(false)
  const [workoutName, setWorkoutName] = useState("")
  const [selectedExercises, setSelectedExercises] = useState([])

  function toggleExercise(id) {
    if (selectedExercises.includes(id)) {
      setSelectedExercises(selectedExercises.filter((item) => item !== id))
    } else {
      setSelectedExercises([...selectedExercises, id])
    }
  }

  function addWorkout() {
    if (workoutName.trim() === "" || selectedExercises.length === 0) return

    const newWorkout = {
      id: Date.now(),
      name: workoutName.trim(),
      exercises: exercises
        .filter((exercise) => selectedExercises.includes(exercise.id))
        .map((exercise, index) => ({
          id: Date.now() + index,
          libraryId: exercise.id,
          name: exercise.name,
          category: exercise.category,
          sets: [],
          reps: "",
          weight: "",
        })),
    }

    setWorkouts([newWorkout, ...workouts])
    setWorkoutName("")
    setSelectedExercises([])
    setShowForm(false)
  }

  function deleteWorkout(id) {
    setWorkouts(workouts.filter((workout) => workout.id !== id))
  }

  return (
    <main className="content">
      <h2>Мои программы</h2>
      <p>Готовые тренировки из библиотеки упражнений</p>

      <button className="add-button" onClick={() => setShowForm(!showForm)}>
        + Создать программу
      </button>

      {showForm && (
        <div className="card">
          <h3>Новая программа</h3>

          <input
            type="text"
            placeholder="Название программы"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />

          <h3>Выбери упражнения</h3>

          {exercises.length === 0 ? (
            <p>Сначала добавь упражнения в библиотеку.</p>
          ) : (
            exercises.map((exercise) => (
              <label
                key={exercise.id}
                style={{ display: "block", marginBottom: "12px" }}
              >
                <input
                  type="checkbox"
                  checked={selectedExercises.includes(exercise.id)}
                  onChange={() => toggleExercise(exercise.id)}
                />
                {" "}{exercise.name} ({exercise.category})
              </label>
            ))
          )}

          <button
            className="add-button"
            onClick={addWorkout}
            disabled={exercises.length === 0}
          >
            Сохранить программу
          </button>
        </div>
      )}

      <div className="cards">
        {workouts.map((workout) => (
          <div
            className="card"
            key={workout.id}
            onClick={() => navigate(`/workouts/${workout.id}`)}
          >
            <h3>{workout.name}</h3>
            <p>Упражнений: {workout.exercises.length}</p>

            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation()
                deleteWorkout(workout.id)
              }}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Workouts

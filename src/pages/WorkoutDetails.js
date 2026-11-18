
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

function WorkoutDetails({ workouts, history, setHistory }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [activeSession, setActiveSession] = useState(null)

  const workout = workouts.find((item) => item.id === Number(id))

  if (!workout) {
    return (
      <main className="content">
        <h2>Программа не найдена</h2>
        <button className="add-button" onClick={() => navigate("/workouts")}>
          Вернуться к программам
        </button>
      </main>
    )
  }

  function startWorkout() {
    setActiveSession({
      name: workout.name,
      exercises: workout.exercises.map((exercise) => ({
        ...exercise,
        sets: [],
        reps: "",
        weight: "",
      })),
    })
  }

  function updateExercise(exerciseId, field, value) {
    setActiveSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, [field]: value }
          : exercise
      ),
    }))
  }

  function addSet(exerciseId) {
    const exercise = activeSession.exercises.find(
      (item) => item.id === exerciseId
    )

    if (exercise.reps === "" || exercise.weight === "") return

    const newSet = {
      id: Date.now(),
      reps: Number(exercise.reps),
      weight: Number(exercise.weight),
    }

    setActiveSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((item) =>
        item.id === exerciseId
          ? {
              ...item,
              sets: [newSet, ...item.sets],
              reps: "",
              weight: "",
            }
          : item
      ),
    }))
  }

  function updateSet(exerciseId, setId, field, value) {
    setActiveSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId
                  ? { ...set, [field]: value }
                  : set
              ),
            }
          : exercise
      ),
    }))
  }
  
  function duplicateSet(exerciseId, set) {
    const newSet = {
      id: Date.now(),
      reps: set.reps,
      weight: set.weight,
    }
  
    setActiveSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [newSet, ...exercise.sets] }
          : exercise
      ),
    }))
  }
  
  function deleteSet(exerciseId, setId) {
    setActiveSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise
      ),
    }))
  }

  function finishWorkout() {
    const today = new Date()
    const date = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-")

    const finishedWorkout = {
      id: Date.now(),
      name: activeSession.name,
      date,
      exercises: activeSession.exercises,
    }

    setHistory([finishedWorkout, ...history])
    setActiveSession(null)
    navigate("/calendar")
  }

  return (
    <main className="content">
      <button className="delete-button" onClick={() => navigate("/workouts")}>
        ← Назад
      </button>

      <h2>{workout.name}</h2>

      {!activeSession ? (
        <>
          <p>Упражнений: {workout.exercises.length}</p>

          <div className="cards">
            {workout.exercises.map((exercise) => (
              <div className="card" key={exercise.id}>
                <h3>{exercise.name}</h3>
                <p>{exercise.category}</p>
              </div>
            ))}
          </div>

          <button
            className="add-button"
            onClick={startWorkout}
          >
            Начать тренировку
          </button>
        </>
      ) : (
        <>
          <h3>Тренировка началась!</h3>

          {activeSession.exercises.map((exercise) => (
            <div className="card" key={exercise.id}>
              <h3>{exercise.name}</h3>


              <div className="set-fields">
  <div className="set-field">
    <label>ПОВТОРЕНИЯ</label>
    <div className="set-adjust">
      <button
        onClick={() =>
          updateExercise(
            exercise.id,
            "reps",
            String(Math.max(0, Number(exercise.reps || 0) - 1))
          )
        }
      >
        −
      </button>

      <input
        type="number"
        min="0"
        placeholder="0"
        value={exercise.reps}
        onChange={(e) =>
          updateExercise(exercise.id, "reps", e.target.value)
        }
      />

      <button
        onClick={() =>
          updateExercise(
            exercise.id,
            "reps",
            String(Number(exercise.reps || 0) + 1)
          )
        }
      >
        +
      </button>
    </div>
  </div>

  <div className="set-field">
    <label>ВЕС, КГ</label>
    <div className="set-adjust">
      <button
        onClick={() =>
          updateExercise(
            exercise.id,
            "weight",
            String(Math.max(0, Number(exercise.weight || 0) - 2.5))
          )
        }
      >
        −
      </button>

      <input
        type="number"
        min="0"
        step="0.5"
        placeholder="0"
        value={exercise.weight}
        onChange={(e) =>
          updateExercise(exercise.id, "weight", e.target.value)
        }
      />

      <button
        onClick={() =>
          updateExercise(
            exercise.id,
            "weight",
            String(Number(exercise.weight || 0) + 2.5)
          )
        }
      >
        +
      </button>
    </div>
  </div>
</div>


              <button
                className="add-button"
                onClick={() => addSet(exercise.id)}
              >
                Добавить подход
              </button>

              
{(exercise.sets || []).map((set, index) => (
  <div key={set.id} className="set-card">
    <div className="set-header">
      <strong>Подход {index + 1}</strong>
      <button
        className="remove-set"
        onClick={() => deleteSet(exercise.id, set.id)}
      >
        ✕
      </button>
    </div>

    <div className="set-fields">
      <div className="set-field">
        <label>Повторения</label>
        <div className="set-adjust">
          <button
            onClick={() =>
              updateSet(
                exercise.id,
                set.id,
                "reps",
                String(Math.max(0, Number(set.reps || 0) - 1))
              )
            }
          >
            −
          </button>

          <input
            type="number"
            min="0"
            value={set.reps}
            onChange={(e) =>
              updateSet(exercise.id, set.id, "reps", e.target.value)
            }
          />

          <button
            onClick={() =>
              updateSet(
                exercise.id,
                set.id,
                "reps",
                String(Number(set.reps || 0) + 1)
              )
            }
          >
            +
          </button>
        </div>
      </div>

      <div className="set-field">
        <label>Вес (кг)</label>
        <div className="set-adjust">
          <button
            onClick={() =>
              updateSet(
                exercise.id,
                set.id,
                "weight",
                String(Math.max(0, Number(set.weight || 0) - 2.5))
              )
            }
          >
            −
          </button>

          <input
            type="number"
            min="0"
            step="0.5"
            value={set.weight}
            onChange={(e) =>
              updateSet(exercise.id, set.id, "weight", e.target.value)
            }
          />

          <button
            onClick={() =>
              updateSet(
                exercise.id,
                set.id,
                "weight",
                String(Number(set.weight || 0) + 2.5)
              )
            }
          >
            +
          </button>
        </div>
      </div>
    </div>

    <button
      className="duplicate-set"
      onClick={() => duplicateSet(exercise.id, set)}
    >
      ⧉ Дублировать подход
    </button>
  </div>
))}

            </div>
          ))}

          <button
            className="add-button"
            onClick={finishWorkout}
          >
            Завершить тренировку
          </button>
        </>
      )}
    </main>
  )
}

export default WorkoutDetails


import { useState } from "react"

function Exercises({ exercises, setExercises }) {
  const [showForm, setShowForm] = useState(false)
  const [exerciseName, setExerciseName] = useState("")
  const [category, setCategory] = useState("Другое")

  function addExercise() {
    if (exerciseName.trim() === "") return

    const newExercise = {
      id: Date.now(),
      name: exerciseName.trim(),
      category,
    }

    setExercises([newExercise, ...exercises])
    setExerciseName("")
    setCategory("Другое")
    setShowForm(false)
  }

  return (
    <main className="content">
      <h2>Мои упражнения</h2>
      <p>Библиотека упражнений для тренировок</p>

      <button
        className="add-button"
        onClick={() => setShowForm(!showForm)}
      >
        + Добавить упражнение
      </button>

      {showForm && (
        <div className="card">
          <h3>Новое упражнение</h3>

          <input
            type="text"
            placeholder="Название упражнения"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Ноги</option>
            <option>Ягодицы</option>
            <option>Спина</option>
            <option>Грудь</option>
            <option>Плечи</option>
            <option>Руки</option>
            <option>Пресс</option>
            <option>Другое</option>
          </select>

          <button className="add-button" onClick={addExercise}>
            Сохранить
          </button>
        </div>
      )}

      <div className="cards">
        {exercises.map((exercise) => (
          <div className="card" key={exercise.id}>
            <h3>{exercise.name}</h3>
            <p>{exercise.category}</p>

            <button
              className="delete-button"
              onClick={() =>
                setExercises(
                  exercises.filter((item) => item.id !== exercise.id)
                )
              }
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Exercises

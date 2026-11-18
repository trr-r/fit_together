import { useState } from "react"

function CalendarPage({
  history,
  setHistory,
  plannedWorkouts,
  setPlannedWorkouts,
  exercises,
  planHistory,
  setPlanHistory,
}) {
  const today = new Date()

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const [selectedDate, setSelectedDate] = useState(formatDateKey(today))

  const [editingId, setEditingId] = useState(null)
  const [editingPlanId, setEditingPlanId] = useState(null)

  const [showPlanForm, setShowPlanForm] = useState(false)
  const [notification, setNotification] = useState("")
  const [planName, setPlanName] = useState("")
  const [selectedExerciseIds, setSelectedExerciseIds] = useState([])

  function formatDateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  function formatDate(dateString) {
    const [year, month, day] = dateString.split("-")
    return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  function changeMonth(direction) {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + direction,
      1
    )

    setCurrentMonth(newMonth)
    setSelectedDate(formatDateKey(newMonth))
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7

  const days = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  const workoutDates = [
    ...history.map((workout) => workout.date),
    ...plannedWorkouts.map((workout) => workout.date),
  ]

  const selectedWorkouts = history.filter(
    (workout) => workout.date === selectedDate
  )

  const selectedPlannedWorkouts = plannedWorkouts.filter(
    (workout) => workout.date === selectedDate
  )

  function addPlannedWorkout() {
    if (!planName.trim()) return

    const selectedExercises = exercises
      .filter((exercise) => selectedExerciseIds.includes(exercise.id))
      .map((exercise) => ({
        id: exercise.id,
        libraryId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: [],
        plannedSets: 3,
        reps: 10,
        weight: 0,
      }))

    const newPlan = {
      id: Date.now(),
      name: planName.trim(),
      date: selectedDate,
      exercises: selectedExercises,
    }

    setPlannedWorkouts((prev) => [newPlan, ...prev])
    setPlanHistory((prev) => [
      {
        id: Date.now(),
        action: "Тренировка назначена",
        workoutName: newPlan.name,
        date: selectedDate,
        createdAt: new Date().toLocaleString("ru-RU"),
      },
      ...prev,
    ])

    setNotification("Тренировка назначена!")
    setTimeout(() => setNotification(""), 3000)

    setPlanName("")
    setSelectedExerciseIds([])
    setShowPlanForm(false)
  }

  function deletePlannedWorkout(workoutId) {
    const workout = plannedWorkouts.find((item) => item.id === workoutId)

    if (!workout) return

    setPlannedWorkouts((prev) => prev.filter((item) => item.id !== workoutId))

    setPlanHistory((prev) => [
      {
        id: Date.now(),
        action: "Тренировка удалена",
        workoutName: workout.name,
        date: workout.date,
        createdAt: new Date().toLocaleString("ru-RU"),
      },
      ...prev,
    ])

    setNotification("Тренировка удалена!")
    setTimeout(() => setNotification(""), 3000)
  }

  function updatePlannedExercise(workoutId, exerciseId, field, value) {
    setPlannedWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              exercises: workout.exercises.map((exercise) =>
                exercise.id === exerciseId
                  ? { ...exercise, [field]: value }
                  : exercise
              ),
            }
          : workout
      )
    )
  }

  function updateSet(workoutId, exerciseId, setId, field, value) {
    setHistory((prev) =>
      prev.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              exercises: workout.exercises.map((exercise) =>
                exercise.id === exerciseId
                  ? {
                      ...exercise,
                      sets: exercise.sets.map((set) =>
                        set.id === setId ? { ...set, [field]: value } : set
                      ),
                    }
                  : exercise
              ),
            }
          : workout
      )
    )
  }

  function addSet(workoutId, exerciseId) {
    const newSet = {
      id: Date.now(),
      reps: "",
      weight: "",
    }

    setHistory((prev) =>
      prev.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              exercises: workout.exercises.map((exercise) =>
                exercise.id === exerciseId
                  ? { ...exercise, sets: [newSet, ...exercise.sets] }
                  : exercise
              ),
            }
          : workout
      )
    )
  }

  function deleteSet(workoutId, exerciseId, setId) {
    setHistory((prev) =>
      prev.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              exercises: workout.exercises.map((exercise) =>
                exercise.id === exerciseId
                  ? {
                      ...exercise,
                      sets: exercise.sets.filter((set) => set.id !== setId),
                    }
                  : exercise
              ),
            }
          : workout
      )
    )
  }

  return (
    <main className="content">
      <h2>Календарь тренировок</h2>

      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)}>‹</button>

          <h3>
            {currentMonth.toLocaleDateString("ru-RU", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <button onClick={() => changeMonth(1)}>›</button>
        </div>

        <div className="calendar-grid">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
            <div className="calendar-weekday" key={day}>
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} />
            }

            const date = formatDateKey(new Date(year, month, day))
            const hasWorkout = workoutDates.includes(date)

            return (
              <button
                key={date}
                className={`calendar-day ${
                  selectedDate === date ? "selected" : ""
                } ${hasWorkout ? "has-workout" : ""}`}
                onClick={() => setSelectedDate(date)}
              >
                {day}
                {hasWorkout && <span className="calendar-dot" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="selected-day">
        <h3>{formatDate(selectedDate)}</h3>

        <button
          className="add-button"
          onClick={() => setShowPlanForm(!showPlanForm)}
        >
          + Запланировать тренировку
        </button>

        {showPlanForm && (
          <div className="card">
            <h3>Новая тренировка</h3>

            <p>Дата: {formatDate(selectedDate)}</p>

            <label>Название тренировки</label>
            <input
              type="text"
              placeholder="Например, Тренировка ног"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />

            <h4>Выбери упражнения</h4>

            {exercises.length === 0 ? (
              <p>Сначала добавь упражнения в библиотеку.</p>
            ) : (
              exercises.map((exercise) => (
                <label key={exercise.id}>
                  <input
                    type="checkbox"
                    checked={selectedExerciseIds.includes(exercise.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExerciseIds([
                          ...selectedExerciseIds,
                          exercise.id,
                        ])
                      } else {
                        setSelectedExerciseIds(
                          selectedExerciseIds.filter((id) => id !== exercise.id)
                        )
                      }
                    }}
                  />
                  {exercise.name}
                </label>
              ))
            )}

            <button
              className="add-button"
              onClick={addPlannedWorkout}
              disabled={!planName.trim()}
            >
              Сохранить тренировку
            </button>

            <button
              className="delete-button"
              onClick={() => setShowPlanForm(false)}
            >
              Отмена
            </button>
          </div>
        )}

        {selectedPlannedWorkouts.length > 0 && (
          <div>
            <h3>Запланировано</h3>

            {selectedPlannedWorkouts.map((workout) => (
              <div className="card" key={workout.id}>
                <h3>{workout.name}</h3>

                {workout.exercises.length === 0 ? (
                  <p>Упражнения пока не добавлены.</p>
                ) : (
                  workout.exercises.map((exercise) => (
                    <div key={exercise.id} className="planned-exercise">
                      <h4>{exercise.name}</h4>

                      {editingPlanId === workout.id ? (
                        <div className="planned-fields">
                          <label>
                            Подходы
                            <input
                              type="number"
                              min="1"
                              value={exercise.plannedSets ?? 3}
                              onChange={(e) =>
                                updatePlannedExercise(
                                  workout.id,
                                  exercise.id,
                                  "plannedSets",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </label>

                          <label>
                            Повторения
                            <input
                              type="number"
                              min="1"
                              value={exercise.reps ?? 10}
                              onChange={(e) =>
                                updatePlannedExercise(
                                  workout.id,
                                  exercise.id,
                                  "reps",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </label>

                          <label>
                            Вес, кг
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={exercise.weight ?? 0}
                              onChange={(e) =>
                                updatePlannedExercise(
                                  workout.id,
                                  exercise.id,
                                  "weight",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </label>
                        </div>
                      ) : (
                        <p>
                          {exercise.plannedSets ?? 3} × {exercise.reps ?? 10}{" "}
                          повторений · {exercise.weight ?? 0} кг
                        </p>
                      )}
                    </div>
                  ))
                )}
                <button
  className="add-button"
  onClick={() =>
    setEditingPlanId(
      editingPlanId === workout.id ? null : workout.id
    )
  }
>
  {editingPlanId === workout.id ? "Сохранить" : "Редактировать план"}
</button>

<button
  className="delete-button"
  onClick={() => deletePlannedWorkout(workout.id)}
>
  Удалить тренировку
</button>
              </div>
            ))}
          </div>
        )}

        {selectedWorkouts.length === 0 ? (
          <p>На этот день тренировок нет.</p>
        ) : (
          <div className="cards">
            {selectedWorkouts.map((workout) => (
              <div className="card" key={workout.id}>
                <h3>{workout.name}</h3>

                {workout.exercises.map((exercise) => (
                  <div key={exercise.id}>
                    <h4>{exercise.name}</h4>

                    {(exercise.sets || []).map((set, index) => (
                      <div key={set.id}>
                        {editingId === workout.id ? (
                          <>
                            <p>Подход {index + 1}</p>

                            <input
                              type="number"
                              placeholder="Повторения"
                              value={set.reps}
                              onChange={(e) =>
                                updateSet(
                                  workout.id,
                                  exercise.id,
                                  set.id,
                                  "reps",
                                  e.target.value
                                )
                              }
                            />

                            <input
                              type="number"
                              placeholder="Вес (кг)"
                              value={set.weight}
                              onChange={(e) =>
                                updateSet(
                                  workout.id,
                                  exercise.id,
                                  set.id,
                                  "weight",
                                  e.target.value
                                )
                              }
                            />

                            <button
                              className="delete-button"
                              onClick={() =>
                                deleteSet(workout.id, exercise.id, set.id)
                              }
                            >
                              Удалить подход
                            </button>
                          </>
                        ) : (
                          <p>
                            Подход {index + 1}: {set.reps} повторений ×{" "}
                            {set.weight} кг
                          </p>
                        )}
                      </div>
                    ))}

                    {editingId === workout.id && (
                      <button
                        className="add-button"
                        onClick={() => addSet(workout.id, exercise.id)}
                      >
                        + Добавить подход
                      </button>
                    )}
                  </div>
                ))}

                <button
                  className="add-button"
                  onClick={() =>
                    setEditingId(editingId === workout.id ? null : workout.id)
                  }
                >
                  {editingId === workout.id ? "Сохранить" : "Редактировать"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="plan-history">
        <h3>История изменений</h3>

        {planHistory.length === 0 ? (
          <p>Пока изменений нет.</p>
        ) : (
          planHistory.map((item) => (
            <div className="plan-history-item" key={item.id}>
              <div>
                <strong>{item.action}</strong>
                <p>{item.workoutName}</p>
                <small>Дата тренировки: {formatDate(item.date)}</small>
                <small>{item.createdAt}</small>
              </div>
            </div>
          ))
        )}
      </div>

      {notification && <div className="notification">{notification}</div>}
    </main>
  )
}

export default CalendarPage

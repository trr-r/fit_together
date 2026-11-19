import { useState, useEffect } from "react"

function CalendarPage({
  history,
  setHistory,
  plannedWorkouts,
  setPlannedWorkouts,
  exercises,
  planHistory,
  setPlanHistory,
  trainingBlocks,
  setTrainingBlocks,
}) {
  const today = new Date()

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const [selectedDate, setSelectedDate] = useState(formatDateKey(today))

  const [editingId, setEditingId] = useState(null)

  const [editingWorkoutId, setEditingWorkoutId] = useState(null)
  const [editWorkoutDate, setEditWorkoutDate] = useState("")
  const [editWorkoutTime, setEditWorkoutTime] = useState("")
  const [editWorkoutName, setEditWorkoutName] = useState("")

  const [showPlanForm, setShowPlanForm] = useState(false)
  const [showDayPopup, setShowDayPopup] = useState(false)
  const [notification, setNotification] = useState("")
  const [planName, setPlanName] = useState("")
  const [planTime, setPlanTime] = useState("18:00")
  const [selectedExerciseIds, setSelectedExerciseIds] = useState([])
  const [blockSize, setBlockSize] = useState(4)
  const [showBlockForm, setShowBlockForm] = useState(false)

  const [calendarDays, setCalendarDays] = useState({})
  const [, setCalendarError] = useState("")

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

  function getHistoryDayLabel(item) {
    if (!item.createdAt) {
      return "Дата события неизвестна"
    }

    const eventDate = new Date(item.createdAt)

    if (isNaN(eventDate.getTime())) {
      return "Дата события неизвестна"
    }

    const today = new Date()
    const yesterday = new Date()

    today.setHours(0, 0, 0, 0)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const eventDay = new Date(eventDate)
    eventDay.setHours(0, 0, 0, 0)

    if (eventDay.getTime() === today.getTime()) {
      return "Сегодня"
    }

    if (eventDay.getTime() === yesterday.getTime()) {
      return "Вчера"
    }

    return eventDate.toLocaleDateString("ru-RU", {
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

  useEffect(() => {
    async function loadCalendar() {
      try {
        setCalendarError("")

        const response = await fetch(
          `https://calendar.kuzyak.in/api/calendar/${year}/holidays`
        )

        if (!response.ok) {
          throw new Error("Не удалось загрузить календарь")
        }

        const data = await response.json()

        const getDate = (item) => {
          const value = typeof item === "string" ? item : item?.date
          return value ? String(value).slice(0, 10) : null
        }

        const holidays = {}

        ;(data.holidays || []).forEach((item) => {
          const date = getDate(item)

          if (date) {
            holidays[date] =
              typeof item === "object" && item.name
                ? item.name
                : "Праздничный день"
          }
        })

        const transferredDays = (data.transferredHolidays || [])
          .map(getDate)
          .filter(Boolean)

        const workingWeekends = (data.workingWeekends || [])
          .map(getDate)
          .filter(Boolean)

        setCalendarDays({
          holidays,
          transferredDays,
          workingWeekends,
        })
      } catch (error) {
        console.error(error)
        setCalendarError("Не удалось загрузить праздничный календарь")
      }
    }

    loadCalendar()
  }, [year])

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

  const hasPlannedWorkoutOnSelectedDate = plannedWorkouts.some(
    (workout) => workout.date === selectedDate
  )

  const activeBlock = trainingBlocks.find(
    (block) => block.usedCount < block.size
  )

  useEffect(() => {
    const updatedWorkouts = [...plannedWorkouts]
    let hasChanges = false

    trainingBlocks.forEach((block) => {
      const completedWorkouts = history.filter(
        (workout) => workout.blockId === block.id
      )

      const plannedBlockWorkouts = updatedWorkouts
        .filter((workout) => workout.blockId === block.id)
        .sort((a, b) => {
          const dateComparison = a.date.localeCompare(b.date)

          if (dateComparison !== 0) return dateComparison

          return (a.time || "").localeCompare(b.time || "")
        })

      const allBlockWorkouts = [
        ...completedWorkouts,
        ...plannedBlockWorkouts,
      ].sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date)

        if (dateComparison !== 0) return dateComparison

        return (a.time || "").localeCompare(b.time || "")
      })

      allBlockWorkouts.forEach((workout, index) => {
        const plannedWorkout = updatedWorkouts.find(
          (item) => item.id === workout.id
        )

        if (!plannedWorkout) return

        const correctNumber = index + 1

        if (plannedWorkout.workoutNumber !== correctNumber) {
          plannedWorkout.workoutNumber = correctNumber
          hasChanges = true
        }
      })

      const correctUsedCount = allBlockWorkouts.length

      if (block.usedCount !== correctUsedCount) {
        setTrainingBlocks((prev) =>
          prev.map((item) =>
            item.id === block.id
              ? { ...item, usedCount: correctUsedCount }
              : item
          )
        )
      }
    })

    if (hasChanges) {
      setPlannedWorkouts(updatedWorkouts)
    }
  }, [
    plannedWorkouts,
    history,
    trainingBlocks,
    setPlannedWorkouts,
    setTrainingBlocks,
  ])

  function addTrainingBlock() {
    const activeBlock = trainingBlocks.find(
      (block) => block.usedCount < block.size
    )

    if (activeBlock) {
      setNotification("Сначала нужно закончить текущий блок тренировок.")
      setShowBlockForm(false)
      return
    }

    const blockColors = [
      "#E9DDFB",
      "#DCEBFA",
      "#DDF3E8",
      "#FCE8D5",
      "#F9DFE8",
      "#E5E1FA",
    ]
    
    const newBlock = {
      id: Date.now(),
      size: blockSize,
      usedCount: 0,
      color: blockColors[trainingBlocks.length % blockColors.length],
      createdAt: new Date().toISOString(),
    }

    setTrainingBlocks([newBlock, ...trainingBlocks])
    setShowBlockForm(false)
    setBlockSize(4)
    setNotification(`Добавлен блок на ${newBlock.size} тренировки.`)
    setShowPlanForm(true)
  }

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

    const activeBlock = trainingBlocks.find(
      (block) => block.usedCount < block.size
    )

    if (!activeBlock) {
      setNotification("Сначала добавь новый блок тренировок.")
      return
    }

    const blockNumber =
      trainingBlocks.length - trainingBlocks.indexOf(activeBlock)

    const workoutNumber = activeBlock.usedCount + 1

    const newPlan = {
      id: Date.now(),
      name: planName.trim(),
      date: selectedDate,
      time: planTime,
      blockId: activeBlock.id,
      blockNumber: blockNumber,
      workoutNumber: workoutNumber,
      blockSize: activeBlock.size,
      exercises: selectedExercises,
      blockColor: activeBlock.color,
    }

    setPlannedWorkouts((prev) => [newPlan, ...prev])

    setTrainingBlocks((prev) =>
      prev.map((block) =>
        block.id === activeBlock.id
          ? { ...block, usedCount: block.usedCount + 1 }
          : block
      )
    )

    setPlanHistory((prev) => [
      {
        id: Date.now(),
        action: "Тренировка назначена",
        workoutName: newPlan.name,
        date: newPlan.date,
        time: newPlan.time,
        workoutNumber: newPlan.workoutNumber,
        blockSize: newPlan.blockSize,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])

    setNotification("Тренировка назначена!")
    setTimeout(() => setNotification(""), 3000)

    setPlanName("")
    setSelectedExerciseIds([])
    setShowPlanForm(false)
  }

  function completePlannedWorkout(workoutId) {
    const workout = plannedWorkouts.find((item) => item.id === workoutId)

    if (!workout) return

    const completedAt = new Date().toISOString()

    const completedWorkout = {
      ...workout,
      completedAt,
      exercises: (workout.exercises || []).map((exercise) => ({
        ...exercise,
        sets: Array.isArray(exercise.sets) ? exercise.sets : [],
      })),
    }

    setHistory((prev) => [completedWorkout, ...prev])

    setPlannedWorkouts((prev) => prev.filter((item) => item.id !== workoutId))

    setPlanHistory((prev) => [
      {
        id: Date.now(),
        action: "Тренировка завершена",
        workoutName: workout.name,
        date: workout.date,
        time: workout.time,
        workoutNumber: workout.workoutNumber,
        blockSize: workout.blockSize,
        createdAt: completedAt,
      },
      ...prev,
    ])

    setShowDayPopup(false)
    setNotification("Тренировка завершена!")

    setTimeout(() => setNotification(""), 3000)
  }

  function deletePlannedWorkout(workoutId) {
    const workout = plannedWorkouts.find((item) => item.id === workoutId)

    if (!workout) return

    const confirmed = window.confirm(
      "Ты действительно хочешь удалить эту тренировку?"
    )

    if (!confirmed) return

    let remainingWorkouts = plannedWorkouts.filter(
      (item) => item.id !== workoutId
    )

    if (workout.blockId) {
      const completedWorkouts = history.filter(
        (item) => item.blockId === workout.blockId
      )

      const plannedBlockWorkouts = remainingWorkouts.filter(
        (item) => item.blockId === workout.blockId
      )

      const allBlockWorkouts = [
        ...completedWorkouts,
        ...plannedBlockWorkouts,
      ].sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date)

        if (dateComparison !== 0) return dateComparison

        return (a.time || "").localeCompare(b.time || "")
      })

      const renumberedWorkouts = allBlockWorkouts.map((item, index) => ({
        ...item,
        workoutNumber: index + 1,
      }))

      remainingWorkouts = remainingWorkouts.map((item) => {
        if (item.blockId !== workout.blockId) return item

        return (
          renumberedWorkouts.find((updated) => updated.id === item.id) || item
        )
      })

      setTrainingBlocks((prev) =>
        prev.map((block) =>
          block.id === workout.blockId
            ? { ...block, usedCount: allBlockWorkouts.length }
            : block
        )
      )
    }

    setPlannedWorkouts(remainingWorkouts)

    setPlanHistory((prev) => [
      {
        id: Date.now(),
        action: "Тренировка удалена",
        workoutName: workout.name,
        date: workout.date,
        time: workout.time,
        workoutNumber: workout.workoutNumber,
        blockSize: workout.blockSize,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])

    setNotification("Тренировка удалена!")
    setTimeout(() => setNotification(""), 3000)
  }

  function saveWorkoutChanges(workoutId) {
    const workout = plannedWorkouts.find((item) => item.id === workoutId)

    if (!workout) return

    setPlannedWorkouts((prev) =>
      prev.map((item) =>
        item.id === workoutId
          ? {
              ...item,
              date: editWorkoutDate,
              time: editWorkoutTime,
              name: editWorkoutName,
            }
          : item
      )
    )

    setPlanHistory((prev) => [
      {
        id: Date.now(),
        action: "Тренировка изменена",
        workoutName: editWorkoutName,
        date: editWorkoutDate,
        time: editWorkoutTime,
        workoutNumber: workout.workoutNumber,
        blockSize: workout.blockSize,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])

    setSelectedDate(editWorkoutDate)
    setEditingWorkoutId(null)
    setNotification("Тренировка обновлена!")

    setTimeout(() => setNotification(""), 3000)
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
            const currentDate = new Date(year, month, day)

            const holidayName = calendarDays.holidays?.[date]

            const isTransferredDay =
              calendarDays.transferredDays?.includes(date)

            const isWorkingWeekend =
              calendarDays.workingWeekends?.includes(date)

            const isWeekend =
              [0, 6].includes(currentDate.getDay()) && !isWorkingWeekend

            const hasWorkout = workoutDates.includes(date)

            const dayPlannedWorkouts = plannedWorkouts.filter(
              (workout) => workout.date === date
            )

            const dayWorkouts = [
              ...history.filter((workout) => workout.date === date),
              ...dayPlannedWorkouts,
            ]
            
            const dayBlockColor = dayWorkouts.find(
              (workout) => workout.blockColor
            )?.blockColor

            return (
              <button
                key={date}
                style={
                  dayBlockColor
                    ? { "--block-color": dayBlockColor }
                    : {}
                }
                className={`calendar-day ${
                  selectedDate === date ? "selected" : ""
                } ${hasWorkout ? "has-workout" : ""} ${
                  isWeekend ? "weekend" : ""
                } ${holidayName ? "holiday" : ""} ${
                  isTransferredDay ? "transferred-day" : ""
                }`}
                title={
                  holidayName ||
                  (isTransferredDay ? "Перенесённый выходной" : "") ||
                  (isWorkingWeekend ? "Рабочий выходной" : "")
                }
                onClick={() => {
                  setSelectedDate(date)
                }}
                onDoubleClick={() => {
                  setSelectedDate(date)
                  setShowDayPopup(true)
                }}
              >
                {day}
                {hasWorkout && <span className="calendar-dot" />}

                {dayPlannedWorkouts.length > 0 && (
                  <div className="calendar-tooltip">
                    <strong>{formatDate(date)}</strong>

                    {dayPlannedWorkouts.map((workout) => (
                      <div
                        className="calendar-tooltip-workout"
                        key={workout.id}
                      >
                        <span>
                          {workout.name === "💪" ? "💪 Руки" : "🦵 Ноги"}
                        </span>

                        <span>🕒 {workout.time || "Время не указано"}</span>

                        <span>
                          Тренировка {workout.workoutNumber}/{workout.blockSize}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div className="selected-day">
        <div className="selected-day-header">
          <div>
            <h3>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                "ru-RU",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }
              )}
            </h3>
            <p>Тренировки на выбранную дату</p>
          </div>
      </div>

      {showDayPopup && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="day-popup-header">
              <div>
                <h3>{formatDate(selectedDate)}</h3>
                <p>Расписание тренировок</p>
              </div>

              <button
                className="popup-close"
                onClick={() => setShowDayPopup(false)}
              >
                ×
              </button>
            </div>

            {selectedPlannedWorkouts.length > 0 ? (
              <div className="day-popup-workouts">
                {selectedPlannedWorkouts.map((workout) => (
                  <div key={workout.id} className="day-popup-workout">
                    <div className="day-popup-workout-top">
                      <div className="day-popup-workout-name">
                        <span className="day-popup-emoji">{workout.name}</span>
                        <strong>
                          {workout.name === "💪" ? "Руки" : "Ноги"}
                        </strong>
                      </div>

                      <span className="day-popup-status">Запланировано</span>
                    </div>

                    <p className="day-popup-workout-info">
                      Тренировка {workout.workoutNumber}/{workout.blockSize}
                      {" · "}
                      {workout.time || "Время не указано"}
                    </p>

                    {editingWorkoutId === workout.id ? (
                      <div className="planned-fields">
                        <label>
                          Дата тренировки
                          <input
                            type="date"
                            value={editWorkoutDate}
                            onChange={(e) => setEditWorkoutDate(e.target.value)}
                          />
                        </label>

                        <label>
                          Время тренировки
                          <input
                            type="time"
                            value={editWorkoutTime}
                            onChange={(e) => setEditWorkoutTime(e.target.value)}
                          />
                        </label>

                        <label>Тип тренировки</label>

                        <div className="workout-type-selector">
                          <button
                            type="button"
                            className={`workout-type-button ${
                              editWorkoutName === "💪" ? "active" : ""
                            }`}
                            onClick={() => setEditWorkoutName("💪")}
                          >
                            <span>💪</span>
                            Руки
                          </button>

                          <button
                            type="button"
                            className={`workout-type-button ${
                              editWorkoutName === "🦵" ? "active" : ""
                            }`}
                            onClick={() => setEditWorkoutName("🦵")}
                          >
                            <span>🦵</span>
                            Ноги
                          </button>
                        </div>

                        <button
                          className="add-button"
                          onClick={() => saveWorkoutChanges(workout.id)}
                          disabled={
                            !editWorkoutDate ||
                            !editWorkoutTime ||
                            !editWorkoutName
                          }
                        >
                          Сохранить изменения
                        </button>

                        <div className="workout-actions">
                          <button
                            className="remove-workout-button"
                            onClick={() => deletePlannedWorkout(workout.id)}
                          >
                            🗑 Удалить
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="planned-popup-actions">
                        <button
                          className="add-button"
                          onClick={() => completePlannedWorkout(workout.id)}
                        >
                          ✓ Завершить тренировку
                        </button>
                        <button
                          className="add-button"
                          onClick={() => {
                            setEditingWorkoutId(workout.id)
                            setEditWorkoutDate(workout.date)
                            setEditWorkoutTime(workout.time || "18:00")
                            setEditWorkoutName(workout.name)
                          }}
                        >
                          Перенести / изменить
                        </button>

                        <button
                          className="planned-quick-delete"
                          onClick={() => deletePlannedWorkout(workout.id)}
                          title="Удалить тренировку"
                          aria-label="Удалить тренировку"
                        >
                          <span>🗑</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>На этот день пока нет запланированных тренировок.</p>
            )}

            {!hasPlannedWorkoutOnSelectedDate &&
              (activeBlock ? (
                <button
                  className="calendar-main-button"
                  onClick={() => {
                    setShowDayPopup(false)
                    setShowPlanForm(true)
                  }}
                >
                  ＋ Запланировать тренировку
                </button>
              ) : (
                <>
                  <h4>Предыдущий блок завершён!</h4>

                  <label>Выбери количество тренировок:</label>

                  <select
                    value={blockSize}
                    onChange={(e) => setBlockSize(Number(e.target.value))}
                  >
                    <option value={4}>4 тренировки</option>
                    <option value={8}>8 тренировок</option>
                    <option value={16}>16 тренировок</option>
                  </select>

                  <button
                    className="calendar-main-button"
                    onClick={() => {
                      setShowDayPopup(false)
                      addTrainingBlock()
                    }}
                  >
                    Создать блок и продолжить
                  </button>
                </>
              ))}
          </div>
        </div>
      )}



          {selectedWorkouts.length + selectedPlannedWorkouts.length > 0 && (
            <span className="selected-day-badge">
              {selectedWorkouts.length + selectedPlannedWorkouts.length}{" "}
              {(() => {
                const count =
                  selectedWorkouts.length + selectedPlannedWorkouts.length
                const lastTwo = count % 100
                const last = count % 10

                if (lastTwo >= 11 && lastTwo <= 14) return "тренировок"
                if (last === 1) return "тренировка"
                if (last >= 2 && last <= 4) return "тренировки"
                return "тренировок"
              })()}
            </span>
          )}
        </div>

        {showBlockForm && (
          <div className="card">
            <h3>Новый блок тренировок</h3>

            <label>Количество тренировок:</label>

            <select
              value={blockSize}
              onChange={(e) => setBlockSize(Number(e.target.value))}
            >
              <option value={4}>4 тренировки</option>
              <option value={8}>8 тренировок</option>
              <option value={16}>16 тренировок</option>
            </select>

            <button className="add-button" onClick={addTrainingBlock}>
              Создать блок
            </button>
          </div>
        )}

        {showPlanForm && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Новая тренировка</h3>

              <p>Дата: {formatDate(selectedDate)}</p>

              <label>Время тренировки</label>
              <input
                type="time"
                value={planTime}
                onChange={(e) => setPlanTime(e.target.value)}
              />

              <label>Тип тренировки</label>

              <div className="workout-type-selector">
                <button
                  type="button"
                  className={`workout-type-button ${
                    planName === "💪" ? "active" : ""
                  }`}
                  onClick={() => setPlanName("💪")}
                >
                  <span>💪</span>
                  Руки
                </button>

                <button
                  type="button"
                  className={`workout-type-button ${
                    planName === "🦵" ? "active" : ""
                  }`}
                  onClick={() => setPlanName("🦵")}
                >
                  <span>🦵</span>
                  Ноги
                </button>
              </div>

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
          </div>
        )}

        {selectedPlannedWorkouts.map((workout) => (
          <div
          className="planned-day-card"
          key={workout.id}
          style={{ "--block-color": workout.blockColor || "#e4defb" }}
        >
            <div className="planned-day-top">
              <div className="planned-day-type">
                <span className="planned-day-emoji">{workout.name}</span>
                <div>
                  <strong>
                    {workout.name === "💪"
                      ? "Тренировка рук"
                      : "Тренировка ног"}
                  </strong>
                  <span>Блок тренировок</span>
                </div>
              </div>

              <span className="planned-day-status">Запланировано</span>
            </div>

            <div className="planned-day-details">
              <div>
                <span>🕒</span>
                <strong>{workout.time || "Время не указано"}</strong>
              </div>

              <div>
                <span>🏋️</span>
                <strong>
                  Тренировка {workout.workoutNumber} из {workout.blockSize}
                </strong>
              </div>
            </div>

            <p className="planned-day-hint">
              Чтобы изменить дату или время, дважды нажми на нужную дату в
              календаре
            </p>
          </div>
        ))}

        {selectedWorkouts.length === 0 &&
          selectedPlannedWorkouts.length === 0 && (
            <div className="empty-day-card">
              <div className="empty-day-icon">🌿</div>
              <strong>День для отдыха</strong>
              <p>На этот день пока не запланировано тренировок</p>

              <button
                className="empty-day-button"
                onClick={() => setShowDayPopup(true)}
              >
                ＋ Запланировать тренировку
              </button>
            </div>
          )}

        {selectedWorkouts.length > 0 && (
          <div className="cards">
            {selectedWorkouts.map((workout) => (
              <div
              className="card completed-workout-card"
              key={workout.id}
              style={{ "--block-color": workout.blockColor || "#e4defb" }}
            >
                <div className="planned-day-top">
                  <div className="planned-day-type">
                    <span className="planned-day-emoji">{workout.name}</span>
                    <div>
                      <strong>
                        {workout.name === "💪"
                          ? "Тренировка рук"
                          : "Тренировка ног"}
                      </strong>
                      <span>
                        {workout.blockNumber
                          ? `Блок №${workout.blockNumber}`
                          : "Тренировка"}
                      </span>
                    </div>
                  </div>

                  <span className="planned-day-status completed-status">
                    ✓ Завершена
                  </span>
                </div>

                <div className="planned-day-details">
                  {workout.workoutNumber && (
                    <div>
                      <span>🏋️</span>
                      <strong>
                        Тренировка {workout.workoutNumber} из{" "}
                        {workout.blockSize}
                      </strong>
                    </div>
                  )}

                  <div>
                    <span>🕒</span>
                    <strong>{workout.time || "Время не указано"}</strong>
                  </div>
                </div>

                {(!workout.exercises || workout.exercises.length === 0) && (
                  <p className="planned-day-hint">
                    Упражнения и подходы пока не добавлены
                  </p>
                )}

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

      <div className="history-section-header">
        <div>
          <h3>Лента изменений</h3>
          <p>Назначения, переносы и удаления тренировок</p>
        </div>
      </div>

      {planHistory.length === 0 ? (
        <div className="history-empty">
          <span>📋</span>
          <strong>История пока пуста</strong>
          <p>Здесь появятся назначения, переносы и удаления тренировок</p>
        </div>
      ) : (
        <div className="history-list">
          {planHistory.map((item, index) => {
            const isCreated = item.action === "Тренировка назначена"
            const currentDay = getHistoryDayLabel(item)

            const previousDay =
              index > 0 ? getHistoryDayLabel(planHistory[index - 1]) : null

            return (
              <div key={item.id}>
                {currentDay !== previousDay && (
                  <div className="history-day-divider">{currentDay}</div>
                )}

                <div
                  className={`history-message-row ${
                    isCreated ? "outgoing" : "incoming"
                  }`}
                >
                  <div
                    className={`history-message ${
                      isCreated ? "outgoing" : "incoming"
                    }`}
                  >
                    <strong className="history-message-title">
                      {isCreated ? "✓ " : "× "}
                      {item.action}
                    </strong>

                    <p className="history-message-name">{item.workoutName}</p>

                    {item.workoutNumber && (
                      <span className="history-message-number">
                        Тренировка {item.workoutNumber}/{item.blockSize}
                      </span>
                    )}

                    <div className="history-message-meta">
                      <span>📅 {formatDate(item.date)}</span>
                      <span>🕒 {item.time || "Время не указано"}</span>
                    </div>

                    <div className="history-message-time">
                      {new Date(item.createdAt).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {notification && <div className="notification">{notification}</div>}
    </main>
  )
}

export default CalendarPage

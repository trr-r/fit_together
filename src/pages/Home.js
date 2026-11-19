
function Home({
  user,
  trainingBlocks = [],
  plannedWorkouts = [],
  history = [],
}) {
  const avatar = localStorage.getItem(`avatar_${user?.id}`) || "💜"

  const isPhoto = avatar.startsWith("data:image/")
  const blocksWithProgress = trainingBlocks.map((block) => {
    const usedCount = plannedWorkouts.filter(
      (workout) => workout.blockId === block.id
    ).length
  
    return {
      ...block,
      usedCount,
    }
  })
  
  const activeBlock =
  [...blocksWithProgress].reverse().find(
    (block) => block.usedCount > 0
  ) ||
  blocksWithProgress.find(
    (block) => block.usedCount < block.size
  )
  
  const progress = activeBlock
    ? (activeBlock.usedCount / activeBlock.size) * 100
    : 0

  const now = new Date()

  const todayDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  
  const nextWorkout = [...plannedWorkouts]
    .filter((workout) => {
      const workoutDate = new Date(`${workout.date}T00:00:00`)
  
      return workoutDate >= todayDate
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || "00:00"}`)
      const dateB = new Date(`${b.date}T${b.time || "00:00"}`)

      return dateA - dateB
    })[0]

  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`

  const monthlyWorkouts = history.filter((workout) =>
    workout.date?.startsWith(currentMonth)
  ).length

  // Определяем начало недели (понедельник)
  const getWeekStart = (date) => {
    const result = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )

    const day = (result.getDay() + 6) % 7
    result.setDate(result.getDate() - day)

    return result.getTime()
  }

  // Даты завершённых тренировок
  const workoutDates = history
    .map((workout) => workout.date)
    .filter(Boolean)
    .map((date) => new Date(`${date}T00:00:00`))
    .filter((date) => !isNaN(date.getTime()))

  const workoutWeeks = new Set(
    workoutDates.map((date) => getWeekStart(date))
  )

  const lastWorkoutDate = workoutDates.length
    ? new Date(Math.max(...workoutDates.map((date) => date.getTime())))
    : null

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const lastWorkoutDaysAgo = lastWorkoutDate
    ? Math.floor(
        (today.getTime() -
          new Date(
            lastWorkoutDate.getFullYear(),
            lastWorkoutDate.getMonth(),
            lastWorkoutDate.getDate()
          ).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  const currentWeek = getWeekStart(now)
  const lastWorkoutWeek = lastWorkoutDate
    ? getWeekStart(lastWorkoutDate)
    : null

  let activeWeeks = 0

  if (
    lastWorkoutWeek !== null &&
    lastWorkoutWeek >= currentWeek - 7 * 24 * 60 * 60 * 1000
  ) {
    let week = lastWorkoutWeek

    while (workoutWeeks.has(week)) {
      activeWeeks++
      week -= 7 * 24 * 60 * 60 * 1000
    }
  }

  const rhythmMessage =
    lastWorkoutDaysAgo === null
      ? "Начни свой ритм с первой тренировки! 💜"
      : lastWorkoutDaysAgo <= 2
      ? "Отличная работа! Продолжай в своём темпе 💪"
      : lastWorkoutDaysAgo <= 5
      ? "Небольшая пауза — скоро возвращаемся? 😊"
      : lastWorkoutDaysAgo <= 10
      ? "Давно не виделись! Может, пора запланировать тренировку?"
      : "Начать заново никогда не поздно ❤️"

  const lastWorkoutLabel =
    lastWorkoutDaysAgo === null
      ? "Тренировок пока не было"
      : lastWorkoutDaysAgo === 0
      ? "Сегодня"
      : lastWorkoutDaysAgo === 1
      ? "Вчера"
      : `${lastWorkoutDaysAgo} дн. назад`

  const weekLabel =
    activeWeeks === 1
      ? "неделя активности"
      : activeWeeks >= 2 && activeWeeks <= 4
      ? "недели активности"
      : "недель активности"

  return (
    <>
<main className="content home-page">
  <section className="home-greeting">
    <div className="home-greeting-text">
      <span>ТВОЁ ПРОСТРАНСТВО 💜</span>
      <h1>Привет, {user?.name || "спортсмен"}!</h1>
      <p>Готова к новой тренировке?</p>
    </div>

    <div className="home-avatar">
      {isPhoto ? (
        <img src={avatar} alt="Мой профиль" />
      ) : (
        <span>{avatar}</span>
      )}
    </div>
  </section>

        {/* Ближайшая тренировка */}
        <section className="next-workout-card">
          <div className="next-workout-header">
            <div>
              <span className="next-workout-label">
                ТВОЁ РАСПИСАНИЕ
              </span>
              <h3>Ближайшая тренировка</h3>
            </div>
            <span className="next-workout-icon">📅</span>
          </div>

          {nextWorkout ? (
            <div className="next-workout-details">
              <div className="next-workout-type">
                <span className="next-workout-name">
                  {nextWorkout.name}
                </span>
                <span>
                  {nextWorkout.type === "Руки"
                    ? "Тренировка рук"
                    : nextWorkout.type === "Ноги"
                    ? "Тренировка ног"
                    : nextWorkout.type || "Тренировка"}
                </span>
              </div>

              <div className="next-workout-date">
                <strong>
                  {new Date(
                    `${nextWorkout.date}T${nextWorkout.time || "00:00"}`
                  ).toLocaleDateString("ru-RU", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </strong>
                <span>{nextWorkout.time || "Время не указано"}</span>
              </div>

              <div className="next-workout-number">
                Тренировка №{nextWorkout.workoutNumber}
              </div>
            </div>
          ) : (
            <div className="next-workout-empty">
              <p>Пока нет запланированных тренировок</p>
              <span>Самое время запланировать следующую!</span>
            </div>
          )}
        </section>

        {/* Тренировочный блок */}
        <section className="active-block-card">
          {activeBlock ? (
            <>
              <div className="active-block-header">
                <div>
                  <span className="active-block-label">
                    ТВОЙ ТЕКУЩИЙ БЛОК
                  </span>
                  <h3>Тренировочный блок</h3>
                </div>
                <span className="active-block-icon">🏆</span>
              </div>

              <div className="active-block-stats">
                <div>
                  <strong>{activeBlock.size}</strong>
                  <span>Всего тренировок</span>
                </div>
                <div>
                  <strong>{activeBlock.usedCount}</strong>
                  <span>Использовано</span>
                </div>
                <div>
                  <strong>{activeBlock.size - activeBlock.usedCount}</strong>
                  <span>Осталось</span>
                </div>
              </div>

              <div className="active-block-progress-info">
                <span>Прогресс блока</span>
                <strong>
                  {activeBlock.usedCount} из {activeBlock.size}
                </strong>
              </div>

              <div className="active-block-progress">
                <div
                  className="active-block-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <div className="active-block-empty">
              <span className="active-block-icon">✨</span>
              <h3>
                {trainingBlocks.length > 0
                  ? "Все блоки завершены!"
                  : "Пока нет активного блока"}
              </h3>
              <p>
                Перейди в календарь, чтобы создать новый тренировочный блок.
              </p>
            </div>
          )}
        </section>

        {/* Твой ритм */}
        <section className="rhythm-card">
          <div className="rhythm-header">
            <div>
              <span className="rhythm-label">
                ТВОЯ РЕГУЛЯРНОСТЬ
              </span>
              <h3>Твой ритм</h3>
            </div>
            <span className="rhythm-icon">🔥</span>
          </div>

          <div className="rhythm-streak">
            <strong>{activeWeeks}</strong>
            <span>{weekLabel}</span>
          </div>

          <div className="rhythm-last-workout">
            <span>Последняя тренировка</span>
            <strong>{lastWorkoutLabel}</strong>
          </div>

          <p className="rhythm-message">{rhythmMessage}</p>
        </section>

        {/* Моя статистика */}
        <section className="stats-card">
          <div className="stats-header">
            <div>
              <span className="stats-label">
                ТВОИ РЕЗУЛЬТАТЫ
              </span>
              <h3>Моя статистика</h3>
            </div>
            <span className="stats-icon">📊</span>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <strong>{history.length}</strong>
              <span>Выполнено тренировок</span>
            </div>

            <div className="stat-item">
              <strong>{monthlyWorkouts}</strong>
              <span>За этот месяц</span>
            </div>
          </div>
        </section>

        {/* Основные разделы */}
        <div className="cards">
          <div className="card">
            <h3>Мои тренировки</h3>
            <p>Записывай упражнения и рабочие веса</p>
          </div>

          <div className="card">
            <h3>Мой прогресс</h3>
            <p>Следи за своими результатами</p>
          </div>
        </div>
      </main>
    </>
  )
}

export default Home


function ComingSoon({ title, emoji, theme, setTheme, user, onLogout }) {
    return (
      <div className="content">
        <header className="header">
          <h1>FitTogether 💜</h1>
          <p>{title}</p>
        </header>
  
        {title === "Профиль" && (
          <>
            <div className="card">
              <h3>👤 Мой профиль</h3>
              <p>{user?.name}</p>
              <p>
                {user?.role === "trainer" ? "💪 Тренер" : "🏋️ Подопечный"}
              </p>
            </div>
  
            <div className="card theme-settings-card">
              <h3>🎨 Оформление</h3>
              <p>Выбери тему приложения</p>
  
              <button
                className="theme-toggle-button"
                onClick={() =>
                  setTheme(theme === "light" ? "dark" : "light")
                }
              >
                {theme === "light"
                  ? "🌙 Включить тёмную тему"
                  : "☀️ Включить светлую тему"}
              </button>
            </div>
  
            <div className="card">
              <h3>🔄 Смена профиля</h3>
              <p>Можно выйти или выбрать другого пользователя.</p>
  
              <button onClick={onLogout}>
                Выйти / Сменить профиль
              </button>
            </div>
          </>
        )}
  
        {title !== "Профиль" && (
          <div className="card coming-soon-card">
            <div className="coming-soon-emoji">{emoji}</div>
            <h2>Раздел в разработке</h2>
            <p>
              Совсем скоро здесь появится что-то интересное!
              Мы уже работаем над этим 💜
            </p>
          </div>
        )}
      </div>
    )
  }
  
  export default ComingSoon
  
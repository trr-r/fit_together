function TrainerHome({ user }) {
    return (
      <div className="content">
        <header className="header">
          <h1>FitTogether 💜</h1>
          <p>Кабинет тренера</p>
        </header>
  
        <h2>Привет, {user?.name}!</h2>
        <p>Добро пожаловать в кабинет тренера.</p>
  
        <div className="cards">
          <div className="card">
            <h3>👥 Мои подопечные</h3>
            <p>Здесь появится список твоих подопечных.</p>
          </div>
  
          <div className="card">
            <h3>📅 Тренировки</h3>
            <p>Здесь будет управление тренировками.</p>
          </div>
        </div>
      </div>
    )
  }
  
  export default TrainerHome
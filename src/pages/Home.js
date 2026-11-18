
function Home() {
    return (
      <>
        <header className="header">
          <h1>FitTogether</h1>
          <p>Твой личный дневник тренировок</p>
        </header>
  
        <main className="content">
          <h2>Привет!</h2>
          <p>Готова к новой тренировке?</p>
  
          <div className="cards">
            <div className="card">
              <h3>Мои тренировки</h3>
              <p>Записывай упражнения и рабочие веса</p>
            </div>
  
            <div className="card">
              <h3>Календарь</h3>
              <p>Планируй дни для тренировок</p>
            </div>
  
            <div className="card">
              <h3>Мой прогресс</h3>
              <p>Следи за своими результатами</p>
            </div>
          </div>
        </main>
      </>
    );
  }
  
  export default Home;
  

import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="navigation">

      <NavLink to="/" className="nav-item">
        <span>⌂</span>
        <p>Главная</p>
      </NavLink>

      <NavLink to="/calendar" className="nav-item">
        <span>📅</span>
        <p>Календарь</p>
      </NavLink>

      <NavLink to="/workouts" className="nav-item">
        <span>🏋️</span>
        <p>Тренировки</p>
      </NavLink>

      <NavLink to="/exercises" className="nav-item">
        <span>💪</span>
        <p>Упражнения</p>
      </NavLink>

      <NavLink to="/profile" className="nav-item">
        <span>👤</span>
        <p>Профиль</p>
      </NavLink>

    </nav>
  )
}

export default Navigation

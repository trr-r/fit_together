
import { useState } from "react"
import { supabase } from "../supabaseClient"

function Register() {
  const [isLogin, setIsLogin] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("client")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    setLoading(true)
    setMessage("")
    setError("")

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) {
          setError("Не удалось войти. Проверь email и пароль.")
        }
      } else {
        if (!name.trim()) {
          setError("Введи своё имя")
          setLoading(false)
          return
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim(),
              role,
            },
          },
        })

        if (error) {
          setError(error.message)
        } else {
          setMessage("Аккаунт успешно создан! Добро пожаловать в FitTogether 💜")
        }
      }
    } catch {
      setError("Что-то пошло не так. Попробуй ещё раз.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-logo">FitTogether 💜</div>

        <p className="register-subtitle">
          Тренируйся. Развивайся. Достигай.
        </p>

        <h2>{isLogin ? "С возвращением!" : "Создай свой профиль"}</h2>

        <p className="register-description">
          {isLogin ? "Войди в свой аккаунт" : "Давай познакомимся!"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <label htmlFor="register-name">Твоё имя</label>
              <input
                id="register-name"
                type="text"
                placeholder="Как тебя зовут?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <h3>Кто ты?</h3>

              <div className="register-roles">
                <button
                  type="button"
                  className={role === "client" ? "selected-role" : ""}
                  onClick={() => setRole("client")}
                >
                  <span>🏋️</span>
                  Я подопечный
                </button>

                <button
                  type="button"
                  className={role === "trainer" ? "selected-role" : ""}
                  onClick={() => setRole("trainer")}
                >
                  <span>💪</span>
                  Я тренер
                </button>
              </div>
            </>
          )}

          <label htmlFor="register-email">Твой email</label>
          <input
            id="register-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="register-password">Пароль</label>
          <input
            id="register-password"
            type="password"
            placeholder="Минимум 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <button
            className="register-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Подожди..."
              : isLogin
                ? "Войти"
                : "Создать аккаунт"}
          </button>
        </form>

        {message && <p className="register-success">{message}</p>}
        {error && <p className="register-error">{error}</p>}

        <p className="register-description">
          {isLogin ? "Ещё нет аккаунта?" : "Уже зарегистрирован?"}
        </p>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin)
            setMessage("")
            setError("")
          }}
        >
          {isLogin ? "Создать аккаунт" : "Войти"}
        </button>
      </div>
    </div>
  )
}

export default Register

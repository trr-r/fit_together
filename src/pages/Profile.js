
import { useEffect, useState } from "react"

const avatars = [
  { emoji: "💜", color: "#eee8ff" },
  { emoji: "🏋️", color: "#e4efff" },
  { emoji: "💪", color: "#ffe8dc" },
  { emoji: "🦊", color: "#ffeadb" },
  { emoji: "🐼", color: "#e8edf3" },
  { emoji: "🐱", color: "#ffe6f0" },
  { emoji: "🐻", color: "#f4e5d6" },
  { emoji: "🐸", color: "#e1f4df" },
  { emoji: "🦄", color: "#f4e5ff" },
  { emoji: "🌸", color: "#ffe4ee" },
  { emoji: "⭐", color: "#fff2c9" },
  { emoji: "🔥", color: "#ffe3d5" },
]

function Profile({ user, theme, setTheme, onLogout }) {
  const avatarKey = `avatar_${user.id}`

  const [avatar, setAvatar] = useState(
    () => localStorage.getItem(avatarKey) || "💜"
  )

  const [showAvatars, setShowAvatars] = useState(false)

  const [photoError, setPhotoError] = useState("")

  useEffect(() => {
    localStorage.setItem(avatarKey, avatar)
  }, [avatar, avatarKey])

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0]

    if (!file) return

    setPhotoError("")

    if (!file.type.startsWith("image/")) {
      setPhotoError("Выбери файл изображения.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError("Размер фотографии не должен превышать 10 МБ.")
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        const canvas = document.createElement("canvas")
        const maxSize = 320

        const scale = Math.min(
          maxSize / image.width,
          maxSize / image.height,
          1
        )

        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)

        const context = canvas.getContext("2d")
        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        try {
          setAvatar(canvas.toDataURL("image/jpeg", 0.8))
        } catch {
          setPhotoError("Не удалось сохранить фотографию.")
        }
      }

      image.onerror = () => {
        setPhotoError("Не удалось открыть эту фотографию.")
      }

      image.src = reader.result
    }

    reader.onerror = () => {
      setPhotoError("Не удалось прочитать файл.")
    }

    reader.readAsDataURL(file)
    event.target.value = ""
  }

  const selectedAvatar = avatars.find(
    (item) => item.emoji === avatar
  )

  return (
    <div className="content profile-page">
      <header className="header">
        <h1>FitTogether 💜</h1>
        <p>Мой профиль</p>
      </header>

      <div className="card profile-main-card">
        <div className="profile-avatar-wrapper">
          {avatar.startsWith("data:image/") ? (
            <img
              src={avatar}
              alt="Фото профиля"
              className="profile-avatar"
            />
          ) : (
            <div
              className="profile-avatar profile-avatar-emoji"
              style={{
                backgroundColor: selectedAvatar?.color || "#eee8ff",
              }}
            >
              {avatar}
            </div>
          )}

          <label
            htmlFor="profile-photo"
            className="profile-photo-button"
            title="Загрузить фотографию"
          >
            📷
          </label>

          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            hidden
          />
        </div>

        <h2>{user?.name}</h2>
        <p className="profile-role">
          {user?.role === "trainer" ? "💪 Тренер" : "🏋️ Подопечный"}
        </p>
        <p className="profile-email">{user?.email}</p>

        <div className="profile-upload-actions">
          <label htmlFor="profile-photo" className="profile-upload-button">
            Загрузить фото
          </label>

          {avatar.startsWith("data:image/") && (
            <button
              className="profile-reset-button"
              onClick={() => setAvatar("💜")}
            >
              Удалить фото
            </button>
          )}
        </div>

        {photoError && (
          <p className="profile-error">{photoError}</p>
        )}
      </div>

      
<div className="card profile-avatars-card">
  <button
    className="profile-avatars-toggle"
    onClick={() => setShowAvatars(!showAvatars)}
  >
    <span>🎨 Выбрать аватар</span>
    <span>{showAvatars ? "▲" : "▼"}</span>
  </button>

  {showAvatars && (
    <>
      <p>Выбери изображение, которое тебе нравится</p>

      <div className="profile-avatars-grid">
        {avatars.map((item) => (
          <button
            key={item.emoji}
            className={`profile-avatar-option ${
              avatar === item.emoji ? "active" : ""
            }`}
            style={{ backgroundColor: item.color }}
            onClick={() => {
              setAvatar(item.emoji)
              setShowAvatars(false)
            }}
            aria-label={`Выбрать аватар ${item.emoji}`}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </>
  )}
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

      <div className="card profile-account-card">
        <h3>🔄 Мой аккаунт</h3>
        <p>Ты можешь выйти из аккаунта или войти под другим пользователем.</p>

        <button onClick={onLogout}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}

export default Profile

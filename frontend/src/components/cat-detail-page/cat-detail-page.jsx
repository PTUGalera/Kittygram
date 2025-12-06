import React from "react";
import { useHistory, useParams } from "react-router-dom";
import styles from "./cat-detail-page.module.css";
import { URL } from "../../utils/constants";

// Функция для получения hex цвета по имени цвета
const getColorHex = (colorName) => {
  const colorMap = {
    black: "#000000",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    red: "#ff0000",
    green: "#00ff00",
    blue: "#0000ff",
    yellow: "#ffff00",
    orange: "#ffa500",
    darkorange: "#ff8c00",
    purple: "#800080",
    pink: "#ffc0cb",
    brown: "#a52a2a",
    chocolate: "#d2691e",
    burlywood: "#deb887",
    grey: "#808080",
    gray: "#808080",
    чёрный: "#000000",
    белый: "#ffffff",
    рыжий: "#ff8c00",
    серый: "#808080",
  };

  const normalizedColor = colorName?.toLowerCase().trim();
  return colorMap[normalizedColor] || "#808080";
};

// Функция для определения, нужен ли темный текст на светлом фоне
const needsDarkText = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180;
};

export const CatDetailPage = () => {
  const history = useHistory();
  const { id } = useParams();
  const [cat, setCat] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    fetchCat();
  }, [id]);

  const fetchCat = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Token ${token}`;
      }

      // URL уже включает /api, поэтому используем его напрямую
      const response = await fetch(`${URL}/cats/${id}/`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Необходима авторизация. Пожалуйста, войдите в систему.");
        } else if (response.status === 404) {
          throw new Error("Кот не найден");
        } else {
          throw new Error(`Не удалось загрузить данные кота (код ошибки: ${response.status})`);
        }
      }

      const data = await response.json();
      // Обработка image_url - добавляем базовый URL если путь относительный
      const baseUrl = URL.replace('/api', '');
      if (data.image_url && !data.image_url.startsWith('http') && !data.image_url.startsWith('//')) {
        // Если путь начинается с /, добавляем базовый URL, иначе добавляем /media/ или /api/
        if (data.image_url.startsWith('/')) {
          data.image_url = `${baseUrl}${data.image_url}`;
        } else {
          data.image_url = `${baseUrl}/${data.image_url}`;
        }
      }
      setCat(data);
    } catch (err) {
      setError(err.message);
      console.error("Ошибка загрузки кота:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить этого кота?")) {
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Token ${token}`;
      }

      // URL уже включает /api, поэтому используем его напрямую
      const response = await fetch(`${URL}/cats/${id}/`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Необходима авторизация. Пожалуйста, войдите в систему.");
        } else if (response.status === 403) {
          throw new Error("У вас нет прав для удаления этого кота");
        } else if (response.status === 404) {
          throw new Error("Кот не найден");
        } else {
          throw new Error(`Не удалось удалить кота (код ошибки: ${response.status})`);
        }
      }

      history.push("/");
    } catch (err) {
      setError(err.message);
      console.error("Ошибка удаления кота:", err);
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    history.push(`/cats/${id}/edit`);
  };

  const handleBack = () => {
    history.push("/");
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.loading}>Загрузка...</div>
      </section>
    );
  }

  if (error || !cat) {
    return (
      <section className={styles.section}>
        <div className={styles.error}>{error || "Кот не найден"}</div>
        <button className={styles.backButton} onClick={handleBack}>
          Вернуться на главную
        </button>
      </section>
    );
  }

  const colorHex = getColorHex(cat.color);
  const isLightColor = needsDarkText(colorHex);

  return (
    <section className={styles.section}>
      <button className={styles.backArrow} onClick={handleBack} aria-label="Назад">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className={styles.card}>
        <div className={styles.imageContainer}>
          {cat.image_url ? (
            <img className={styles.image} src={cat.image_url} alt={cat.name} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderText}>Нет фото</span>
            </div>
          )}
          {localStorage.getItem("auth_token") && (
            <div className={styles.actions}>
              <button
                className={styles.editButton}
                onClick={handleEdit}
                aria-label="Редактировать"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Удалить"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6H5H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className={styles.content}>
          <h1 className={styles.name}>{cat.name}</h1>
          <div className={styles.year}>{cat.birth_year}</div>
          <div
            className={styles.colorTag}
            style={{
              backgroundColor: colorHex,
              color: isLightColor ? "#1c1c1c" : "#ffffff",
            }}
          >
            {cat.color}
          </div>
          {cat.achievements && cat.achievements.length > 0 && (
            <div className={styles.achievements}>
              {cat.achievements.map((achievement, index) => (
                <span key={achievement.id || achievement.achievement_name || index} className={styles.achievement}>
                  {achievement.achievement_name}
                  {index < cat.achievements.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};


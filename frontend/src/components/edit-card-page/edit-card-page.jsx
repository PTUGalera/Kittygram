import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { fileToBase64, validateImageFile } from "../../utils/imageUtils";
import styles from "./edit-card-page.module.css";
import { URL, hexToColorName } from "../../utils/constants";

// Список цветов должен соответствовать ALLOWED_COLORS в backend/kittygram_backend/settings.py
const PRESET_COLORS = [
  "#FFE4C4", // bisque (светло-кремовый)
  "#DEB887", // burlywood (светло-коричневый)
  "#FFA500", // orange (оранжевый)
  "#FF8C00", // darkorange (темно-оранжевый)
  "#D2691E", // chocolate (шоколадный)
  "#8B4513", // saddlebrown (темно-коричневый)
  "#FFFFFF", // white (белый)
  "#F5F5F5", // whitesmoke (белый дым)
  "#DCDCDC", // gainsboro (светло-серый)
  "#A9A9A9", // darkgrey (темно-серый)
  "#808080", // gray (серый)
  "#000000", // black (черный)
];

// Функция для конвертации имени цвета в hex
// Соответствует ALLOWED_COLORS в backend/kittygram_backend/settings.py
const colorNameToHex = (colorName) => {
  // Если уже hex формат, возвращаем как есть
  if (colorName && colorName.startsWith('#')) {
    return colorName.toUpperCase();
  }

  const colorMap = {
    // Основные цвета из PRESET_COLORS
    bisque: "#FFE4C4",
    burlywood: "#DEB887",
    orange: "#FFA500",
    darkorange: "#FF8C00",
    chocolate: "#D2691E",
    saddlebrown: "#8B4513",
    white: "#FFFFFF",
    whitesmoke: "#F5F5F5",
    gainsboro: "#DCDCDC",
    darkgrey: "#A9A9A9",
    darkgray: "#A9A9A9",
    gray: "#808080",
    grey: "#808080",
    black: "#000000",
    // Дополнительные цвета
    red: "#ff0000",
    green: "#00ff00",
    blue: "#0000ff",
    yellow: "#ffff00",
    purple: "#800080",
    pink: "#ffc0cb",
    brown: "#a52a2a",
  };

  const normalizedColor = colorName?.toLowerCase().trim();
  return colorMap[normalizedColor] || PRESET_COLORS[0]; // По умолчанию первый цвет из списка
};

export const EditCardPage = () => {
  const history = useHistory();
  const { id } = useParams();
  const [values, setValues] = React.useState({
    name: "",
    color: "#000000",
    birth_year: new Date().getFullYear(),
    achievements: [],
    image: null,
  });
  const [achievementInput, setAchievementInput] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(true);

  React.useEffect(() => {
    fetchCat();
  }, [id]);

  const fetchCat = async () => {
    setLoadingData(true);
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
      const hexColor = colorNameToHex(data.color);
      // Добавляем id к достижениям, если их нет
      const achievementsWithId = (data.achievements || []).map((ach, index) => ({
        ...ach,
        id: ach.id || `server-${index}`,
      }));
      setValues({
        name: data.name || "",
        color: hexColor,
        birth_year: data.birth_year || new Date().getFullYear(),
        achievements: achievementsWithId,
        image: null,
      });
      // Обработка image_url - добавляем базовый URL если путь относительный
      if (data.image_url) {
        const baseUrl = URL.replace('/api', '');
        let imageUrl = data.image_url;
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
          if (imageUrl.startsWith('/')) {
            imageUrl = `${baseUrl}${imageUrl}`;
          } else {
            imageUrl = `${baseUrl}/${imageUrl}`;
          }
        }
        setImagePreview(imageUrl);
      }
    } catch (err) {
      setErrors({ ...errors, fetch: err.message });
      console.error("Ошибка загрузки кота:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const validate = (nextValues = values) => {
    const nextErrors = {};
    if (!nextValues.name.trim()) {
      nextErrors.name = "Введите имя кота";
    } else if (nextValues.name.trim().length > 16) {
      nextErrors.name = "Имя не должно превышать 16 символов";
    }
    if (!nextValues.birth_year) {
      nextErrors.birth_year = "Введите год рождения";
    } else if (
      nextValues.birth_year < 1900 ||
      nextValues.birth_year > new Date().getFullYear()
    ) {
      nextErrors.birth_year = `Год должен быть между 1900 и ${new Date().getFullYear()}`;
    }
    return nextErrors;
  };

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    if (submitted) {
      setErrors(validate(nextValues));
    }
  };

  const handleImageChange = async (evt) => {
    const file = evt.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setErrors({ ...errors, image: validationError });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setValues({ ...values, image: base64 });
      setImagePreview(base64);
      setErrors({ ...errors, image: null });
    } catch (err) {
      setErrors({ ...errors, image: "Ошибка при загрузке изображения" });
    }
  };

  const handleAddAchievement = () => {
    if (!achievementInput.trim()) {
      return;
    }
    const newAchievement = {
      id: Date.now(),
      achievement_name: achievementInput.trim(),
    };
    setValues({
      ...values,
      achievements: [...values.achievements, newAchievement],
    });
    setAchievementInput("");
  };

  const handleRemoveAchievement = (idToRemove) => {
    setValues({
      ...values,
      achievements: values.achievements.filter((a, index) => {
        const achievementId = a.id || `server-${index}`;
        return achievementId !== idToRemove;
      }),
    });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setSubmitted(true);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: values.name.trim(),
        color: hexToColorName(values.color) || values.color,
        birth_year: parseInt(values.birth_year),
        achievements:
          values.achievements.length > 0
            ? values.achievements.map((a) => ({
              achievement_name: a.achievement_name,
            }))
            : [],
      };

      if (values.image) {
        payload.image = values.image;
      }

      const token = localStorage.getItem("auth_token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Token ${token}`;
      }

      // URL уже включает /api, поэтому используем его напрямую
      const response = await fetch(`${URL}/cats/${id}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || "Не удалось обновить кота"
        );
      }

      history.push("/");
    } catch (err) {
      setErrors({ ...errors, submit: err.message });
      console.error("Ошибка обновления кота:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <section className={styles.section}>
        <div className={styles.loading}>Загрузка данных...</div>
      </section>
    );
  }

  if (errors.fetch) {
    return (
      <section className={styles.section}>
        <div className={styles.error}>{errors.fetch}</div>
        <button
          className={styles.backButton}
          onClick={() => history.push("/")}
        >
          Вернуться на главную
        </button>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Редактировать кота</h1>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span className={styles.label}>Имя *</span>
          <input
            className={`${styles.input} ${errors.name ? styles.inputError : ""
              }`}
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="Мурзик"
            maxLength={16}
            required
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </label>

        <div className={styles.field}>
          <span className={styles.label}>Цвет кота:</span>
          <div className={styles.colorGrid}>
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`${styles.colorSwatch} ${values.color === color ? styles.colorSwatchSelected : ""
                  }`}
                style={{ backgroundColor: color }}
                onClick={() => setValues({ ...values, color })}
                aria-label={`Выбрать цвет ${color}`}
              />
            ))}
          </div>
          <div className={styles.colorDisplay}>
            <span className={styles.colorLabel}>Цвет кота:</span>
            <span className={styles.colorValue}>{values.color}</span>
          </div>
          {errors.color && <span className={styles.error}>{errors.color}</span>}
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Год рождения *</span>
          <input
            className={`${styles.input} ${errors.birth_year ? styles.inputError : ""
              }`}
            type="number"
            name="birth_year"
            value={values.birth_year}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            required
          />
          {errors.birth_year && (
            <span className={styles.error}>{errors.birth_year}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Фото</span>
          <div className={styles.imageUpload}>
            {imagePreview ? (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Preview" />
                <label className={styles.changeImageLabel}>
                  <input
                    className={styles.fileInput}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  Изменить
                </label>
                <button
                  type="button"
                  className={styles.removeImage}
                  onClick={() => {
                    setImagePreview(null);
                    setValues({ ...values, image: null });
                  }}
                >
                  Удалить
                </button>
              </div>
            ) : (
              <label className={styles.fileInputLabel}>
                <input
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <span className={styles.fileInputText}>
                  Выберите или перетащите изображение
                </span>
              </label>
            )}
          </div>
          {errors.image && <span className={styles.error}>{errors.image}</span>}
        </label>

        <div className={styles.field}>
          <span className={styles.label}>Достижения</span>
          <div className={styles.achievementsInput}>
            <input
              className={styles.input}
              type="text"
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAchievement();
                }
              }}
              placeholder="Введите достижение и нажмите Enter"
            />
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddAchievement}
            >
              Добавить
            </button>
          </div>
          {values.achievements.length > 0 && (
            <div className={styles.achievementsList}>
              {values.achievements.map((achievement, index) => {
                const achievementId = achievement.id || `server-${index}`;
                return (
                  <span key={achievementId} className={styles.achievement}>
                    {achievement.achievement_name}
                    <button
                      type="button"
                      className={styles.removeAchievement}
                      onClick={() => handleRemoveAchievement(achievementId)}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {errors.submit && (
          <div className={styles.submitError}>{errors.submit}</div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => history.push("/")}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.submit}
            disabled={loading}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </section>
  );
};


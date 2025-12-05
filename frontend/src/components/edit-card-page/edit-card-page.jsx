import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { fileToBase64, validateImageFile } from "../../utils/imageUtils";
import styles from "./edit-card-page.module.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Функция для конвертации имени цвета в hex (простая реализация для основных цветов)
const colorNameToHex = (colorName) => {
  const colorMap = {
    black: "#000000",
    white: "#ffffff",
    red: "#ff0000",
    green: "#00ff00",
    blue: "#0000ff",
    yellow: "#ffff00",
    orange: "#ffa500",
    purple: "#800080",
    pink: "#ffc0cb",
    brown: "#a52a2a",
    grey: "#808080",
    gray: "#808080",
  };
  return colorMap[colorName?.toLowerCase()] || "#000000";
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
      const token = localStorage.getItem("authToken");
      const headers = {};
      if (token) {
        headers.Authorization = `Token ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/cats/${id}/`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Не удалось загрузить данные кота");
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
      if (data.image_url) {
        setImagePreview(data.image_url);
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
        color: values.color,
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

      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Token ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/cats/${id}/`, {
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
            className={`${styles.input} ${
              errors.name ? styles.inputError : ""
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

        <label className={styles.field}>
          <span className={styles.label}>Цвет *</span>
          <div className={styles.colorInputWrapper}>
            <input
              className={styles.colorPicker}
              type="color"
              name="color"
              value={values.color}
              onChange={handleChange}
            />
            <input
              className={`${styles.input} ${
                errors.color ? styles.inputError : ""
              }`}
              type="text"
              value={values.color}
              onChange={(e) =>
                setValues({ ...values, color: e.target.value })
              }
              placeholder="#000000"
            />
          </div>
          {errors.color && <span className={styles.error}>{errors.color}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Год рождения *</span>
          <input
            className={`${styles.input} ${
              errors.birth_year ? styles.inputError : ""
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


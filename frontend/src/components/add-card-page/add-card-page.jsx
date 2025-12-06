import React from "react";
import { useHistory } from "react-router-dom";
import { fileToBase64, validateImageFile } from "../../utils/imageUtils";
import { URL, hexToColorName } from "../../utils/constants";
import styles from "./add-card-page.module.css";

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

export const AddCardPage = () => {
  const history = useHistory();
  const [values, setValues] = React.useState({
    name: "",
    color: PRESET_COLORS[0],
    birth_year: new Date().getFullYear(),
    achievements: [],
    image: null,
  });
  const [achievementInput, setAchievementInput] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

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
      setValues({ ...values, image: null });
      setImagePreview(null);
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

  const handleRemoveAchievement = (id) => {
    setValues({
      ...values,
      achievements: values.achievements.filter((a) => a.id !== id),
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

      const response = await fetch(`${URL}/cats/`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend error:", errorData);
        throw new Error(
          errorData.detail || errorData.message || JSON.stringify(errorData) || "Не удалось добавить кота"
        );
      }

      history.push("/");
    } catch (err) {
      setErrors({ ...errors, submit: err.message });
      console.error("Ошибка добавления кота:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Добавить кота</h1>
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
              {values.achievements.map((achievement) => (
                <span key={achievement.id} className={styles.achievement}>
                  {achievement.achievement_name}
                  <button
                    type="button"
                    className={styles.removeAchievement}
                    onClick={() => handleRemoveAchievement(achievement.id)}
                  >
                    ×
                  </button>
                </span>
              ))}
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
            {loading ? "Сохранение..." : "Добавить"}
          </button>
        </div>
      </form>
    </section>
  );
};


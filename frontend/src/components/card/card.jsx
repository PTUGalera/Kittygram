import React from "react";
import { useHistory } from "react-router-dom";
import styles from "./card.module.css";

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
  return colorMap[normalizedColor] || "#808080"; // По умолчанию серый
};

// Функция для определения, нужен ли темный текст на светлом фоне
const needsDarkText = (hexColor) => {
  // Простая проверка яркости цвета
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180; // Если цвет светлый, нужен темный текст
};

export const Card = ({ cat }) => {
  const history = useHistory();

  if (!cat) {
    return null;
  }

  const colorHex = getColorHex(cat.color);
  const isLightColor = needsDarkText(colorHex);

  const handleClick = () => {
    history.push(`/cats/${cat.id}`);
  };

  return (
    <article className={styles.card} onClick={handleClick} style={{ cursor: "pointer" }}>
      {cat.image_url ? (
        <img
          className={styles.image}
          src={cat.image_url}
          alt={cat.name}
        />
      ) : (
        <div className={styles.imagePlaceholder}>
          <span className={styles.placeholderText}>Нет фото</span>
        </div>
      )}
      <div className={styles.content}>
        <h3 className={styles.name}>{cat.name}</h3>
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
      </div>
    </article>
  );
};


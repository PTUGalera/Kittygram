import React from "react";
import styles from "./card.module.css";

export const Card = ({ cat }) => {
  if (!cat) {
    return null;
  }

  return (
    <article className={styles.card}>
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
        <div className={styles.info}>
          <span className={styles.label}>Цвет:</span>
          <span className={styles.value}>{cat.color}</span>
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Возраст:</span>
          <span className={styles.value}>{cat.age} {cat.age === 1 ? 'год' : cat.age < 5 ? 'года' : 'лет'}</span>
        </div>
        {cat.achievements && cat.achievements.length > 0 && (
          <div className={styles.achievements}>
            <span className={styles.label}>Достижения:</span>
            <div className={styles.achievementList}>
              {cat.achievements.map((achievement) => (
                <span key={achievement.id} className={styles.achievement}>
                  {achievement.achievement_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};


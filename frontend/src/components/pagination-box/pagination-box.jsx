import React from "react";
import styles from "./pagination-box.module.css";

export const PaginationBox = ({
  currentPage,
  hasNext,
  hasPrevious,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (hasPrevious && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  if (!hasNext && !hasPrevious) {
    return null;
  }

  return (
    <div className={styles.paginationBox}>
      <button
        className={styles.button}
        onClick={handlePrevious}
        disabled={!hasPrevious}
        aria-label="Предыдущая страница"
      >
        Назад
      </button>
      <span className={styles.pageInfo}>Страница {currentPage}</span>
      <button
        className={styles.button}
        onClick={handleNext}
        disabled={!hasNext}
        aria-label="Следующая страница"
      >
        Вперед
      </button>
    </div>
  );
};


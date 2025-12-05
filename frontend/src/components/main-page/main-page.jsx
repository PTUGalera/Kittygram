import React from "react";
import { Card } from "../card/card";
import { PaginationBox } from "../pagination-box/pagination-box";
import styles from "./main-page.module.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Тестовые данные для демонстрации
const TEST_CATS = [
  {
    id: 1,
    name: "Мурзик",
    color: "чёрный",
    birth_year: 2020,
    age: 4,
    achievements: [
      { id: 1, achievement_name: "Ловец мышей" },
      { id: 2, achievement_name: "Дружелюбный" },
    ],
    image_url: null,
  },
  {
    id: 2,
    name: "Барсик",
    color: "рыжий",
    birth_year: 2021,
    age: 3,
    achievements: [{ id: 3, achievement_name: "Игривый" }],
    image_url: null,
  },
  {
    id: 3,
    name: "Васька",
    color: "белый",
    birth_year: 2019,
    age: 5,
    achievements: [],
    image_url: null,
  },
];

export const MainPage = () => {
  const [cats, setCats] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [nextPage, setNextPage] = React.useState(null);
  const [previousPage, setPreviousPage] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    fetchCats(currentPage);
  }, [currentPage]);

  const fetchCats = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cats/?page=${page}`);
      if (!response.ok) {
        throw new Error("Не удалось загрузить список котов");
      }
      const data = await response.json();
      setCats(data.results || []);
      setNextPage(data.next);
      setPreviousPage(data.previous);
    } catch (err) {
      setError(err.message);
      console.error("Ошибка загрузки котов:", err);
      // Используем тестовые данные при ошибке загрузки
      setCats(TEST_CATS);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.loading}>Загрузка...</div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Все коты</h1>
      {error && (
        <div className={styles.errorNotice}>
          Не удалось загрузить данные с сервера. Показаны тестовые данные.
        </div>
      )}
      {cats.length === 0 ? (
        <div className={styles.empty}>Пока нет котов</div>
      ) : (
        <>
          <div className={styles.grid}>
            {cats.map((cat) => (
              <Card key={cat.id} cat={cat} />
            ))}
          </div>
          {!error && (
            <PaginationBox
              currentPage={currentPage}
              hasNext={!!nextPage}
              hasPrevious={!!previousPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </section>
  );
};


import React from "react";
import { NavLink, useHistory, useLocation } from "react-router-dom";

import logo from "../../images/logo.svg";
import { URL } from "../../utils/constants";

import styles from "./header.module.css";

const navLinks = [
  { to: "/signin", label: "Вход" },
  { to: "/signup", label: "Регистрация" },
];

export const Header = ({ extraClass = "" }) => {
  const headerClassList = `${styles.header} ${extraClass}`;
  const history = useHistory();
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [username, setUsername] = React.useState("");

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      // Получить данные пользователя
      fetchUserData(token);
    } else {
      setIsAuthenticated(false);
      setUsername("");
    }
  }, [location.pathname]);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${URL}/users/me/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsername(data.username);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUsername("");
    history.push("/");
  };

  return (
    <header className={headerClassList}>
      <div className={styles.headerContainer}>
        <NavLink className={styles.logoLink} to="/">
          <img className={styles.logo} src={logo} alt="Логотип." />
        </NavLink>
        <nav className={styles.nav}>
          {isMainPage && (
            <button
              className={styles.addButton}
              onClick={() => history.push("/cats/add")}
            >
              <span className={styles.plusIcon}>+</span>
              Добавить кота
            </button>
          )}
          {isAuthenticated ? (
            <div className={styles.userSection}>
              <span className={styles.username}>{username}</span>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Выход
              </button>
            </div>
          ) : (
            navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={styles.navLink}
                activeClassName={styles.navLinkActive}
              >
                {link.label}
              </NavLink>
            ))
          )}
        </nav>
      </div>
    </header>
  );
};

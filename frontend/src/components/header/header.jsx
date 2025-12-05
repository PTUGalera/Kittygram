import React from "react";
import { NavLink, useHistory, useLocation } from "react-router-dom";

import logo from "../../images/logo.svg";

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

  React.useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
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
            <button className={styles.logoutButton} onClick={handleLogout}>
              Выйти
            </button>
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

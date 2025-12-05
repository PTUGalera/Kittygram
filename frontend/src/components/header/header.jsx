import React from "react";
import { NavLink } from "react-router-dom";

import logo from "../../images/logo.svg";

import styles from "./header.module.css";

const navLinks = [
  { to: "/signin", label: "Вход" },
  { to: "/signup", label: "Регистрация" },
];

export const Header = ({ extraClass = "" }) => {
  const headerClassList = `${styles.header} ${extraClass}`;

  return (
    <header className={headerClassList}>
      <NavLink className={styles.logoLink} to="/">
        <img className={styles.logo} src={logo} alt="Логотип." />
      </NavLink>
      <nav className={styles.nav}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={styles.navLink}
            activeClassName={styles.navLinkActive}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

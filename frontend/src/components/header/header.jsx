import React from "react";
import { NavLink } from "react-router-dom";

import logo from "../../images/logo.svg";

import styles from "./header.module.css";

export const Header = ({ extraClass = "" }) => {
  const headerClassList = `${styles.header} ${extraClass}`;

  return (
    <header className={headerClassList}>
      <NavLink className={styles.nav} to="/">
        <img className={styles.logo} src={logo} alt="Логотип." />
      </NavLink>
    </header>
  );
};

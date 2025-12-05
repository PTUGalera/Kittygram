import React from "react";
import { Link } from "react-router-dom";

import styles from "./sign-up.module.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SignUp = () => {
  const [values, setValues] = React.useState({
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);

  const validate = (nextValues = values) => {
    const nextErrors = {};
    if (!emailRegex.test(nextValues.email.trim())) {
      nextErrors.email = "Введите корректный email";
    }
    if (nextValues.password.trim().length < 6) {
      nextErrors.password = "Пароль должен быть не короче 6 символов";
    }
    if (nextValues.confirm !== nextValues.password) {
      nextErrors.confirm = "Пароли не совпадают";
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

  const handleSubmit = (evt) => {
    evt.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setSubmitted(true);
    if (Object.keys(validationErrors).length === 0) {
      // Здесь будет вызов API регистрации
      console.log("Sign up with", values);
    }
  };

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Регистрация</h1>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            className={`${styles.input} ${
              errors.email ? styles.inputError : ""
            }`}
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Пароль</span>
          <input
            className={`${styles.input} ${
              errors.password ? styles.inputError : ""
            }`}
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          {errors.password && (
            <span className={styles.error}>{errors.password}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Подтверждение пароля</span>
          <input
            className={`${styles.input} ${
              errors.confirm ? styles.inputError : ""
            }`}
            type="password"
            name="confirm"
            value={values.confirm}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          {errors.confirm && (
            <span className={styles.error}>{errors.confirm}</span>
          )}
        </label>

        <button type="submit" className={styles.submit}>
          Зарегистрироваться
        </button>
      </form>
      <p className={styles.helper}>
        Уже есть аккаунт? <Link to="/signin">Войти</Link>
      </p>
    </section>
  );
};


import React from "react";
import { Route, Redirect } from "react-router-dom";

/**
 * Компонент для защиты маршрутов, требующих авторизации
 * Если пользователь не авторизован (нет токена), перенаправляет на страницу входа
 */
export const ProtectedRoute = ({ children, ...rest }) => {
  const token = localStorage.getItem("token");

  return (
    <Route
      {...rest}
      render={({ location }) =>
        token ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};


import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { SignIn } from "../sign-in/sign-in";
import { SignUp } from "../sign-up/sign-up";

import styles from "./app.module.css";

const HomePage = () => (
  <section className={styles.content}>
    <h1 className={styles.title}>Kittygram</h1>
    <p className={styles.subtitle}>Базовый layout с Header и Footer</p>
  </section>
);

const NotFound = () => (
  <section className={styles.content}>
    <h2 className={styles.notFound}>Страница не найдена</h2>
  </section>
);

function App() {
  return (
    <div className={styles.app}>
      <BrowserRouter>
        <Header />
        <main className={styles.content}>
          <Switch>
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route path="/signin">
              <SignIn />
            </Route>
            <Route path="/signup">
              <SignUp />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;

import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { SignIn } from "../sign-in/sign-in";
import { SignUp } from "../sign-up/sign-up";
import { MainPage } from "../main-page/main-page";
import { AddCardPage } from "../add-card-page/add-card-page";
import { EditCardPage } from "../edit-card-page/edit-card-page";

import styles from "./app.module.css";

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
              <MainPage />
            </Route>
            <Route path="/signin">
              <SignIn />
            </Route>
            <Route path="/signup">
              <SignUp />
            </Route>
            <Route path="/cats/add">
              <AddCardPage />
            </Route>
            <Route path="/cats/:id/edit">
              <EditCardPage />
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

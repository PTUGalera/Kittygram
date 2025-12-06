import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { SignIn } from "../sign-in/sign-in";
import { SignUp } from "../sign-up/sign-up";
import { MainPage } from "../main-page/main-page";
import { AddCardPage } from "../add-card-page/add-card-page";
import { EditCardPage } from "../edit-card-page/edit-card-page";
import { CatDetailPage } from "../cat-detail-page/cat-detail-page";
import { ProtectedRoute } from "../protected-route/protected-route";

import styles from "./app.module.css";

const NotFound = () => (
  <section style={{ padding: "40px", textAlign: "center" }}>
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
            <Route path="/signin">
              <SignIn />
            </Route>
            <Route path="/signup">
              <SignUp />
            </Route>
            <ProtectedRoute exact path="/">
              <MainPage />
            </ProtectedRoute>
            <ProtectedRoute path="/cats/add">
              <AddCardPage />
            </ProtectedRoute>
            <ProtectedRoute path="/cats/:id/edit">
              <EditCardPage />
            </ProtectedRoute>
            <Route path="/cats/:id">
              <CatDetailPage />
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

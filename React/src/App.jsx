import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Import custom CSS
import { NavBar, Layout } from "@components";
import {
  HomePage,
  Login,
  Register,
  Profile,
  PostList,
  SinglePost,
  CreatePost,
  EditPost, // Import EditPost
} from "@pages";
import AuthGurdRoute from "./components/AuthGurd";
import React, { Suspense } from "react";

function App() {
  return (
    <Router>
      <NavBar />
      <div className="container mt-4">
        <Suspense fallback={<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading page...</span></div></div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<AuthGurdRoute />}>
              <Route
                path="/profile"
                element={
                  <Layout>
                    <Profile />
                  </Layout>
                }
              />
              <Route
                path="/posts"
                element={
                  <Layout>
                    <PostList />
                  </Layout>
                }
              />
              <Route
                path="/create-post" // New route for creating posts
                element={
                  <Layout>
                    <CreatePost />
                  </Layout>
                }
              />
              <Route
                path="/posts/:id" // Detail page for a single post
                element={
                  <Layout>
                    <SinglePost />
                  </Layout>
                }
              />
              <Route
                path="/posts/:id/edit" // Route for editing a specific post
                element={
                  <Layout>
                    <EditPost />
                  </Layout>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;

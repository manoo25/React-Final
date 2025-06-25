import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function Home() {
  const { token } = useAuthStore();

  return (
    <div className="home-page-welcome text-center mt-5 p-5 rounded-3">
      <h1 className="display-4 fw-bold text-muted">Welcome to MyBlog</h1>
      <p className="fs-4">
        Your personal space to share thoughts, stories, and ideas with the
        world.
      </p>
      <hr className="my-4" />
      <p>
        Explore amazing content, connect with other writers, and start your own
        blogging journey today.
      </p>
      {token ? (
        <Link className="btn btn-secondary btn-hover btn-lg mt-4" to="/posts" role="button">
          View My Posts
        </Link>
      ) : (
        <>
          <Link
            className="btn btn-primary btn-lg mx-2"
            to="/login"
            role="button"
          >
            Login
          </Link>
          <Link
            className="btn btn-secondary btn-lg mx-2"
            to="/register"
            role="button"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
}

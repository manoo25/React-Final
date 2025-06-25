import { getMe } from "@/api/user";
import { getPosts } from "@/api/posts";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Link } from "react-router-dom";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorUser, setErrorUser] = useState("");
  const [errorPosts, setErrorPosts] = useState("");

  const { decodedToken, token } = useAuthStore();

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!decodedToken?.id || !token) {
        setErrorUser("User not authenticated.");
        setLoadingUser(false);
        setLoadingPosts(false);
        return;
      }

      try {
        const userResponse = await getMe();
        setUser(userResponse.data);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setErrorUser(err.response?.data?.message || "Could not load profile.");
      } finally {
        setLoadingUser(false);
      }

      try {
        const postsResponse = await getPosts(decodedToken.id);
        setUserPosts(postsResponse.data || []);
      } catch (err) {
        console.error("Failed to fetch user posts:", err);
        setErrorPosts(err.response?.data?.message || "Could not load posts.");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchInitialData();
  }, [decodedToken, token]);

  if (loadingUser || loadingPosts) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (errorUser) {
    return (
      <div className="alert alert-danger text-center">{errorUser}</div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-warning text-center">
        User profile data is not available. <Link to="/login">Login again</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=0D6EFD&color=fff&size=128`}
                alt="Avatar"
                className="rounded-circle shadow-sm mb-3"
                style={{ width: 140, height: 140, objectFit: "cover", border: '3px solid #007bff' }}
              />
              <h5 className="card-title">{user.name || "N/A"}</h5>
              <p className="text-muted mb-1">@{user.username || "N/A"}</p>
              <ul className="list-group list-group-flush mt-3 text-start">
                <li className="list-group-item d-flex justify-content-between">
                  <i className="bi bi-envelope text-primary"></i>
                  <span>{user.email}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <i className="bi bi-telephone text-success"></i>
                  <span>{user.phone || "N/A"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">My Posts ({userPosts.length})</h4>
            <Link to="/create-post" className="btn btn-outline-primary">
              <i className="bi bi-plus-circle me-1"></i>Create Post
            </Link>
          </div>

          {errorPosts && <div className="alert alert-warning">{errorPosts}</div>}

          {!errorPosts && userPosts.length === 0 && (
            <div className="alert alert-info text-center">
              You haven't created any posts yet. <Link to="/create-post">Create one now!</Link>
            </div>
          )}

          {!errorPosts && userPosts.length > 0 && (
            <div className="list-group">
              {userPosts.map(post => (
                <Link
                  to={`/posts/${post.id}`}
                  key={post.id}
                  className="list-group-item list-group-item-action flex-column align-items-start shadow-sm mb-3"
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{post.title}</h5>
                    <small className="text-muted">{formatDate(post.createdAt)}</small>
                  </div>
                  <p
                    className="mb-1 post-content-excerpt"
                    style={{
                      whiteSpace: "normal",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      wordBreak: "break-word"
                    }}
                  >
                    {(post.content || "").substring(0, 120)}...
                  </p>

                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

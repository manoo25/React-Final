import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { getPostById, deletePost as apiDeletePost } from "@/api/posts";
import { useAuthStore } from "@/store/auth";
import DOMPurify from 'dompurify';
import qs from "qs"; // To parse query string

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export default function SinglePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(""); // For success messages
  const { decodedToken } = useAuthStore();
  const currentUserId = decodedToken?.id;
  const location = useLocation(); // For reading query params

  useEffect(() => {
    // Check for messages from query params (e.g., after post update)
    const queryParams = qs.parse(location.search, { ignoreQueryPrefix: true });
    if (queryParams.updateSuccess === "true") {
      setNotification("Post successfully updated.");
      // Clean up URL by removing the query parameter
      navigate(location.pathname, { replace: true });
    }

    const loadPostDetails = async () => {
      try {
        setLoading(true);
        setError(""); // Clear previous errors
        const response = await getPostById(id);
        setPost(response.data);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError(err.response?.data?.message || "Failed to load the post. It might have been deleted or the link is incorrect.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadPostDetails();
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        setLoading(true); // Indicate activity
        await apiDeletePost(id);
        navigate("/posts?postDeleted=success"); // Redirect to post list with a success message
      } catch (err) {
        console.error("Failed to delete post:", err);
        setError(err.response?.data?.message || "Could not delete the post. Please try again.");
        setLoading(false); // Re-enable buttons if delete failed
      }
    }
  };


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading post...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center" role="alert">
        {error} <Link to="/posts" className="alert-link">Go back to posts</Link>
      </div>
    );
  }

  if (!post) {
    // This case should ideally be covered by the error state if post not found
    return (
      <div className="alert alert-warning text-center" role="alert">
        Post not found.
      </div>
    );
  }

  const isOwner = post.userId === currentUserId;

  return (
    <div className="card single-post-page">
      {notification && (
        <div className="alert alert-success text-center mb-0 border-bottom" role="alert" style={{ borderRadius: '0.375rem 0.375rem 0 0' }}>
          {notification}
        </div>
      )}
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="single-post-title mb-0">{post.title}</h2>
        {isOwner && (
          <div className="btn-group">
            <Link to={`/posts/${post.id}/edit`} className="btn btn-sm btn-outline-info me-3 rounded">
              <i className="bi bi-pencil-square"></i>Edit
            </Link>
            <button onClick={handleDelete} className="btn btn-sm btn-outline-danger rounded" disabled={loading}>
              {loading && !error ? <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> : <i className="bi bi-trash-fill me-1"></i>}
              Delete
            </button>
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="mb-3">
          <img
            src={post.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name || post.user?.username || 'A')}&background=0D6EFD&color=FFF&size=40&rounded=true`}
            alt={post.user?.name || post.user?.username}
            className="rounded-circle me-2"
            style={{width: '40px', height: '40px', objectFit: 'cover'}}
          />
          <span className="text-muted post-meta">
            By {post.user?.name || post.user?.username || "Unknown Author"}
          </span>
        </div>
        <p className="text-muted post-meta">
          Published: {formatDate(post.createdAt)}
          {post.updatedAt && new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime() && (
            <span className="ms-2 fst-italic">(Updated: {formatDate(post.updatedAt)})</span>
          )}
        </p>

        {/* Sanitize HTML content if it can contain user-generated HTML */}
        {/* For now, assuming content is plain text or to be handled carefully */}
        <div className="single-post-content mt-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.replace(/\n/g, '<br />')) }}></div>

        {post.sections && post.sections.length > 0 && (
          <div className="mt-5 single-post-sections">
            <h4 className="mb-3">Sections:</h4>
            {post.sections.map((section) => ( // Use section.id if available and unique
              <div key={section.id || section.title} className="card mb-3 shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0 text-dark">{section.title}</h5>
                </div>
                <div className="card-body">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.body.replace(/\n/g, '<br />')) }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card-footer bg-light text-center">
        <Link to="/posts" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left-circle-fill me-1"></i> Back to My Posts
        </Link>
      </div>
    </div>
  );
}

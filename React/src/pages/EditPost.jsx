import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createPostSchema } from "@/forms/schema"; // Using the same schema as create post
import { getPostById, updatePost as apiUpdatePost } from "@/api/posts";
import { useAuthStore } from "@/store/auth";

export default function EditPost() {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { decodedToken } = useAuthStore();
  const [apiError, setApiError] = useState("");
  const [isSubmittingGlobal, setIsSubmittingGlobal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [originalPost, setOriginalPost] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    reset, // To pre-fill the form
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      sections: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) {
        setApiError("Post ID is missing.");
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(true);
      try {
        const response = await getPostById(postId);
        const postData = response.data;
        setOriginalPost(postData);

        if (postData.userId !== decodedToken?.id) {
          setApiError("You are not authorized to edit this post.");
          // Optionally navigate away: navigate("/unauthorized");
          return;
        }

        // Pre-fill the form
        reset({
          title: postData.title,
          content: postData.content,
          sections: postData.sections || [], // Ensure sections is an array
        });

      } catch (e) {
        console.error("Failed to fetch post data for editing:", e);
        setApiError(e.response?.data?.message || "Failed to load post data. It might not exist or an error occurred.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchPostData();
  }, [postId, decodedToken, reset]);


  const onSubmit = async (data) => {
    if (!decodedToken?.id) {
      setApiError("Authentication error. Please log in again.");
      return;
    }
    if (originalPost?.userId !== decodedToken.id) {
        setApiError("You are not authorized to edit this post.");
        return;
    }

    setIsSubmittingGlobal(true);
    setApiError("");

    try {
      await apiUpdatePost(postId, data); // API call to update
      navigate(`/posts/${postId}?updateSuccess=true`); // Navigate back to the post view
    } catch (e) {
      console.error("Failed to update post:", e);
      setApiError(e.response?.data?.message || "An error occurred while updating the post.");
    } finally {
      setIsSubmittingGlobal(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading post for editing...</span>
        </div>
      </div>
    );
  }

  // If there was an error that prevents editing (e.g. not authorized, post not found)
  if (apiError && !isSubmittingGlobal && (!originalPost || originalPost.userId !== decodedToken?.id)) {
      return (
        <div className="alert alert-danger text-center" role="alert">
          {apiError} <Link to={originalPost ? `/posts/${postId}` : "/posts"} className="alert-link ms-1">Go back</Link>
        </div>
      );
  }


  return (
    <div className="card edit-post-form">
      <div className="card-header text-center">
        <h3>Edit Post</h3>
      </div>
      <div className="card-body">
        {/* Display API error that occurs during submission */}
        {apiError && isSubmittingGlobal && <div className="alert alert-danger" role="alert">{apiError}</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Post Title */}
          <div className="mb-3">
            <label htmlFor="postTitle" className="form-label">Post Title</label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              id="postTitle"
              {...register("title")}
            />
            {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
          </div>

          {/* Post Content */}
          <div className="mb-3">
            <label htmlFor="postContent" className="form-label">Main Content</label>
            <textarea
              className={`form-control ${errors.content ? "is-invalid" : ""}`}
              id="postContent"
              rows="5"
              {...register("content")}
            ></textarea>
            {errors.content && <div className="invalid-feedback">{errors.content.message}</div>}
          </div>

          {/* Sections */}
          <hr className="my-4" />
          <h5>Sections</h5>
          {fields.map((field, index) => (
            <div key={field.id} className="section-form mb-3 p-3 border rounded bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6>Section {index + 1}</h6>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(index)}>
                  <i className="bi bi-x-lg me-1"></i>Remove Section
                </button>
              </div>
              <div className="mb-2">
                <label htmlFor={`sections.${index}.title`} className="form-label">Section Title</label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${errors.sections?.[index]?.title ? "is-invalid" : ""}`}
                  id={`sections.${index}.title`}
                  {...register(`sections.${index}.title`)}
                />
                {errors.sections?.[index]?.title && (
                  <div className="invalid-feedback">{errors.sections[index].title.message}</div>
                )}
              </div>
              <div>
                <label htmlFor={`sections.${index}.body`} className="form-label">Section Body</label>
                <textarea
                  className={`form-control form-control-sm ${errors.sections?.[index]?.body ? "is-invalid" : ""}`}
                  id={`sections.${index}.body`}
                  rows="3"
                  {...register(`sections.${index}.body`)}
                ></textarea>
                {errors.sections?.[index]?.body && (
                  <div className="invalid-feedback">{errors.sections[index].body.message}</div>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-outline-secondary mb-3" onClick={() => append({ title: "", body: "" })}>
            <i className="bi bi-plus-circle me-1"></i>Add Section
          </button>

          <hr className="my-4" />
          <div className="d-flex justify-content-end">
            <Link to={`/posts/${postId}`} className="btn btn-outline-secondary me-2" disabled={isSubmittingGlobal}>
              Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={isSubmittingGlobal || isLoadingData}>
              {isSubmittingGlobal ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

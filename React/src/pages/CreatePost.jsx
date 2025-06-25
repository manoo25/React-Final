import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createPostSchema } from "@/forms/schema";
import { createPost as apiCreatePost } from "@/api/posts";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const navigate = useNavigate();
  const { decodedToken } = useAuthStore();
  const [apiError, setApiError] = useState("");
  const [isSubmittingGlobal, setIsSubmittingGlobal] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      sections: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  const onSubmit = async (data) => {
    if (!decodedToken?.id) {
      setApiError("You must be logged in to create a post.");
      return;
    }
    setIsSubmittingGlobal(true);
    setApiError("");

    const postData = {
      ...data,
      userId: decodedToken.id, // Add userId to the post data
    };

    try {
      const response = await apiCreatePost(postData);
      reset(); // Reset form fields
      navigate(`/posts/${response.data.id}`); // Navigate to the newly created post
    } catch (e) {
      console.error("Failed to create post:", e);
      setApiError(e.response?.data?.message || "An error occurred while creating the post. Please try again.");
    } finally {
      setIsSubmittingGlobal(false);
    }
  };

  return (
    <div className="card create-post-form">
      <div className="card-header text-center">
        <h3 className="text-dark">Create New Post</h3>
      </div>
      <div className="card-body">
        {apiError && <div className="alert alert-danger" role="alert">{apiError}</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Post Title */}
          <div className="mb-3">
            <label htmlFor="postTitle" className="form-label">Post Title</label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              id="postTitle"
              {...register("title")}
              placeholder="Enter your post title"
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
              placeholder="Write the main content of your post here..."
            ></textarea>
            {errors.content && <div className="invalid-feedback">{errors.content.message}</div>}
          </div>

          {/* Sections */}
          <hr className="my-4" />
          <h5>Sections (Optional)</h5>
          {fields.map((field, index) => (
            <div key={field.id} className="section-form mb-3 p-3 border rounded">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6>Section {index + 1}</h6>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(index)}>
                  Remove Section
                </button>
              </div>
              <div className="mb-2">
                <label htmlFor={`sections.${index}.title`} className="form-label">Section Title</label>
                <input
                  type="text"
                  className={`form-control ${errors.sections?.[index]?.title ? "is-invalid" : ""}`}
                  id={`sections.${index}.title`}
                  {...register(`sections.${index}.title`)}
                  placeholder="Title for this section"
                />
                {errors.sections?.[index]?.title && (
                  <div className="invalid-feedback">{errors.sections[index].title.message}</div>
                )}
              </div>
              <div>
                <label htmlFor={`sections.${index}.body`} className="form-label">Section Body</label>
                <textarea
                  className={`form-control ${errors.sections?.[index]?.body ? "is-invalid" : ""}`}
                  id={`sections.${index}.body`}
                  rows="3"
                  {...register(`sections.${index}.body`)}
                  placeholder="Content for this section"
                ></textarea>
                {errors.sections?.[index]?.body && (
                  <div className="invalid-feedback">{errors.sections[index].body.message}</div>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-outline-secondary mb-3" onClick={() => append({ title: "", body: "" })}>
            Add Section
          </button>

          <hr className="my-4" />
          <button type="submit" className="btn btn-primary w-100" disabled={isSubmittingGlobal}>
            {isSubmittingGlobal ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Creating Post...
              </>
            ) : (
              "Create Post"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

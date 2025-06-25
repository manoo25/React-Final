import { APIClient } from "./index"; // Assuming APIClient is your configured Axios instance

/**
 * Fetches posts. If userId is provided, fetches posts for that user.
 * Otherwise, fetches all posts (or as per backend logic).
 * @param {number} [userId] - Optional ID of the user to filter posts by.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getPosts = (userId) => {
  let url = "/posts";
  if (userId) {
    url += `?userId=${userId}`;
  }
  return APIClient.get(url);
};

/**
 * Fetches a single post by its ID.
 * @param {number|string} postId - The ID of the post to fetch.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getPostById = (postId) => {
  return APIClient.get(`/posts/${postId}`);
};

/**
 * Creates a new post.
 * @param {object} postData - Data for the new post.
 *   Expected structure: { title: string, content: string, userId: number, sections?: Array<{title: string, body: string}> }
 * @returns {Promise<AxiosResponse<any>>}
 */
export const createPost = (postData) => {
  return APIClient.post("/posts", postData);
};

/**
 * Updates an existing post by its ID.
 * @param {number|string} postId - The ID of the post to update.
 * @param {object} postData - Data to update the post with.
 *   Expected structure: { title?: string, content?: string, sections?: Array<{title: string, body: string}> } (adjust based on backend)
 * @returns {Promise<AxiosResponse<any>>}
 */
export const updatePost = (postId, postData) => {
  return APIClient.put(`/posts/${postId}`, postData);
};

/**
 * Deletes a post by its ID.
 * @param {number|string} postId - The ID of the post to delete.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const deletePost = (postId) => {
  return APIClient.delete(`/posts/${postId}`);
};

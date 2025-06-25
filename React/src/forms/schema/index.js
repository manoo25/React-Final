import * as yup from "yup";

export const logInSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .required("Password is required."),
});

export const postSectionSchema = yup.object({
  title: yup.string().required("Section title is required.").max(100, "Section title too long."),
  body: yup.string().required("Section body is required.").min(10, "Section body too short."),
});

export const createPostSchema = yup.object({
  title: yup
    .string()
    .required("Post title is required.")
    .min(5, "Title must be at least 5 characters long.")
    .max(150, "Title cannot exceed 150 characters."),
  content: yup
    .string()
    .required("Post content is required.")
    .min(20, "Content must be at least 20 characters long."),
  sections: yup
    .array()
    .of(postSectionSchema)
    .optional(), // Sections are optional overall
});

export const signUpSchema = yup.object({
  name: yup.string().required("Name is required."),
  username: yup
    .string()
    .required("Username is required.")
    .min(3, "Username must be at least 3 characters long.")
    .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .required("Password is required."),
  phone: yup
    .string()
    .matches(/^(\+?\d{1,3}[- ]?)?\d{10}$/, "Please enter a valid phone number.") // Basic phone validation
    .required("Phone number is required."),
  avatar: yup.string().url("Please enter a valid URL for the avatar.").optional(),
});


// For use cases where only email and password are required for registration initially
// This will be used for the current Register.jsx and updated later in step 7
export const baseRegisterSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .required("Password is required."),
});

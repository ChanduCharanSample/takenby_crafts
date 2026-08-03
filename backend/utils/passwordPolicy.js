// @desc   Validate password against minimum security requirements
// 8+ chars, at least one letter and one number
const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (typeof password !== "string") return "Password must be a string";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
};

module.exports = { validatePassword };

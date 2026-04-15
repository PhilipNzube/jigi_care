/**
 * Validation Utilities
 */

/**
 * Validate password based on standard requirements
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one standard special character (excluding problematic ones)
 * 
 * Allowed special characters: ! @ # $ % ^ & * ( ) _ + - . ?
 * Excluded based on user request: = [ ] { } ; ' : " | < > / ,
 * 
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: "Password is required" };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }

  // Allowed special characters: ! @ # $ % ^ & * ( ) _ + - . ?
  const specialCharRegex = /[!@#$%^&*()_+\- .?]/;
  if (!specialCharRegex.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one special character",
    };
  }

  // Check for invalid characters as per user request
  const invalidChars = ["=", "[", "]", "{", "}", ";", "'", ":", '"', "|", "<", ">", "/", ","];
  for (const char of invalidChars) {
    if (password.includes(char)) {
      return {
        valid: false,
        message: `Character (${char}) is not allowed in passwords`,
      };
    }
  }

  return { valid: true, message: "" };
};

/**
 * Get the list of allowed special characters as a string for UI display
 */
export const ALLOWED_SPECIAL_CHARS_DISPLAY = "! @ # $ % ^ & * ( ) _ + - . ?";

/**
 * Calculate age from date of birth
 * @param {string} dob - Date of birth string
 * @returns {number} - Calculated age
 */
export const calculateAge = (dob) => {
  if (!dob) return 0;
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    console.error("Error calculating age:", error);
    return 0;
  }
};

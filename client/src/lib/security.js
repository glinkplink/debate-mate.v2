import DOMPurify from "dompurify";

const MAX_INPUT_LENGTH = 500;
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_KEY = "debate_mate_rate_limit";

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Validate and truncate input length
 */
export function validateInputLength(input, maxLength = MAX_INPUT_LENGTH) {
  if (typeof input !== "string") return "";
  const sanitized = sanitizeInput(input);
  return sanitized.slice(0, maxLength);
}

/**
 * Check rate limit using localStorage
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit() {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();

    if (!stored) {
      const data = {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW,
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
      return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1, resetAt: data.resetAt };
    }

    const data = JSON.parse(stored);

    // Reset if window expired
    if (now > data.resetAt) {
      const newData = {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW,
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newData));
      return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1, resetAt: newData.resetAt };
    }

    // Check if limit exceeded
    if (data.count >= RATE_LIMIT_REQUESTS) {
      const secondsUntilReset = Math.ceil((data.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: data.resetAt,
        message: `Rate limit exceeded. Please wait ${secondsUntilReset} seconds.`,
      };
    }

    // Increment count
    data.count += 1;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    return {
      allowed: true,
      remaining: RATE_LIMIT_REQUESTS - data.count,
      resetAt: data.resetAt,
    };
  } catch (error) {
    // If localStorage fails, allow the request but log the error
    console.error("Rate limit check failed:", error);
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS, resetAt: Date.now() + RATE_LIMIT_WINDOW };
  }
}

/**
 * Validate API response structure
 */
export function validateAPIResponse(data) {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid response format" };
  }

  if (!data.content || typeof data.content !== "string") {
    return { valid: false, error: "Missing or invalid content in response" };
  }

  // Check for potential API key leaks in response
  const content = data.content.toLowerCase();
  const suspiciousPatterns = [
    /api[_-]?key/i,
    /bearer\s+[a-z0-9_-]{20,}/i,
    /x-api-key/i,
    /authorization/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      return { valid: false, error: "Response contains sensitive data" };
    }
  }

  return { valid: true };
}


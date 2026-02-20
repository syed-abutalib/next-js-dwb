// lib/config.ts
export const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Constants (safe for SSR)
export const SITE_TITLE = "Daily World Blog";
export const SITE_DESCRIPTION = `Daily World Blog posts daily on business, tech, games and consulting. Explore trending topics, guides and ideas that inspire more.`;
export const SITE_URL = "https://dailyworldblog.com";

// For components that need token, use this utility function
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("token");
  }
  return null;
};

// For components that need user info
export const getUserInfo = () => {
  if (typeof window !== 'undefined') {
    const userInfo = localStorage.getItem("user-blog");
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch {
        return null;
      }
    }
  }
  return null;
};

// Don't export token directly - it causes SSR issues
// export const token = localStorage.getItem("token"); // ❌ Don't do this
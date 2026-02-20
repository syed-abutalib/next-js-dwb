// utils/cleanContent.js
export const cleanWordPressContent = (content) => {
  if (!content) return "";

  // Remove gwmw tags and their content
  let cleaned = content.replace(/<gwmw[^>]*>.*?<\/gwmw>/g, "");

  // Remove empty gwmw style tags
  cleaned = cleaned.replace(/<gwmw[^>]*\/?>/g, "");

  // Remove any remaining gwmw attributes
  cleaned = cleaned.replace(/gwmw-[^=]*="[^"]*"/g, "");

  // Remove style attributes with gwmw
  cleaned = cleaned.replace(/style="[^"]*gwmw[^"]*"/g, "");

  // Also clean any other unwanted tags that might appear
  cleaned = cleaned.replace(/<script[^>]*>.*?<\/script>/g, "");
  cleaned = cleaned.replace(/<style[^>]*>.*?<\/style>/g, "");

  return cleaned.trim();
};

export const cleanWordPressTitle = (title) => {
  if (!title) return "";

  // Remove gwmw tags from title
  let cleaned = title.replace(/<gwmw[^>]*>.*?<\/gwmw>/g, "");
  cleaned = cleaned.replace(/<gwmw[^>]*\/?>/g, "");

  // Decode HTML entities
  cleaned = cleaned.replace(/&[^;]+;/g, (match) => {
    const element = document.createElement("textarea");
    element.innerHTML = match;
    return element.value;
  });

  return cleaned.trim();
};

export const cleanWordPressExcerpt = (excerpt, length = 200) => {
  if (!excerpt) return "";

  // Clean gwmw tags first
  let cleaned = excerpt.replace(/<gwmw[^>]*>.*?<\/gwmw>/g, "");
  cleaned = cleaned.replace(/<gwmw[^>]*\/?>/g, "");

  // Remove all HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  cleaned = cleaned.replace(/&[^;]+;/g, (match) => {
    const element = document.createElement("textarea");
    element.innerHTML = match;
    return element.value;
  });

  // Remove &hellip; and other WordPress special characters
  cleaned = cleaned.replace(/&hellip;|\[&hellip;\]/g, "...");
  cleaned = cleaned.replace(/&nbsp;/g, " ");
  cleaned = cleaned.replace(/&amp;/g, "&");

  // Trim and limit length
  cleaned = cleaned.trim();
  if (cleaned.length > length) {
    cleaned = cleaned.substring(0, length) + "...";
  }

  return cleaned;
};

export const cleanText = (text) => {
  return text
    .replace(/\[&hellip;\]/g, "…") // Replace with proper ellipsis
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
    .trim();
};

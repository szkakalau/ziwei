// Barrel re-export — all consumers import from "@/lib/db" as before.
export { sql, initDatabase } from "./client";
export {
  getUserByEmail,
  getUserById,
  createUser,
  updateUserChart,
  updateSubscription,
  updateConsultation,
  incrementChatCount,
  getActiveUsers,
} from "./users";
export { getHoroscope, upsertHoroscope } from "./horoscopes";
export { updateStreak } from "./streaks";
export {
  insertBlogPost,
  getAllGeneratedPosts,
  getAllGeneratedPostMetas,
  getGeneratedPostBySlug,
  isTopicKeyUsed,
  getGeneratedPostByDate,
} from "./blog";
export type { BlogPostRow, BlogPostMeta } from "./blog";

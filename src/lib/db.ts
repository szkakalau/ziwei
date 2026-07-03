// Barrel re-export — domain logic lives in ./db/*.ts.
// All consumers import from "@/lib/db" as before — no import path changes needed.
export {
  sql,
  initDatabase,
  getUserByEmail,
  getUserById,
  createUser,
  updateUserChart,
  updateSubscription,
  updateConsultation,
  incrementChatCount,
  getActiveUsers,
  getHoroscope,
  upsertHoroscope,
  updateStreak,
  insertBlogPost,
  getAllGeneratedPosts,
  getAllGeneratedPostMetas,
  getGeneratedPostBySlug,
  isTopicKeyUsed,
  getGeneratedPostByDate,
} from "./db/index";
export type { BlogPostRow, BlogPostMeta } from "./db/index";

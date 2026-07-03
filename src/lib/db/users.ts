import { sql } from "./client";

/** Get user by email. */
export async function getUserByEmail(email: string) {
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return rows[0] ?? null;
}

/** Get user by id. */
export async function getUserById(id: string) {
  const rows = await sql`
    SELECT id, email, birth_date, birth_time, birth_place, chart_data,
           subscription_status, trial_ends_at, stripe_customer_id, has_used_trial,
           consultation_focus, consultation_question, chat_count, created_at
    FROM users WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ?? null;
}

/** Create a new user. */
export async function createUser(params: {
  email: string;
  passwordHash: string;
}): Promise<{ id: string; email: string }> {
  const rows = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${params.email}, ${params.passwordHash})
    RETURNING id, email
  `;
  return rows[0] as { id: string; email: string };
}

/** Update user chart data (birth info + computed chart). */
export async function updateUserChart(
  userId: string,
  params: {
    birthDate: string;
    birthTime: string;
    birthPlace: { lat: number; lng: number; tz: string };
    chartData: unknown;
  },
): Promise<void> {
  await sql`
    UPDATE users SET
      birth_date = ${params.birthDate},
      birth_time = ${params.birthTime},
      birth_place = ${JSON.stringify(params.birthPlace)}::jsonb,
      chart_data = ${JSON.stringify(params.chartData)}::jsonb
    WHERE id = ${userId}
  `;
}

/** Update subscription status. `status` is optional — when omitted, the
 *  existing subscription_status is preserved (used by webhook handlers that
 *  only want to record the Stripe customer id without touching status). */
export async function updateSubscription(
  userId: string,
  params: { status?: string; trialEndsAt?: string; stripeCustomerId?: string; hasUsedTrial?: boolean },
): Promise<void> {
  await sql`
    UPDATE users SET
      subscription_status = COALESCE(${params.status ?? null}, subscription_status),
      trial_ends_at = COALESCE(${params.trialEndsAt ? new Date(params.trialEndsAt) : null}::timestamptz, trial_ends_at),
      stripe_customer_id = COALESCE(${params.stripeCustomerId ?? null}, stripe_customer_id),
      has_used_trial = COALESCE(${params.hasUsedTrial ?? null}, has_used_trial)
    WHERE id = ${userId}
  `;
}

/** Persist the snapshot consultation form (focus area + question). Overwrites
 *  prior values so a re-checkout reflects the latest submission. */
export async function updateConsultation(
  userId: string,
  params: { focusArea?: string; question?: string },
): Promise<void> {
  await sql`
    UPDATE users SET
      consultation_focus = ${params.focusArea ?? null},
      consultation_question = ${params.question ?? null}
    WHERE id = ${userId}
  `;
}

/** Atomically increment a trial user's chat count. Returns the new count and
 *  whether the user is still within the 5-message trial limit. Only meaningful
 *  for trial users; paid users skip this check entirely. */
export async function incrementChatCount(userId: string): Promise<{ allowed: boolean; used: number }> {
  const rows = await sql`
    UPDATE users SET chat_count = chat_count + 1
    WHERE id = ${userId}
    RETURNING chat_count
  `;
  const used = (rows[0]?.chat_count as number) ?? 0;
  return { allowed: used <= 5, used };
}

/** Get all active (trial or paid) users — for cron batch generation.
 *  Excludes expired trials (status='trial' but trial_ends_at in the past) so
 *  we don't burn LLM calls generating horoscopes for users who can't access them. */
export async function getActiveUsers(): Promise<Array<{ id: string; birth_date: string | null; birth_time: string | null; birth_place: unknown; chart_data: unknown }>> {
  return sql`
    SELECT id, birth_date, birth_time, birth_place, chart_data FROM users
    WHERE subscription_status = 'active'
       OR (subscription_status = 'trial' AND trial_ends_at > now())
  ` as unknown as Promise<Array<{ id: string; birth_date: string | null; birth_time: string | null; birth_place: unknown; chart_data: unknown }>>;
}

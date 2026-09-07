/**
 * Dynamic, server-side priority scoring.
 *
 * Score = upvotes * 2 + daysSinceCreated
 *
 *   Score < 5        -> LOW
 *   Score 5 - 15      -> MEDIUM
 *   Score 16 - 30     -> HIGH
 *   Score > 30        -> CRITICAL
 *
 * This is intentionally NOT stored as a trusted, manually-editable field.
 * It is computed fresh every time a complaint is read/served.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysSince(date) {
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(diff / MS_PER_DAY));
}

function scoreToLabel(score) {
  if (score < 5) return 'LOW';
  if (score <= 15) return 'MEDIUM';
  if (score <= 30) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Computes { priorityScore, priority, daysSinceCreated } for a complaint.
 * @param {{ upvotes: number, createdAt: Date|string }} complaint
 */
function calculatePriority(complaint) {
  const upvotes = complaint.upvotes || 0;
  const days = daysSince(complaint.createdAt);
  const priorityScore = upvotes * 2 + days;
  const priority = scoreToLabel(priorityScore);
  return { priorityScore, priority, daysSinceCreated: days };
}

/**
 * Takes a Mongoose document (or plain object) and returns a plain JS object
 * with priorityScore/priority attached, safe to send in an API response.
 */
function withPriority(complaintDoc) {
  const obj = typeof complaintDoc.toObject === 'function' ? complaintDoc.toObject() : { ...complaintDoc };
  const { priorityScore, priority, daysSinceCreated } = calculatePriority(obj);
  return { ...obj, priorityScore, priority, daysSinceCreated };
}

module.exports = { calculatePriority, withPriority, scoreToLabel };

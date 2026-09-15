// NOTE: the older `@google/generative-ai` SDK reached end-of-life and is no
// longer reliable against the current Gemini API - this uses the current,
// actively supported unified SDK instead.
const { GoogleGenAI } = require('@google/genai');

const SYSTEM_INSTRUCTION =
  'You are a concise government operations assistant. Summarize these complaint ' +
  'statistics in 3-5 plain English sentences for a government officer. Highlight ' +
  'critical issues, overdue complaints, emerging hotspots, and recent resolutions. ' +
  'Do not invent information.';

<<<<<<< HEAD
const COMPLAINT_SUMMARY_SYSTEM_INSTRUCTION =
  'You are an assistant for a government officer or administrator reviewing a single ' +
  'citizen complaint. Given the complaint details as JSON, write a short, plain-English ' +
  'briefing with: (1) a one-sentence summary of the issue, (2) why it matters / urgency ' +
  '(based on priority, age, and upvotes), and (3) one concrete suggested next action for ' +
  'the assigned team. Keep it under 80 words total. Do not invent facts not present in the data.';

=======
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
/**
 * Builds a deterministic, purely local summary from the stats object.
 * Used whenever Gemini is unavailable (no API key, network error, quota,
 * etc.) so the officer dashboard NEVER breaks because of a third-party API.
 */
function buildFallbackSummary(stats) {
  const sentences = [];

  sentences.push(
    `There are ${stats.totalComplaints} total complaints on record, with ${stats.newToday} filed today, ` +
      `${stats.pending} pending, ${stats.inProgress} in progress, and ${stats.resolved} resolved.`
  );

  if (stats.critical > 0 || stats.overdue > 0) {
    sentences.push(
      `${stats.critical} complaint(s) are currently rated CRITICAL priority and ${stats.overdue} ` +
        `complaint(s) are overdue and need immediate attention.`
    );
  } else {
    sentences.push('No complaints are currently rated CRITICAL priority or overdue.');
  }

  if (stats.topCategories?.length) {
    const cats = stats.topCategories.map((c) => `${c.category} (${c.count})`).join(', ');
    sentences.push(`The most reported categories are ${cats}.`);
  }

  if (stats.hotspotAreas?.length) {
    const areas = stats.hotspotAreas.map((a) => `${a.area} (${a.count})`).join(', ');
    sentences.push(`Emerging hotspot areas with repeated complaints include ${areas}.`);
  }

  sentences.push(
    `${stats.resolvedThisWeek} complaint(s) were resolved this week, out of ${stats.totalComplaints} total on file.`
  );

  return sentences.join(' ');
}

/**
 * Calls Google Gemini to generate a natural-language daily briefing from
 * aggregated complaint statistics. Falls back to a local summary if the
 * API key is missing or the call fails for any reason - this endpoint
 * must never 500 the officer dashboard.
 */
async function generateOfficerBriefing(stats) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { summary: buildFallbackSummary(stats), source: 'fallback' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Here are today's civic complaint statistics as JSON:\n${JSON.stringify(
      stats,
      null,
      2
    )}\n\nWrite the briefing now.`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response?.text?.trim();

    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    return { summary: text, source: 'gemini' };
  } catch (error) {
    console.error('[Gemini] Falling back to local summary due to error:', error.message);
    return { summary: buildFallbackSummary(stats), source: 'fallback' };
  }
}

<<<<<<< HEAD
/**
 * Builds a deterministic, purely local summary for a single complaint.
 * Used whenever Gemini is unavailable so the summarizer form never breaks.
 */
function buildFallbackComplaintSummary(complaint) {
  const parts = [];

  parts.push(
    `${complaint.category} issue in ${complaint.area}: "${complaint.title}".`
  );

  const urgencyBits = [];
  if (complaint.priority) urgencyBits.push(`${complaint.priority} priority`);
  if (typeof complaint.daysSinceCreated === 'number') {
    urgencyBits.push(`open for ${complaint.daysSinceCreated} day(s)`);
  }
  if (typeof complaint.upvotes === 'number') {
    urgencyBits.push(`${complaint.upvotes} citizen upvote(s)`);
  }
  if (urgencyBits.length) {
    parts.push(`This is currently ${urgencyBits.join(', ')}.`);
  }

  if (complaint.status === 'resolved') {
    parts.push('It has already been marked resolved.');
  } else if (complaint.status === 'in-progress') {
    parts.push('Suggested next action: confirm the assigned crew\u2019s progress and update the timeline for the citizen.');
  } else {
    parts.push('Suggested next action: assign this to the relevant department and acknowledge receipt to the citizen.');
  }

  return parts.join(' ');
}

/**
 * Calls Gemini to generate a short officer/admin-facing briefing for a
 * single complaint. Falls back to a local summary if the API key is
 * missing or the call fails for any reason.
 */
async function generateComplaintSummary(complaint) {
  const apiKey = process.env.GEMINI_API_KEY;

  const summaryInput = {
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    area: complaint.area,
    status: complaint.status,
    priority: complaint.priority,
    priorityScore: complaint.priorityScore,
    daysSinceCreated: complaint.daysSinceCreated,
    upvotes: complaint.upvotes,
    officerRemark: complaint.officerRemark || undefined,
    feedbackGiven: complaint.feedbackGiven,
    feedbackRating: complaint.feedbackRating,
  };

  if (!apiKey) {
    return { summary: buildFallbackComplaintSummary(summaryInput), source: 'fallback' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Here is one citizen complaint as JSON:\n${JSON.stringify(
      summaryInput,
      null,
      2
    )}\n\nWrite the briefing now.`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: COMPLAINT_SUMMARY_SYSTEM_INSTRUCTION,
      },
    });

    const text = response?.text?.trim();

    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    return { summary: text, source: 'gemini' };
  } catch (error) {
    console.error('[Gemini] Falling back to local complaint summary due to error:', error.message);
    return { summary: buildFallbackComplaintSummary(summaryInput), source: 'fallback' };
  }
}

module.exports = {
  generateOfficerBriefing,
  buildFallbackSummary,
  generateComplaintSummary,
  buildFallbackComplaintSummary,
};
=======
module.exports = { generateOfficerBriefing, buildFallbackSummary };
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32

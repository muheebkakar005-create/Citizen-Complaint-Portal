// NOTE: the older `@google/generative-ai` SDK reached end-of-life and is no
// longer reliable against the current Gemini API - this uses the current,
// actively supported unified SDK instead.
const { GoogleGenAI } = require('@google/genai');

const SYSTEM_INSTRUCTION =
  'You are a concise government operations assistant. Summarize these complaint ' +
  'statistics in 3-5 plain English sentences for a government officer. Highlight ' +
  'critical issues, overdue complaints, emerging hotspots, and recent resolutions. ' +
  'Do not invent information.';

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

module.exports = { generateOfficerBriefing, buildFallbackSummary };

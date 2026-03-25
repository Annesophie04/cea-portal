import { simulateCopilotReply } from '../lib/copilotMock';

/**
 * Envoie un message utilisateur au " cerveau " du copilote.
 * Aujourd'hui : mock local. Demain : remplacer le corps par fetch / SSE / SDK.
 *
 * @param {string} text
 * @param {{
 *   suggestionId?: string,
 *   documents: unknown[],
 *   activeTab: string,
 * }} ctx
 * @returns {Promise<string>} texte de réponse assistant
 */
export async function sendCopilotMessage(text, ctx) {
  return simulateCopilotReply({
    text,
    suggestionId: ctx.suggestionId,
    documents: ctx.documents,
    activeTab: ctx.activeTab,
  });
}

/*
 * Exemple futur :
 *
 * export async function sendCopilotMessage(text, ctx) {
 *   const res = await fetch('/api/copilot/chat', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ message: text, tab: ctx.activeTab }),
 *   });
 *   if (!res.ok) throw new Error('Copilot API error');
 *   const data = await res.json();
 *   return data.reply;
 * }
 */

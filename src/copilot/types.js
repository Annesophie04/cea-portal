/**
 * Contrats de données du copilote (JSDoc — projet JS).
 * Étendre ces formes pour de nouvelles suggestions ou champs API.
 */

/**
 * @typedef {'portal'} PageType
 * Contexte d'écran portail (extensible : 'modal', 'settings', etc.).
 */

/**
 * @typedef {Object} ContextData
 * @property {string} activeTab — clé d'onglet (portalTabs)
 * @property {Array<Record<string, unknown>>} documents — jeux exposés au copilote (souvent liste filtrée)
 * @property {PageType} [pageType='portal']
 */

/**
 * @typedef {Object} NavigationItem
 * @property {string} id
 * @property {string} label
 * @property {string} tabKey — cible `onNavigateTab`
 */

/**
 * @typedef {Object} Suggestion
 * @property {string} id
 * @property {string} label
 * @property {string} prompt — envoyé au mock / futur modèle
 * @property {boolean} [contextual=true] — suggestion " principale " liée au contexte
 */

/**
 * @typedef {Object} Action
 * @property {string} id
 * @property {string} label
 * @property {string} prompt
 * @property {boolean} [contextual=false] — action générique / complément
 */

/**
 * @typedef {Object} CopilotSuggestionsBundle
 * @property {NavigationItem[]} navigation
 * @property {Suggestion[]} suggestions — principales (contexte)
 * @property {Action[]} actions — utiles / compléments
 */

/**
 * @typedef {'idle' | 'loading' | 'success' | 'error' | 'empty'} CopilotInteractionState
 */

/**
 * @typedef {'user' | 'assistant'} CopilotMessageRole
 */

/**
 * @typedef {Object} CopilotMessage
 * @property {string} id
 * @property {CopilotMessageRole} role
 * @property {string} content
 */

export {};

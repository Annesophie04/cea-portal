/**
 * Rendu du texte assistant (paragraphes + **gras**).
 */
export function formatAssistantMessage(text) {
  return text.split('\n\n').map((para, i) => (
    <p key={i} className="text-sm leading-relaxed text-text/95 dark:text-text/90 whitespace-pre-wrap">
      {para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return (
            <strong key={j} className="text-copper dark:text-copper-light font-semibold">
              {chunk.slice(2, -2)}
            </strong>
          );
        }
        return chunk;
      })}
    </p>
  ));
}

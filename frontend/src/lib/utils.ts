/**
 * OWNS: General Utility Functions
 * DO: Add shared helper functions for formatting, parsing, etc.
 * DON'T: Add component-specific logic or stateful code.
 */

/**
 * Highlights JSON strings with HTML spans for syntax coloring.
 */
export const highlightJson = (json: any): string => {
  if (typeof json !== 'string') json = JSON.stringify(json, null, 2);
  
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (m: string) => {
      let c = 'syn-num';
      if (/^"/.test(m)) {
        c = /:$/.test(m) ? 'syn-key' : 'syn-str';
      } else if (/true|false/.test(m)) {
        c = 'syn-bool';
      } else if (/null/.test(m)) {
        c = 'syn-null';
      }
      return `<span class="${c}">${m}</span>`;
    });
};

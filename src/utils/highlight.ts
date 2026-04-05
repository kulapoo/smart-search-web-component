// simplified version of highlight.js - https://github.com/highlightjs/highlight.js/blob/main/src/highlight.js

export function highlight(text: string, searchTerm: string): DocumentFragment {
  const fragment = document.createDocumentFragment()

  if (!searchTerm.trim()) {
    fragment.appendChild(document.createTextNode(text))
    return fragment
  }

  // Escape regex metacharacters to prevent ReDoS
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "gi"))

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      const mark = document.createElement("mark")
      mark.className = "ss-highlight"
      mark.textContent = parts[i]
      fragment.appendChild(mark)
    } else {
      fragment.appendChild(document.createTextNode(parts[i]))
    }
  }

  return fragment
}

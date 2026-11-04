/* Renders a plain string, turning `backticks` into <code>. */
export default function Rich({ text }) {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part
  )
}

/**
 * Fixed, full-viewport ambient background: a few large, heavily-blurred
 * color blobs that drift slowly. Combined with the CursorGlow overlay and
 * translucent "glass" cards, this reads as a soft, watery surface rather
 * than a flat dark background.
 */
export default function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-blob ambient-blob--amber" />
      <div className="ambient-blob ambient-blob--emerald" />
      <div className="ambient-blob ambient-blob--blue" />
      <div className="ambient-grain" />
    </div>
  )
}

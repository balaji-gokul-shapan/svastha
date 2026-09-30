// Rigid-pendulum physics for a hanging badge: drag to toss, springs back to rest.
// (Was components/healthCard/js/script.js — same code, moved next to the card so
// the import in Page.jsx resolves.)
export function createLanyard({ pivot, onAngle, gravity = 0.035, friction = 0.985, limit = 85 }) {
  let a = 0, v = 0, raf = 0;
  let dragging = false, moved = false;
  let grab = 0, startA = 0, lastA = 0, lastT = 0;

  const pointerAngle = (e) => {
    const r = pivot().getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - r.top;
    return (Math.atan2(dx, Math.max(dy, 1)) * 180) / Math.PI;
  };
  const step = () => {
    if (!dragging) {
      v += -Math.sin((a * Math.PI) / 180) * gravity * 20; // gravity torque
      v *= friction;
      a += v;
      if (Math.abs(a) > limit) { a = Math.sign(a) * limit; v *= -0.4; }
    }
    onAngle(a);
    if (dragging || Math.abs(a) > 0.03 || Math.abs(v) > 0.03) raf = requestAnimationFrame(step);
    else { a = 0; v = 0; onAngle(0); }
  };
  const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(step); };

  return {
    kick(power = 6) { v += power; run(); },
    down(e) {
      dragging = true; moved = false;
      grab = pointerAngle(e); startA = a; lastA = a; lastT = performance.now();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      run();
    },
    move(e) {
      if (!dragging) return;
      const next = Math.max(-limit, Math.min(limit, startA - (pointerAngle(e) - grab)));
      if (Math.abs(next - startA) > 1.5) moved = true;
      const now = performance.now();
      v = ((next - lastA) / Math.max(now - lastT, 8)) * 16; // release velocity
      lastA = next; lastT = now; a = next;
    },
    up() { dragging = false; return moved; }, // returns true if it was a drag, not a click
    stop() { cancelAnimationFrame(raf); },
  };
}

import type { Screen } from '@mobilewright/core';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The rectangular drawing area of the signature canvas, in screen points. */
export interface SignatureBand {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * The "Add a Signature" modal's canvas, measured from an on-device view-tree
 * dump on the iPhone (390×844 pt): the modal title sits at ~y272 and the
 * CANCEL/CLEAR/DONE row at ~y529, so the canvas is the band between them. We
 * keep a margin so strokes land well inside the drawing area, clear of the
 * title and the buttons. Re-measure if the modal layout or device changes.
 */
const DEFAULT_BAND: SignatureBand = { left: 55, right: 345, top: 345, bottom: 495 };

/**
 * Draw a signature on the (node-less) signature canvas by laying down a few
 * strokes by coordinate.
 *
 * The canvas exposes no accessibility node, so there is nothing to target — we
 * draw by point. screen.swipe() performs a real touch-down → move → up segment
 * (one continuous stroke); a handful of vertical strokes across the band
 * registers enough ink for the app to capture the field as signed. Only cardinal
 * swipe directions are available, so the marks are simple lines — the captured
 * signature does not need to be legible, only non-empty.
 */
export const drawSignature = async (screen: Screen, band: SignatureBand = DEFAULT_BAND) => {
  const height = band.bottom - band.top;
  const strokes = 5;
  for (let i = 0; i < strokes; i++) {
    const x = Math.round(band.left + ((band.right - band.left) * i) / (strokes - 1));
    // Alternate stroke direction so consecutive lines start from opposite ends —
    // it looks more like a hand-drawn scribble and avoids a uniform comb.
    const goingDown = i % 2 === 0;
    await screen.swipe(goingDown ? 'down' : 'up', {
      startX: x,
      startY: goingDown ? band.top : band.bottom,
      distance: height,
      duration: 180,
    });
    await sleep(120);
  }
  // Inertial/redraw settle before the caller taps DONE.
  await sleep(400);
};

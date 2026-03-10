import html2canvas from "html2canvas";

/**
 * Export design as PNG.
 * Strategy:
 *  1. Draw background directly onto an offscreen canvas (avoids html2canvas CORS issues with background-image)
 *  2. Draw slot images directly onto canvas at full quality (avoid html2canvas downscale)
 *  3. Strip background + slot img CSS from DOM temporarily
 *  4. Use html2canvas to capture DOM elements only (lego, stickers, text) with transparent bg
 *  5. Composite DOM layer on top
 */
export async function exportImage(designAreaEl, selectedBackground, slotImages) {
  if (!designAreaEl) return null;

  const legoCanvas = designAreaEl.querySelector(".lego-canvas") || designAreaEl;

  const logicalWidth = parseInt(legoCanvas.style.width) || legoCanvas.offsetWidth;
  const logicalHeight = parseInt(legoCanvas.style.height) || legoCanvas.offsetHeight;

  const SCALE = 2; // 2x → 1100×1100px

  // === Step 1: Create output canvas ===
  const output = document.createElement("canvas");
  output.width = logicalWidth * SCALE;
  output.height = logicalHeight * SCALE;
  const ctx = output.getContext("2d");

  // === Step 2: Draw background directly onto canvas ===
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, output.width, output.height);

  if (selectedBackground) {
    const { type, value, backgroundSize = "cover" } = selectedBackground;

    if (type === "color") {
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, output.width, output.height);

    } else if (type === "gradient") {
      const tmp = document.createElement("div");
      tmp.style.cssText = `position:fixed;left:-9999px;top:0;width:${logicalWidth}px;height:${logicalHeight}px;background:${value};`;
      document.body.appendChild(tmp);
      try {
        const gradCanvas = await html2canvas(tmp, {
          backgroundColor: null, scale: SCALE, logging: false,
          width: logicalWidth, height: logicalHeight,
        });
        ctx.drawImage(gradCanvas, 0, 0);
      } catch { /* fallback: white */ }
      document.body.removeChild(tmp);

    } else {
      // pattern or custom: draw image directly
      const bgUrl = (value || "").replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "");
      if (bgUrl) {
        await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            if (backgroundSize === "cover") {
              const scale = Math.max(output.width / img.width, output.height / img.height);
              const w = img.width * scale;
              const h = img.height * scale;
              const x = (output.width - w) / 2;
              const y = (output.height - h) / 2;
              ctx.drawImage(img, x, y, w, h);
            } else {
              ctx.drawImage(img, 0, 0, output.width, output.height);
            }
            resolve();
          };
          img.onerror = resolve;
          img.src = bgUrl;
        });
      }
    }

    // === Step 3: Draw slot images directly at full quality ===
    if (slotImages && selectedBackground.slots?.length) {
      for (const slot of selectedBackground.slots) {
        const key = `${selectedBackground.id}_${slot.id}`;
        const src = slotImages[key];
        if (!src) continue;

        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.save();
            // Translate to slot center, rotate, draw
            const cx = (slot.x + slot.w / 2) * SCALE;
            const cy = (slot.y + slot.h / 2) * SCALE;
            const dw = slot.w * SCALE;
            const dh = slot.h * SCALE;
            ctx.translate(cx, cy);
            ctx.rotate(((slot.rotate || 0) * Math.PI) / 180);
            // cover fit
            const scale = Math.max(dw / img.width, dh / img.height);
            const sw = img.width * scale;
            const sh = img.height * scale;
            ctx.rect(-dw / 2, -dh / 2, dw, dh);
            ctx.clip();
            ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
            ctx.restore();
            resolve();
          };
          img.onerror = resolve;
          img.src = src;
        });
      }
    }
  }

  // === Step 4: Hide slot-zone imgs in DOM so html2canvas doesn't double-draw them ===
  const slotZoneImgs = legoCanvas.querySelectorAll(".slot-zone img");
  slotZoneImgs.forEach((el) => (el.style.visibility = "hidden"));

  const saved = {
    backgroundImage: legoCanvas.style.backgroundImage,
    backgroundColor: legoCanvas.style.backgroundColor,
    backgroundSize: legoCanvas.style.backgroundSize,
    backgroundPosition: legoCanvas.style.backgroundPosition,
    backgroundRepeat: legoCanvas.style.backgroundRepeat,
    transform: legoCanvas.style.transform,
    transformOrigin: legoCanvas.style.transformOrigin,
  };

  legoCanvas.style.backgroundImage = "none";
  legoCanvas.style.backgroundColor = "transparent";
  legoCanvas.style.transform = "scale(1)";
  legoCanvas.style.transformOrigin = "top left";

  const domCanvas = await html2canvas(legoCanvas, {
    backgroundColor: null,
    scale: SCALE,
    useCORS: true,
    allowTaint: false,
    logging: false,
    width: logicalWidth,
    height: logicalHeight,
  });

  // Restore
  Object.assign(legoCanvas.style, saved);
  slotZoneImgs.forEach((el) => (el.style.visibility = ""));

  // === Step 5: Composite DOM on top ===
  ctx.drawImage(domCanvas, 0, 0);

  return output.toDataURL("image/png");
}

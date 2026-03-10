import html2canvas from "html2canvas";

/**
 * Export design as PNG.
 * Strategy:
 *  1. Draw background directly onto an offscreen canvas (avoids html2canvas CORS issues with background-image)
 *  2. Strip background CSS from .lego-canvas temporarily
 *  3. Use html2canvas to capture DOM elements only (lego, stickers, text) with transparent bg
 *  4. Composite DOM layer on top of background
 */
export async function exportImage(designAreaEl, selectedBackground) {
  if (!designAreaEl) return null;

  const legoCanvas = designAreaEl.querySelector(".lego-canvas") || designAreaEl;

  const logicalWidth = parseInt(legoCanvas.style.width) || legoCanvas.offsetWidth;
  const logicalHeight = parseInt(legoCanvas.style.height) || legoCanvas.offsetHeight;

  const SCALE = 2; // 2x → 1100×1100px, sharp and not too heavy

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
      // Render gradient via a temp div
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
  }

  // === Step 3: Strip background from DOM, capture elements only ===
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

  // Restore original styles
  Object.assign(legoCanvas.style, saved);

  // === Step 4: Composite DOM on top of background ===
  ctx.drawImage(domCanvas, 0, 0);

  return output.toDataURL("image/png");
}

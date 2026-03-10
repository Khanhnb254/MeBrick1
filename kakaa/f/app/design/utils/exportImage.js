import html2canvas from "html2canvas";

export async function exportImage(designAreaEl) {
  if (!designAreaEl) return null;

  // 🔹 Lưu lại style cũ
  const oldTransform = designAreaEl.style.transform;
  const oldWidth = designAreaEl.style.width;
  const oldHeight = designAreaEl.style.height;

  // 🔹 Lấy kích thước thật (không bị scale)
  const rect = designAreaEl.getBoundingClientRect();
  const realWidth = designAreaEl.offsetWidth;
  const realHeight = designAreaEl.offsetHeight;

  // 🔹 Tắt transform để html2canvas render full size thật
  designAreaEl.style.transform = "scale(1)";
  designAreaEl.style.width = realWidth + "px";
  designAreaEl.style.height = realHeight + "px";

  const canvas = await html2canvas(designAreaEl, {
    backgroundColor: "#ffffff",
    scale: 6, // 🔥 chất lượng cao
    useCORS: true,
    allowTaint: false,
    logging: false,
  });

  // 🔹 Trả lại trạng thái ban đầu
  designAreaEl.style.transform = oldTransform;
  designAreaEl.style.width = oldWidth;
  designAreaEl.style.height = oldHeight;

  return canvas.toDataURL("image/png");
}
// app/collections/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getProducts } from "../../lib/api/products";
import { FiSearch } from "react-icons/fi";

const SAMPLE_IMAGES = Array.from({ length: 59 }, (_, i) => `/mau/${i + 1}.png`);

export default function CollectionsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI controls
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest"); // newest | price-asc | price-desc | name-asc

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getProducts("collection");
        const list = Array.isArray(data) ? data : data?.products || [];
        if (alive) setProducts(list);
      } catch (e) {
        console.error("❌ Load collections failed:", e);
        if (alive) setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = products.slice();
    switch (sort) {
      case "price-asc": list.sort((a, b) => toPriceNumber(a?.price) - toPriceNumber(b?.price)); break;
      case "price-desc": list.sort((a, b) => toPriceNumber(b?.price) - toPriceNumber(a?.price)); break;
      case "name-asc": list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""))); break;
      default: break;
    }
    return list;
  }, [products, sort]);

  const sampleItems = useMemo(() =>
    SAMPLE_IMAGES.map((src, i) => ({
      _isSample: true,
      id: `sample-${i + 1}`,
      name: `Mẫu ${i + 1}`,
      image: src,
    })),
  []);

  const allItems = useMemo(() => [...filtered, ...sampleItems], [filtered, sampleItems]);

  const filteredAll = useMemo(() => {
    if (!q.trim()) return allItems;
    const keyword = q.trim().toLowerCase();
    return allItems.filter((p) => String(p?.name || "").toLowerCase().includes(keyword));
  }, [allItems, q]);

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Header />

      <section style={{ padding: "40px 20px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            border: "1px solid #eee",
          }}>
          {/* Header row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}>
            <div>
              <h1 style={{ margin: 0, color: "#0B2D72" }}>Bộ sưu tập</h1>
              <p style={{ marginTop: 8, color: "#666" }}>
                {loading ? "Đang tải..." : `Có ${filteredAll.length} sản phẩm`}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}>
              <div style={{ position: "relative" }}>
                <FiSearch
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#999",
                  }}
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo tên..."
                  style={{ ...styles.input, paddingLeft: 38 }}
                />
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={styles.select}>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A → Z</option>
              </select>

              <Link
                href={
                  filtered?.[0]
                    ? `/design?product=${filtered[0].id}&name=${encodeURIComponent(
                        filtered[0].name || "",
                      )}&price=${toPriceNumber(filtered[0].price)}&image=${encodeURIComponent(
                        getImg(filtered[0]),
                      )}`
                    : "/collections"
                }
                style={{ textDecoration: "none" }}>
                <button style={styles.primaryBtn} disabled={!filtered?.length}>
                  Thiết kế ngay
                </button>
              </Link>
            </div>
          </div>

          {/* States */}
          {loading && (
            <div style={{ marginTop: 20 }}>
              <div style={styles.grid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={styles.card}>
                    <div style={{ ...styles.imageWrap, background: "#eee" }} />
                    <div style={{ padding: 14 }}>
                      <div style={styles.skeletonLine} />
                      <div style={{ ...styles.skeletonLine, width: "55%" }} />
                      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                        <div style={{ ...styles.skeletonBtn, flex: 1 }} />
                        <div style={styles.skeletonBtn} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && filteredAll.length === 0 && (
            <div style={{ padding: 20, color: "#666" }}>
              Không tìm thấy sản phẩm phù hợp.
            </div>
          )}

          {/* Grid — sản phẩm + ảnh mẫu */}
          {!loading && filteredAll.length > 0 && (
            <div style={styles.grid}>
              {filteredAll.map((p, pIdx) => {
                const imgSrc = getImg(p);
                // Mapping mẫu số → background id (dùng id sample-N để không bị lệch khi có real products)
                const sampleBgMapping = {
                  1: "bg-light-gray",  // Mẫu 1 → Happy Birthday ver 1
                  2: "bg-sample-5",    // Mẫu 2 → Special Day ver 1
                  3: "bg-sample-7",    // Mẫu 3 → Special Day ver 3
                  4: "bg-sample-17",   // Mẫu 4 → Happy Birthday ver 4
                  5: "bg-sample-7",    // Mẫu 5 → Special Day ver 3
                  6: "bg-sample-10",   // Mẫu 6 → Love ver 2
                  7: "bg-sample-7",    // Mẫu 7 → Special Day ver 3
                  8: "bg-sample-12",   // Mẫu 8 → Love ver 4
                  13: "bg-sample-16",  // Mẫu 13 → Happy Birthday ver 3
                  14: "bg-sample-16",  // Mẫu 14 → Happy Birthday ver 3
                  15: "bg-sample-16",  // Mẫu 15 → Happy Birthday ver 3
                  17: "bg-sample-20",  // Mẫu 17 → Happy Anniversary ver 2
                  18: "bg-sample-19",  // Mẫu 18 → Happy Anniversary ver 1
                };
                let bgParam = "";
                if (p._isSample) {
                  // Lấy số từ id "sample-N"
                  const sampleNum = parseInt(String(p.id).replace("sample-", ""), 10);
                  const bgId = sampleBgMapping[sampleNum];
                  if (bgId) bgParam = `&bg=${bgId}`;
                }

                return (
                  <div
                    key={p?.id ?? `${p?.name}-${imgSrc}`}
                    style={styles.card}>
                    <div style={p._isSample ? styles.imageWrapContain : styles.imageWrap}>
                      <img
                        src={imgSrc}
                        alt={p?.name || "product"}
                        style={p._isSample ? styles.imgContain : styles.img}
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        onError={(e) => {
                          e.currentTarget.src =
                            "/images/hero/products/product1.png";
                        }}
                      />
                    </div>

                    <div style={{ padding: 14 }}>
                      <div style={{ fontWeight: 800, color: "#0B2D72" }}>
                        {p?.name || "Sản phẩm"}
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <Link
                          href={
                            p._isSample
                              ? `/design?product=${filtered[0]?.id || ""}&name=${encodeURIComponent(filtered[0]?.name || "")}&price=${toPriceNumber(filtered[0]?.price)}&image=${encodeURIComponent(imgSrc)}${bgParam}`
                              : `/design?product=${p?.id}&name=${encodeURIComponent(p?.name || "")}&price=${toPriceNumber(p?.price)}&image=${encodeURIComponent(imgSrc)}${bgParam}`
                          }
                          style={{ textDecoration: "none" }}>
                          <button style={styles.outlineBtn}>Tùy chỉnh</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

/** Helpers */
function toPriceNumber(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (!v) return 0;

  // support: "1,200,000" | "1.200.000" | "1200000" | "1200000₫"
  const cleaned = String(v).replace(/[^\d]/g, "");
  const n = Number(cleaned || 0);
  return Number.isFinite(n) ? n : 0;
}

function getImg(p) {
  return (
    p?.image ||
    p?.imageUrl ||
    p?.thumbnail ||
    p?.thumb ||
    (Array.isArray(p?.images) ? p.images[0] : null) ||
    "/images/hero/products/product1.png"
  );
}

const styles = {
  input: {
    height: 40,
    padding: "0 12px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    outline: "none",
    minWidth: 240,
    background: "#fff",
  },
  select: {
    height: 40,
    padding: "0 10px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    background: "#fff",
    cursor: "pointer",
  },
  primaryBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #0B2D72",
    background: "#fff",
    color: "#0B2D72",
    fontWeight: 700,
    cursor: "pointer",
  },
  grid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 5px 15px rgba(0,0,0,0.04)",
  },
  imageWrap: {
    height: 190,
    background: "#f5f5f5",
    overflow: "hidden",
  },
  imageWrapContain: {
    height: 190,
    background: "#fff",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imgContain: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  outlineBtn: {
    width: "100%",
    height: 40,
    borderRadius: 10,
    border: "2px solid #0B2D72",
    background: "transparent",
    color: "#0B2D72",
    fontWeight: 700,
    cursor: "pointer",
  },
  ghostBtn: {
    height: 40,
    padding: "0 12px",
    borderRadius: 10,
    border: "1px solid #eee",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  skeletonLine: {
    height: 14,
    width: "75%",
    borderRadius: 999,
    background: "#eee",
  },
  skeletonBtn: {
    height: 40,
    width: 80,
    borderRadius: 10,
    background: "#eee",
  },
};

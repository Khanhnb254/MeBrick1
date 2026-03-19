export const BACKGROUND_OPTIONS = [

  { id: "bg-light-gray", name: "Happy Birthday", type: "pattern", value: "url('/images/hero/products/HAPPYBIRTHDAY.png')", thumbnail: "/images/hero/products/HAPPYBIRTHDAY.png", backgroundSize: "cover", slots: [
    { id: "s1", x: 53,  y: 387, w: 177, h: 102 },
  ] },
  { id: "bg-sunset", name: "Happy Together", type: "pattern", value: "url('/images/hero/products/HAPPYTOGETHER.png')", thumbnail: "/images/hero/products/HAPPYTOGETHER.png", backgroundSize: "cover", slots: [
    { id: "s4", x: 42,  y: 385, w: 82,  h: 50 },
    { id: "s0", x: 297, y: 125, w: 105, h: 99 },
    { id: "s1", x: 400, y: 121, w: 95, h: 102 },
    { id: "s2", x: 295, y: 224, w: 101, h: 107 },
    { id: "s3", x: 400, y: 224, w: 100, h: 107 },
  ] },
  { id: "bg-ocean", name: "Happy Birthday 2", type: "pattern", value: "url('/images/hero/products/HAPPYBIRTHDAY2.png')", thumbnail: "/images/hero/products/HAPPYBIRTHDAY2.png", backgroundSize: "cover", slots: [
    { id: "s0", x: 54,  y: 142, w: 120, h: 119, rotate: -18 },
    { id: "s1", x: 178, y: 172, w: 115, h: 113, rotate: 10 },
  ] },
  // ===== ẢNH MẪU (sample4 – sample56) =====
  ...Array.from({ length: 53 }, (_, i) => {
    const n = i + 4;
    const skip = [4, 50];
    if (skip.includes(n)) return null;
    const customNames = {
      5:  "Special Day ver 1",
      6:  "Special Day ver 2",
      7:  "Special Day ver 3",
      8:  "Happy Birthday ver 10",
      9:  "Love ver 1",
      10: "Love ver 2",
      11: "Love ver 3",
      12: "Love ver 4",
      13: "Love ver 5",
      14: "Love ver 6",
      15: "Love ver 7",
      16: "Happy Birthday ver 2",
      17: "Happy Birthday ver 3",
      18: "Special Day ver 4",
      19: "Happy Anniversary ver 3",
      20: "Happy Anniversary ver 1",
      21: "Happy Anniversary ver 2",
      22: "Love ver 8",      23: "Love ver 9",
      24: "Love ver 10",
      25: "Love ver 11",
      26: "Love ver 12",
      27: "Graduation ver 1",
      28: "Special Day ver 5",
      29: "Happy Birthday ver 4",
      30: "Special Day ver 6",
      31: "Love ver 13",
      32: "Love ver 14",
      33: "Graduation ver 4",
      34: "Happy Birthday ver 5",
      35: "Happy Birthday ver 6",
      36: "Happy Birthday ver 7",
      37: "Happy Birthday ver 8",
      38: "Graduation ver 2",
      39: "Graduation ver 3",
      40: "Special Day ver 7",
      41: "Special Day ver 8",
      42: "Special Day ver 9",
      43: "Happy Anniversary ver 4",
      44: "Special Day ver 10",
      45: "Special Day ver 11",
      46: "Special Day ver 12",
      47: "Special Day ver 13",
      48: "Special Day ver 14",
      49: "Happy Birthday ver 9",
      51: "Special Day ver 15",
      52: "Special Day ver 16",
      53: "Football 1",
      54: "Football 2",
      55: "Football 3",
      56: "Special Day ver 17",
    };
    // Photo slots (tọa độ đã scale từ 1080×1080 → 550×550)
    const slotsMap = {
      4: [
        { id: "s1", x: -9, y: 0, w: 0, h: 0 }, // TODO: Cập nhật y, w, h đúng nếu cần
      ],
      5: [
        { id: "s1", x: 53,  y: 387, w: 177, h: 102 },
      ],
      6: [
        { id: "s1", x: 38,  y: 379, w: 222, h: 125 },
        { id: "s2", x: 275, y: 377, w: 64,  h: 56  },
      ],
      7: [
        { id: "s1", x: 43,  y: 377, w: 61,  h: 54  },
        { id: "s2", x: 309, y: 379, w: 41,  h: 42  },
        { id: "s3", x: 309, y: 420, w: 41,  h: 39  },
        { id: "s4", x: 309, y: 461, w: 42,  h: 42  },
      ],
      8: [
        { id: "s1", x: 59,  y: 380, w: 164, h: 102 },
      ],
      9: [
        { id: "s1", x: 43,  y: 377, w: 61,  h: 59  },
        { id: "s2", x: 309, y: 379, w: 41,  h: 42  },
        { id: "s3", x: 309, y: 420, w: 41,  h: 39  },
        { id: "s4", x: 309, y: 461, w: 42,  h: 42  },
      ],
      12: [
        { id: "s1", x: 43,  y: 377, w: 61,  h: 53  },
        { id: "s2", x: 309, y: 379, w: 41,  h: 47  },
        { id: "s3", x: 309, y: 420, w: 41,  h: 44  },
        { id: "s4", x: 309, y: 461, w: 42,  h: 47  },
      ],
      13: [
        { id: "s1", x: 43,  y: 377, w: 61,  h: 59  },
        { id: "s2", x: 309, y: 379, w: 41,  h: 47  },
        { id: "s3", x: 309, y: 420, w: 41,  h: 44  },
        { id: "s4", x: 309, y: 461, w: 42,  h: 47  },
      ],
      15: [
        { id: "s1", x: 43,  y: 377, w: 61,  h: 53  },
        { id: "s2", x: 309, y: 379, w: 41,  h: 47  },
        { id: "s3", x: 309, y: 420, w: 41,  h: 44  },
        { id: "s4", x: 309, y: 461, w: 42,  h: 47  },
      ],
      19: [
        { id: "s0", x: 38,  y: 178, w: 211, h: 160 },
        { id: "s1", x: 38,  y: 344, w: 211, h: 163 },
      ],
      20: [],
      21: [],
      43: [
        { id: "s0", x: 80,  y: 128, w: 100, h: 100, rotate: -10 },
        { id: "s1", x: 218, y: 114,  w: 102, h: 96, rotate:  0 },
        { id: "s2", x: 365, y: 138, w: 101, h: 98, rotate: 17 },
        { id: "s3", x: 66,  y: 458, w: 58,  h: 54,  rotate:  0 },
        { id: "s4", x: 302, y: 453, w: 44,  h: 60,  rotate: 1 },
      ],
      48: [
        { id: "s0", x: 73,  y: 76, w: 100, h: 100, rotate: -10 },
        { id: "s5", x: 211, y: 62,  w: 102, h: 96, rotate:  0 },
        { id: "s6", x: 358, y: 86, w: 101, h: 98, rotate: 17 },
        { id: "s1", x: 43,  y: 377, w: 43,  h: 35  },
        { id: "s2", x: 309, y: 379, w: 23,  h: 29  },
        { id: "s3", x: 309, y: 420, w: 23,  h: 26  },
        { id: "s4", x: 309, y: 461, w: 24,  h: 29  },
      ],
    };
    return {
      id: `bg-sample-${n}`,
      name: customNames[n] ?? `Mẫu ${n}`,
      type: "pattern",
      value: `url('/samples/sample${n}.png')`,
      thumbnail: `/samples/sample${n}.png`,
      backgroundSize: "cover",
      slots: slotsMap[n] ?? [],
    };
  }).filter(Boolean),
];

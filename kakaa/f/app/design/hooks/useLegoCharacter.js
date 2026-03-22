"use client";

import { useEffect, useCallback } from "react";

export function useLegoCharacter({
  LEGO_CONFIG,
  canvasSize,
  stickers,
  setStickers,
  legoCharacters,
  setLegoCharacters,
  selectedCharacterId,
  setSelectedCharacterId,
  legoCharactersRef,

  setSelectedId,
  setActivePanel,

  setShowOutfitSelector,
  setOutfitSelectorCharId,
}) {
  // Luôn dùng config desktop — canvas được scale bởi canvasScale trong Stage
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
  const partConfig = LEGO_CONFIG.partConfig;
  const assemblyConfig = LEGO_CONFIG.assemblyConfig;
  const mobileScale = 1;

  useEffect(() => {
    if (legoCharactersRef) legoCharactersRef.current = legoCharacters;
  }, [legoCharacters, legoCharactersRef]);

  const getCharacterById = useCallback(
    (id) => {
      if (!id) return null;
      return legoCharactersRef?.current?.find((c) => c.id === id) || null;
    },
    [legoCharactersRef],
  );

  const findPriceBySrc = (list, src) => {
    if (!src) return 0;
    const obj = (list || []).find((x) => x?.src === src);
    return Number(obj?.price || 0);
  };
  const getHairLiftOffset = (faceSrc, hairSrc) => {
    const isFace5Or6 =
      faceSrc === "/images/lego/faces/15.png" ||
      faceSrc === "/images/lego/faces/34.png";
    const isHair2Or4 =
      hairSrc === "/images/lego/hair/nam/tocnam2.png" ||
      hairSrc === "/images/lego/hair/nam/tocnam4.png";
    const isFace5 = faceSrc === "/images/lego/faces/15.png";
    const isFemaleHair1Or2 =
      hairSrc === "/images/lego/hair/nu/tocnu1.png" ||
      hairSrc === "/images/lego/hair/nu/tocnu2.png";
    if (isFace5Or6 && isHair2Or4) {
      return -2;
    }
    if (isFace5 && isFemaleHair1Or2) {
      return -2;
    }
    if (
      faceSrc === "/images/lego/faces/faceswoman/10.png" ||
      faceSrc === "/images/lego/faces/faceswoman/45.png"
    ) {
      return -3;
    }
    if (
      faceSrc === "/images/lego/faces/15.png" ||
      faceSrc === "/images/lego/faces/34.png"
    ) {
      return -1;
    }
    return 0;
  };
  const getHairSizeBoostForFace = (faceSrc) => {
    if (
      faceSrc === "/images/lego/faces/15.png" ||
      faceSrc === "/images/lego/faces/34.png"
    ) {
      return 2;
    }
    return 0;
  };

  const calculateExactPosition = (character, partType) => {
    const config = partConfig[partType];
    const assembly = assemblyConfig;

    if (!config) return { x: 0, y: 0, width: 0, height: 0 };

    let x = character.x + (config.offsetX || 0);
    let y = character.y + (config.offsetY || 0);

    switch (partType) {
      case "head":
        y -= assembly.headToTorso.overlap || 0;
        break;

      case "torso":
        break;

      case "legs":
        y -= assembly.torsoToLegs.overlap || 0;
        break;

      case "outfit":
        x = character.x + (config.offsetX || 0);
        y = character.y + (partConfig.torso.offsetY || 0);
        break;

      case "face": {
        const headCfg = partConfig.head;
        const headX = character.x + (headCfg.offsetX || 0);
        const headY =
          character.y +
          (headCfg.offsetY || 0) -
          (assembly.headToTorso.overlap || 0);

        x = headX + (headCfg.width - config.width) / 2 + (config.offsetX || 0);
        y = headY + (config.offsetY || 0);
        break;
      }

      case "hair": {
        const headCfg = partConfig.head;
        const headX = character.x + (headCfg.offsetX || 0);
        const headY =
          character.y +
          (headCfg.offsetY || 0) -
          (assembly.headToTorso.overlap || 0);

        x = headX + (headCfg.width - config.width) / 2 + (config.offsetX || 0);
        y = headY + (config.offsetY || 0) - 3;
        break;
      }

      default:
        break;
    }

    return { x, y, width: config.width, height: config.height };
  };

  const createStickersFromCharacter = (character) => {
    const result = [];

    if (character.legs) {
      const pos = calculateExactPosition(character, "legs");
      result.push({
        id: `${character.id}-legs`,
        type: "lego",
        name: "Chân",
        src: character.legs,
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
        zIndex: partConfig.legs.zIndex,
        isSelected: false,
        layerType: "base",
        part: "legs",
        characterId: character.id,
        isBasePart: true,
        price: Number(character.pants_price || 0),
      });
    }

    if (character.torso) {
      const pos = calculateExactPosition(character, "torso");
      // ✅ outfit hiển thị trên torso => price của outfit gắn vào torso sticker
      result.push({
        id: `${character.id}-torso`,
        type: "lego",
        name: "Thân",
        src: character.outfit || character.torso,
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
        zIndex: partConfig.torso.zIndex,
        isSelected: false,
        layerType: "base",
        part: "torso",
        characterId: character.id,
        isBasePart: true,
        price: Number(character.outfit_price || 0),
      });
    }

    if (character.head) {
      const pos = calculateExactPosition(character, "head");
      result.push({
        id: `${character.id}-head`,
        type: "lego",
        name: "Đầu",
        src: character.head,
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
        zIndex: partConfig.head.zIndex,
        isSelected: false,
        layerType: "base",
        part: "head",
        characterId: character.id,
        isBasePart: true,
        price: 0,
      });
    }

    // ❌ Xóa phần face (khuôn mặt) để tránh chồng lấp
    // if (character.face) { ... }

    if (character.hair) {
      const pos = calculateExactPosition(character, "hair");
      const hairObj = (LEGO_CONFIG?.hairs || []).find((h) => h?.src === character.hair);
      const offsetYExtra = hairObj?.offsetYExtra || 0;
      const offsetXExtra = hairObj?.offsetXExtra || 0;
      const faceLiftY = getHairLiftOffset(character.face, character.hair);
      const sizeScale = hairObj?.sizeScale || 1;
      const heightAdjust = Number(hairObj?.heightAdjust || 0);
      const hairRotation = Number(hairObj?.rotation || 0);
      const hairSizeBoost = getHairSizeBoostForFace(character.face);
      const hairW = Math.max(1, Math.round(pos.width * sizeScale) + hairSizeBoost);
      const hairH = Math.max(1, Math.round(pos.height * sizeScale) + heightAdjust + hairSizeBoost);
      result.push({
        id: `${character.id}-hair`,
        type: "lego",
        name: "Tóc",
        src: character.hair,
        x: pos.x + (pos.width - hairW) / 2 + offsetXExtra,
        y: pos.y + offsetYExtra + faceLiftY,
        width: hairW,
        height: hairH,
        rotation: hairRotation,
        zIndex: partConfig.hair.zIndex,
        isSelected: false,
        layerType: "hair",
        part: "hair",
        characterId: character.id,
        price: Number(character.hair_price || 0),
      });
    }

    return result;
  };

  // ✅ ADD LEGO CHARACTER
  const addCompleteLegoCharacter = () => {
    setActivePanel?.(null);
    setSelectedId?.(null);

    const characterId = `lego-${Date.now()}`;

    const safeX = Math.max(
      0,
      Math.min(
        canvasSize.width / 2 - partConfig.totalWidth / 2,
        canvasSize.width - partConfig.totalWidth,
      ),
    );

    const safeY = Math.max(
      0,
      Math.min(
        canvasSize.height / 2 - 150,
        canvasSize.height - partConfig.totalHeight,
      ),
    );

    const defaultFace = LEGO_CONFIG.faces[0]?.src || null;
    const defaultHair = LEGO_CONFIG.hairs[0]?.src || null;

    const newCharacter = {
      id: characterId,
      x: safeX,
      y: safeY,
      head: LEGO_CONFIG.baseParts.head,
      torso: LEGO_CONFIG.baseParts.torso,
      legs: LEGO_CONFIG.baseParts.legs,

      face: defaultFace,
      hair: defaultHair,
      outfit: null,

      // ✅ giá mặc định (thường = 0 nếu config không set price)
      outfit_price: 0,
      face_price: findPriceBySrc(LEGO_CONFIG.faces, defaultFace),
      hair_price: findPriceBySrc(LEGO_CONFIG.hairs, defaultHair),
    };

    setLegoCharacters((prev) => [...prev, newCharacter]);
    setSelectedCharacterId(characterId);

    // ✅ Hiện outfit selector ngay khi user thêm nhân vật mới
    if (setOutfitSelectorCharId) setOutfitSelectorCharId(characterId);
    if (setShowOutfitSelector) setShowOutfitSelector(true);

    const characterStickers = createStickersFromCharacter(newCharacter);

    setStickers((prev) => {
      const cleared = prev.map((s) =>
        s.characterId ? s : { ...s, isSelected: false },
      );
      return [...cleared, ...characterStickers];
    });
  };

  const moveLegoCharacter = (characterId, deltaX, deltaY) => {
    setLegoCharacters((prev) => {
      const next = prev.map((char) => {
        if (char.id !== characterId) return char;

        let newX = char.x + deltaX;
        let newY = char.y + deltaY;

        const maxX = canvasSize.width - partConfig.totalWidth;
        const maxY = canvasSize.height - partConfig.totalHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        return { ...char, x: newX, y: newY };
      });

      const movedChar = next.find((c) => c.id === characterId);

      if (movedChar) {
        setStickers((prevStickers) =>
          prevStickers.map((sticker) => {
            if (sticker.characterId !== characterId) return sticker;
            const pos = calculateExactPosition(movedChar, sticker.part);
            if (sticker.layerType === "hair") {
              const hairObj = (LEGO_CONFIG?.hairs || []).find((h) => h?.src === sticker.src);
              const offsetYExtra = hairObj?.offsetYExtra || 0;
              const offsetXExtra = hairObj?.offsetXExtra || 0;
              const faceLiftY = getHairLiftOffset(movedChar.face, sticker.src);
              const sizeScale = hairObj?.sizeScale || 1;
              const heightAdjust = Number(hairObj?.heightAdjust || 0);
              const hairRotation = Number(hairObj?.rotation || 0);
              const hairSizeBoost = getHairSizeBoostForFace(movedChar.face);
              const hairW = Math.max(1, Math.round(pos.width * sizeScale) + hairSizeBoost);
              const hairH = Math.max(1, Math.round(pos.height * sizeScale) + heightAdjust + hairSizeBoost);
              return {
                ...sticker,
                x: pos.x + (pos.width - hairW) / 2 + offsetXExtra,
                y: pos.y + offsetYExtra + faceLiftY,
                width: hairW,
                height: hairH,
                rotation: hairRotation,
              };
            }
            if (sticker.layerType === "face") {
              const faceObj = [...(LEGO_CONFIG?.faces || []), ...(LEGO_CONFIG?.facesFemale || [])].find((f) => f?.src === sticker.src);
              const offsetYExtra = faceObj?.offsetYExtra || 0;
              const widthAdjust = Number(faceObj?.widthAdjust || 0);
              const heightAdjust = Number(faceObj?.heightAdjust || 0);
              const faceWidth = Math.max(1, pos.width + widthAdjust);
              const faceHeight = Math.max(1, pos.height + heightAdjust);
              const faceX = pos.x + (pos.width - faceWidth) / 2;
              return { ...sticker, x: faceX, y: pos.y + offsetYExtra + 3, width: faceWidth, height: faceHeight };
            }
            return { ...sticker, x: pos.x, y: pos.y };
          }),
        );
      }

      return next;
    });
  };

  // ✅ outfitSrc + price (price lấy từ config nếu không truyền)
  const updateCharacterOutfit = (
    outfitSrc,
    targetCharacterId = selectedCharacterId,
    passedPrice,
  ) => {
    if (!targetCharacterId) {
      alert("Vui lòng chọn một nhân vật LEGO trước!");
      return;
    }

    const outfitObj =
      (LEGO_CONFIG?.legoColors || []).find((o) => o?.src === outfitSrc) || null;
    const outfitPrice = Number(
      Number.isFinite(Number(passedPrice))
        ? passedPrice
        : outfitObj?.price || 0,
    );

    // 1) lưu vào character (optional, để bạn dùng ở nơi khác)
    setLegoCharacters((prev) =>
      prev.map((char) =>
        char.id === targetCharacterId
          ? {
              ...char,
              outfit: outfitSrc,
              outfit_id: outfitObj?.id || null,
              outfit_price: outfitPrice,
            }
          : char,
      ),
    );

    // 2) ✅ cập nhật sticker torso + gắn price để calcPricing cộng được
    setStickers((prev) =>
      prev.map((s) => {
        if (
          s.characterId === targetCharacterId &&
          s.part === "torso" &&
          s.isBasePart
        ) {
          return {
            ...s,
            src: outfitSrc || s.src,
            price: outfitPrice,
          };
        }
        return s;
      }),
    );
  };
  const updateCharacterPants = (
    pantsSrc,
    targetCharacterId = selectedCharacterId,
    passedPrice,
  ) => {
    if (!targetCharacterId) {
      alert("Vui lòng chọn một nhân vật LEGO trước!");
      return;
    }

    const pantsObj =
      (LEGO_CONFIG?.legoPantsColors || []).find((p) => p?.src === pantsSrc) ||
      null;
    const pantsPrice = Number(
      Number.isFinite(Number(passedPrice)) ? passedPrice : pantsObj?.price || 0,
    );

    // 1) lưu vào character
    setLegoCharacters((prev) =>
      prev.map((char) =>
        char.id === targetCharacterId
          ? {
              ...char,
              legs: pantsSrc,
              pants_id: pantsObj?.id || null,
              pants_price: pantsPrice,
            }
          : char,
      ),
    );

    // 2) cập nhật sticker legs + gắn price
    setStickers((prev) =>
      prev.map((s) => {
        if (
          s.characterId === targetCharacterId &&
          s.part === "legs" &&
          s.isBasePart
        ) {
          return {
            ...s,
            src: pantsSrc || s.src,
            price: pantsPrice,
          };
        }
        return s;
      }),
    );
  };
  const updateCharacterFace = (faceSrc, passedPrice) => {
    if (!selectedCharacterId) {
      alert("Vui lòng chọn một nhân vật LEGO trước!");
      return;
    }

    const faceObj =
      [...(LEGO_CONFIG?.faces || []), ...(LEGO_CONFIG?.facesFemale || [])].find((f) => f?.src === faceSrc) || null;
    const facePrice = Number(
      Number.isFinite(Number(passedPrice)) ? passedPrice : faceObj?.price || 0,
    );

    setLegoCharacters((prev) =>
      prev.map((char) =>
        char.id === selectedCharacterId
          ? { ...char, face: faceSrc, face_price: facePrice }
          : char,
      ),
    );

    setStickers((prev) => {
      const filtered = prev.filter(
        (s) =>
          !(s.characterId === selectedCharacterId && s.layerType === "face"),
      );

      if (faceSrc) {
        const character = getCharacterById(selectedCharacterId) || {
          x: 0,
          y: 0,
        };
        const pos = calculateExactPosition(character, "face");
        const faceOffsetYExtra = faceObj?.offsetYExtra || 0;
        const faceWidthAdjust = Number(faceObj?.widthAdjust || 0);
        const faceHeightAdjust = Number(faceObj?.heightAdjust || 0);
        const faceWidth = Math.max(1, pos.width + faceWidthAdjust);
        const faceHeight = Math.max(1, pos.height + faceHeightAdjust);
        const faceX = pos.x + (pos.width - faceWidth) / 2;
        filtered.push({
          id: `${selectedCharacterId}-face`,
          type: "lego",
          name: "Khuôn mặt",
          src: faceSrc,
          x: faceX,
          y: pos.y + faceOffsetYExtra + 3,
          width: faceWidth,
          height: faceHeight,
          zIndex: partConfig.face.zIndex,
          isSelected: false,
          layerType: "face",
          part: "face",
          characterId: selectedCharacterId,
          price: facePrice, // ✅ QUAN TRỌNG
        });
      }

      const faceLiftY = getHairLiftOffset(faceSrc, null);
      filtered = filtered.map((s) => {
        if (!(s.characterId === selectedCharacterId && s.layerType === "hair")) return s;
        const character = getCharacterById(selectedCharacterId) || { x: 0, y: 0 };
        const pos = calculateExactPosition(character, "hair");
        const hairObj = (LEGO_CONFIG?.hairs || []).find((h) => h?.src === s.src);
        const hairOffsetYExtra = hairObj?.offsetYExtra || 0;
        const hairOffsetXExtra = hairObj?.offsetXExtra || 0;
        const hairSizeScale = hairObj?.sizeScale || 1;
        const hairHeightAdjust = Number(hairObj?.heightAdjust || 0);
        const hairRotation = Number(hairObj?.rotation || 0);
        const hairSizeBoost = getHairSizeBoostForFace(faceSrc);
        const hairW = Math.max(1, Math.round(pos.width * hairSizeScale) + hairSizeBoost);
        const hairH = Math.max(1, Math.round(pos.height * hairSizeScale) + hairHeightAdjust + hairSizeBoost);
        return {
          ...s,
          x: pos.x + (pos.width - hairW) / 2 + hairOffsetXExtra,
          y: pos.y + hairOffsetYExtra + getHairLiftOffset(faceSrc, s.src),
          width: hairW,
          height: hairH,
          rotation: hairRotation,
        };
      });

      return filtered;
    });
  };

  const updateCharacterHair = (hairSrc, passedPrice) => {
    if (!selectedCharacterId) {
      alert("Vui lòng chọn một nhân vật LEGO trước!");
      return;
    }

    const hairObj =
      (LEGO_CONFIG?.hairs || []).find((h) => h?.src === hairSrc) || null;
    const hairPrice = Number(
      Number.isFinite(Number(passedPrice)) ? passedPrice : hairObj?.price || 0,
    );

    setLegoCharacters((prev) =>
      prev.map((char) =>
        char.id === selectedCharacterId
          ? { ...char, hair: hairSrc, hair_price: hairPrice }
          : char,
      ),
    );

    setStickers((prev) => {
      const filtered = prev.filter(
        (s) =>
          !(s.characterId === selectedCharacterId && s.layerType === "hair"),
      );

      if (hairSrc) {
        const character = getCharacterById(selectedCharacterId) || {
          x: 0,
          y: 0,
        };
        const pos = calculateExactPosition(character, "hair");
        const hairOffsetYExtra = hairObj?.offsetYExtra || 0;
        const hairOffsetXExtra = hairObj?.offsetXExtra || 0;
        const faceLiftY = getHairLiftOffset(character.face, hairSrc);
        const hairSizeScale = hairObj?.sizeScale || 1;
        const hairHeightAdjust = Number(hairObj?.heightAdjust || 0);
        const hairRotation = Number(hairObj?.rotation || 0);
        const hairSizeBoost = getHairSizeBoostForFace(character.face);
        const hairW = Math.max(1, Math.round(pos.width * hairSizeScale) + hairSizeBoost);
        const hairH = Math.max(1, Math.round(pos.height * hairSizeScale) + hairHeightAdjust + hairSizeBoost);
        filtered.push({
          id: `${selectedCharacterId}-hair`,
          type: "lego",
          name: "Tóc",
          src: hairSrc,
          x: pos.x + (pos.width - hairW) / 2 + hairOffsetXExtra,
          y: pos.y + hairOffsetYExtra + faceLiftY,
          width: hairW,
          height: hairH,
          rotation: hairRotation,
          zIndex: partConfig.hair.zIndex,
          isSelected: false,
          layerType: "hair",
          part: "hair",
          characterId: selectedCharacterId,
          price: hairPrice, // ✅ QUAN TRỌNG
        });
      }

      return filtered;
    });
  };

  const handleDeleteCharacter = (characterId) => {
    setLegoCharacters((prev) => prev.filter((char) => char.id !== characterId));
    setStickers((prev) =>
      prev.filter((sticker) => sticker.characterId !== characterId),
    );

    if (selectedCharacterId === characterId) setSelectedCharacterId(null);
    setActivePanel?.(null);
    setSelectedId?.(null);
  };

  return {
    calculateExactPosition,
    createStickersFromCharacter,
    addCompleteLegoCharacter,
    moveLegoCharacter,
    updateCharacterOutfit,
    updateCharacterPants,
    updateCharacterFace,
    updateCharacterHair,
    handleDeleteCharacter,
  };
}

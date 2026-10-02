"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useEffect, useState } from "react";
import { useMedia } from "@/lib/useMedia";
import { onAnyVisible } from "./state";

/** Pulisce il canvas a ogni fotogramma, prima che le View disegnino (priorità più bassa). */
function Clearer() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true);
  }, 0);
  return null;
}

/**
 * Un unico <Canvas> condiviso, fisso dietro al contenuto. Le scene sono drei <View>
 * che tracciano il loro elemento DOM. Il render loop si ferma quando nessuna è visibile.
 */
export default function GLStage() {
  const [active, setActive] = useState(false);
  const mobile = useMedia("(max-width: 767px)");
  const dpr: [number, number] = [1, mobile ? 1.5 : 1.75];

  useEffect(() => onAnyVisible(setActive), []);

  return (
    <Canvas
      aria-hidden
      dpr={dpr}
      flat
      linear
      frameloop={active ? "always" : "never"}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", premultipliedAlpha: true }}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100lvh", pointerEvents: "none", zIndex: 0 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Clearer />
      <View.Port />
    </Canvas>
  );
}

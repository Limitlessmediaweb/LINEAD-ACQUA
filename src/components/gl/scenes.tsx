"use client";

// In R3F gli uniform e le texture si aggiornano mutandoli dentro useFrame (60 volte al secondo,
// senza passare da React): è l'idioma raccomandato, quindi la regola di immutabilità qui non si applica.
/* eslint-disable react-hooks/immutability */

import { useFrame } from "@react-three/fiber";
import { View, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { WORDMARK } from "@/lib/wordmark";
import { quadVert, introFrag, heroFrag, diveFrag } from "./shaders";
import { glState, now } from "./state";
import { emit } from "@/lib/bus";
import { useSceneVisibility } from "./useSceneVisibility";

function useQuadMaterial(fragmentShader: string, uniforms: Record<string, THREE.IUniform>, transparent = true) {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: quadVert,
        fragmentShader,
        uniforms,
        transparent,
        depthTest: false,
        depthWrite: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}

function setRes(u: THREE.IUniform<THREE.Vector2>, el: HTMLElement | null) {
  if (el) u.value.set(el.clientWidth || 1, el.clientHeight || 1);
}

/* ───────────── INTRO ───────────── */

function makeWordTexture() {
  const W = 2048;
  const H = Math.ceil((W * WORDMARK.capHeight) / WORDMARK.width);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const s = W / WORDMARK.width;
  ctx.setTransform(s, 0, 0, s, 0, H);
  ctx.fillStyle = "#fff";
  ctx.fill(new Path2D(WORDMARK.d));
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function IntroQuad({ view, word, line }: { view: RefObject<HTMLElement | null>; word: RefObject<HTMLElement | null>; line: RefObject<HTMLElement | null> }) {
  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uWord: { value: null as THREE.Texture | null },
      uWordRect: { value: new THREE.Vector4(0.2, 0.5, 0.6, 0.05) },
      uLineY: { value: 0.5 },
      uWater: { value: 0 },
      uRise: { value: 0 },
      uFade: { value: 1 },
      uPulse: { value: -10 },
    }),
    []
  );
  const mat = useQuadMaterial(introFrag, uniforms);

  useEffect(() => {
    const tex = makeWordTexture();
    uniforms.uWord.value = tex;
    return () => tex.dispose();
  }, [uniforms]);

  useFrame(() => {
    const v = view.current;
    if (!v) return;
    setRes(uniforms.uRes, v);
    const vr = v.getBoundingClientRect();
    const lr = line.current?.getBoundingClientRect();
    const wr = word.current?.getBoundingClientRect();
    if (lr) uniforms.uLineY.value = 1 - (lr.top + lr.height / 2 - vr.top) / vr.height;
    if (wr && lr) {
      // il rettangolo del wordmark "a riposo", con la baseline sulla linea
      uniforms.uWordRect.value.set(
        (wr.left - vr.left) / vr.width,
        uniforms.uLineY.value,
        wr.width / vr.width,
        wr.height / vr.height
      );
    }
    const s = glState.intro;
    uniforms.uTime.value = now();
    uniforms.uWater.value = s.water;
    uniforms.uRise.value = s.rise;
    uniforms.uFade.value = s.fade;
    uniforms.uPulse.value = s.pulse;
  });

  return (
    <mesh frustumCulled={false} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export function IntroWaterView({ word, line }: { word: RefObject<HTMLElement | null>; line: RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  useSceneVisibility("intro", ref);
  return (
    <View ref={ref} index={3} className="absolute inset-0">
      <IntroQuad view={ref} word={word} line={line} />
    </View>
  );
}

/* ───────────── HERO ───────────── */

function HeroQuad({ view }: { view: RefObject<HTMLElement | null> }) {
  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uTex: { value: null as THREE.Texture | null },
      uTexRes: { value: new THREE.Vector2(16, 9) },
      uRipples: { value: Array.from({ length: 12 }, () => new THREE.Vector4(0, 0, -100, 0)) },
      uZoom: { value: 0 },
      uFade: { value: 0 },
    }),
    []
  );
  const mat = useQuadMaterial(heroFrag, uniforms);
  const texRef = useRef<THREE.VideoTexture | null>(null);

  useEffect(() => () => texRef.current?.dispose(), []);

  useFrame(() => {
    const video = glState.hero.video;
    // il <video> può cambiare (16:9 <-> 9:16): la texture va ricreata sul nuovo elemento
    if (texRef.current && texRef.current.image !== video) {
      texRef.current.dispose();
      texRef.current = null;
    }
    if (video && !texRef.current && video.readyState >= 2) {
      const t = new THREE.VideoTexture(video);
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      texRef.current = t;
      uniforms.uTex.value = t;
      emit("gl:heroReady");
    }
    if (video && video.videoWidth) uniforms.uTexRes.value.set(video.videoWidth, video.videoHeight);
    setRes(uniforms.uRes, view.current);
    uniforms.uTime.value = now();
    const h = glState.hero;
    uniforms.uZoom.value = h.zoom;
    uniforms.uFade.value = texRef.current ? h.fade : 0;
    h.ripples.forEach((r, i) => uniforms.uRipples.value[i].set(r[0], r[1], r[2], r[3]));
  });

  return (
    <mesh frustumCulled={false} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export function HeroWaterView() {
  const ref = useRef<HTMLDivElement>(null);
  useSceneVisibility("hero", ref);
  return (
    <View ref={ref} index={1} className="absolute inset-0">
      <HeroQuad view={ref} />
    </View>
  );
}

/* ───────────── DISCESA / RISALITA ───────────── */

function DiveQuad({ view, above, below, mode }: { view: RefObject<HTMLElement | null>; above: string; below: string; mode: "dive" | "rise" }) {
  const [ta, tb] = useTexture([above, below]);
  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uAbove: { value: ta },
      uBelow: { value: tb },
      uAboveRes: { value: new THREE.Vector2(16, 9) },
      uBelowRes: { value: new THREE.Vector2(16, 9) },
      uP: { value: 0 },
    }),
    [ta, tb]
  );
  const mat = useQuadMaterial(diveFrag, uniforms, false);

  useFrame(() => {
    const ia = ta.image as HTMLImageElement | undefined;
    const ib = tb.image as HTMLImageElement | undefined;
    if (ia?.width) uniforms.uAboveRes.value.set(ia.width, ia.height);
    if (ib?.width) uniforms.uBelowRes.value.set(ib.width, ib.height);
    setRes(uniforms.uRes, view.current);
    uniforms.uTime.value = now();
    uniforms.uP.value = mode === "dive" ? glState.dive.progress : 1 - glState.rise.progress;
  });

  return (
    <mesh frustumCulled={false} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export function DiveView({ above, below, mode, onReady }: { above: string; below: string; mode: "dive" | "rise"; onReady?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useSceneVisibility(mode, ref);
  return (
    <View ref={ref} index={2} className="absolute inset-0">
      <Suspense fallback={null}>
        <DiveQuad view={ref} above={above} below={below} mode={mode} />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </View>
  );
}

function ReadySignal({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

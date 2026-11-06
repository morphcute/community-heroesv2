"use client";

import { ArenaCanvas, LogoMedallion, Scene3D, TileModel } from "./Arena3D";

/** Single entry point so the landing page can lazy-load all 3D with one dynamic import. */
export default function Landing3D({ kind }: { kind: string }) {
  if (kind === "canvas") return <ArenaCanvas />;
  if (kind === "medallion") {
    return (
      <Scene3D z={5.4} fov={34}>
        <LogoMedallion />
      </Scene3D>
    );
  }
  return (
    <Scene3D z={7} fov={30}>
      <TileModel variant={kind} />
    </Scene3D>
  );
}

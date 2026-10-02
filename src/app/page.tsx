import { FilmShell } from "@/components/home/FilmShell";
import { Intro } from "@/components/home/Intro";
import { Hero } from "@/components/home/Hero";
import { ChapterLine } from "@/components/home/ChapterLine";
import { ChapterDay } from "@/components/home/ChapterDay";
import { ChapterTour } from "@/components/home/ChapterTour";
import { ChapterMaterials } from "@/components/home/ChapterMaterials";
import { ChapterFleet } from "@/components/home/ChapterFleet";
import { ChapterConfigurator } from "@/components/home/ChapterConfigurator";
import { ChapterSurface } from "@/components/home/ChapterSurface";
import { Footer } from "@/components/global/Footer";

export default function Home() {
  return (
    <>
      <FilmShell />
      <Intro />
      <Hero />
      <ChapterLine />
      <ChapterDay />
      <ChapterTour />
      <ChapterMaterials />
      <ChapterFleet />
      <ChapterConfigurator />
      <ChapterSurface />
      <Footer rise />
    </>
  );
}

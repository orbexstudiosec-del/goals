import Image from "next/image";

/** Escena del hero: la imagen compuesta (public/img/hero.png). */
export function HeroScene() {
  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      {/* glow detrás */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-brand-300/40 to-accent/40 blur-3xl md:h-96 md:w-96" />

      <Image
        src="/img/hero.png"
        alt="Goals Ec — memes, turismo, cultura y comida de Ecuador"
        width={1209}
        height={879}
        priority
        sizes="(max-width: 1024px) 100vw, 680px"
        className="animate-float-hero h-auto w-full drop-shadow-2xl"
      />
    </div>
  );
}

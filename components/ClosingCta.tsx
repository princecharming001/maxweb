import { DEMO_URL, Display, GlassButton } from "./ui";
import Reveal from "./Reveal";

export default function ClosingCta() {
  return (
    <section className="bg-paper relative mx-auto mb-12 w-[calc(100%-2rem)] max-w-[1200px] overflow-hidden rounded-xl text-center sm:mb-20 sm:w-[calc(100%-3rem)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(https://www.tryclean.ai/cards/stop-bg.jpg)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-black/10" />

      <Reveal className="relative z-10 flex flex-col items-center px-6 py-28">
        <h2 className="font-display text-[clamp(50px,8vw,104px)] leading-[0.95] tracking-[-0.02em] text-white">
          <Display lines={[{ text: "Stop hunting." }]} />
          <br />
          <Display
            lines={[{ text: "Start" }, { text: "closing.", italic: true }]}
          />
        </h2>
        <p className="font-mona mt-6 max-w-[44ch] text-[13px] leading-relaxed text-white/90 sm:text-[19px]">
          Let Clean do the heavy-lifting, so you can focus on what matters:
          building, closing deals, and scaling.
        </p>
        <div className="mt-9">
          <GlassButton href={DEMO_URL}>Get started</GlassButton>
        </div>
      </Reveal>
    </section>
  );
}

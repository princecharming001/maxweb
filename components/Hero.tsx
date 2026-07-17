import { DEMO_URL, Display, GlassButton } from "./ui";
import ProductMock from "./ProductMock";

export default function Hero() {
  return (
    <section className="-mt-[68px] px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="relative overflow-hidden rounded-2xl">
        {/* Three stacked layers, matching the target exactly: photograph,
            a flat 25% scrim for legibility, then a gradient that dissolves
            the image into the paper. */}
        <div
          className="absolute inset-x-0 top-0 h-[820px] bg-cover bg-top"
          style={{ backgroundImage: "url(https://www.tryclean.ai/mount.jpg)" }}
        />
        <div className="absolute inset-x-0 top-0 h-[820px] bg-black/25" />
        <div className="absolute inset-x-0 top-[560px] h-[260px] bg-gradient-to-b from-transparent to-[#0b0d12]" />
        <div className="absolute inset-x-0 top-[820px] bottom-0 bg-[#0b0d12]" />

        <div className="relative mx-auto w-full max-w-[1320px] px-6 pt-[150px] pb-20 text-center sm:pt-[175px] sm:pb-24">
          <h1 className="font-display text-ink mx-auto mt-7 max-w-[18ch] text-[clamp(48px,8vw,104px)] leading-[1.0] tracking-[-0.02em]">
            <Display lines={[{ text: "Quality leads." }]} />
            <br />
            <Display lines={[{ text: "Right time.", italic: true }]} />
          </h1>

          <div className="mt-6 flex w-full justify-center sm:mt-8">
            <GlassButton href={DEMO_URL}>Get started</GlassButton>
          </div>

          {/* text-left resets the hero's centring for the UI mock. */}
          <div className="relative z-10 mx-auto mt-16 max-w-[1120px] text-left">
            <ProductMock />
          </div>
        </div>
      </div>
    </section>
  );
}

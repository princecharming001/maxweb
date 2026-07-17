import TraceNav from "@/components/trace/TraceNav";
import TraceHero from "@/components/trace/TraceHero";
import TraceFeatures from "@/components/trace/TraceFeatures";
import TraceManifesto from "@/components/trace/TraceManifesto";
import TraceCta from "@/components/trace/TraceCta";
import TraceFooter from "@/components/trace/TraceFooter";

export default function LandingPage() {
  return (
    <>
      <TraceNav />
      <main>
        <TraceHero />
        <TraceFeatures />
        <TraceManifesto />
        <TraceCta />
      </main>
      <TraceFooter />
    </>
  );
}

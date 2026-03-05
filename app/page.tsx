import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SMSPreview from "@/components/SMSPreview";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import WaitlistCTA from "@/components/WaitlistCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SMSPreview />
        <HowItWorks />
        <Features />
        <WaitlistCTA />
      </main>
      <Footer />
    </>
  );
}

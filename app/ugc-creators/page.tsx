import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UgcCreatorForm from "@/components/UgcCreatorForm";

export const metadata = {
  title: "UGC Creator Application — Max",
  description:
    "Apply to create user-generated content for Max. Share your socials and experience.",
};

export default function UgcCreatorsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-8rem)] pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[13px] font-medium text-accent tracking-wide uppercase mb-2">
              Creators
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              UGC Application
            </h1>
            <p className="mt-3 text-muted text-[15px] leading-relaxed max-w-md mx-auto">
              you post videos. we pay money.
            </p>
          </div>
          <UgcCreatorForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

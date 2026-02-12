import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import ProblemSection from "../components/landing/ProblemSection";
import WhyFailSection from "../components/landing/WhyFailSection";
import TimelineSection from "../components/landing/TimelineSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import USPSection from "../components/landing/USPSection";
import TargetAudience from "../components/landing/TargetAudience";
import RevenueSection from "../components/landing/RevenueSection";
import TechStack from "../components/landing/TechStack";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-midnight-900 text-slate-100">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <WhyFailSection />
      <TimelineSection />
      <FeaturesSection />
      <USPSection />
      <TargetAudience />
      <RevenueSection />
      <TechStack />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;

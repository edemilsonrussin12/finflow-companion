import HeroSection from '@/components/landing/HeroSection';
import FinancialHealthQuiz from '@/components/landing/FinancialHealthQuiz';
import AppDemo from '@/components/landing/AppDemo';
import CourseSection from '@/components/landing/CourseSection';
import HowItWorks from '@/components/landing/HowItWorks';
import BenefitsSection from '@/components/landing/BenefitsSection';
import WealthSimulatorSection from '@/components/landing/WealthSimulatorSection';
import SocialProof from '@/components/landing/SocialProof';
import SecuritySection from '@/components/landing/SecuritySection';
import FAQSection from '@/components/landing/FAQSection';
import FinalCTA from '@/components/landing/FinalCTA';

export default function Aterrissagem() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald/5 rounded-full blur-3xl" />
      </div>

      <HeroSection />
      <FinancialHealthQuiz />
      <AppDemo />
      <CourseSection />
      <HowItWorks />
      <BenefitsSection />
      <WealthSimulatorSection />
      <SocialProof />
      <SecuritySection />
      <FAQSection />
      <FinalCTA />

      <footer className="py-10 px-6 text-center border-t border-border">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} FinControl. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
import { useEffect, useState } from 'react';
import iconFinControl from '@/assets/icon-fincontrol.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-[#0B0F19] flex flex-col items-center justify-center z-50 opacity-0 transition-opacity duration-300 pointer-events-none">
        <img src={iconFinControl} alt="FinControl" className="w-24 h-24 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-2">FinControl</h1>
        <p className="text-lg text-slate-300">Controle inteligente do seu dinheiro</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0B0F19] flex flex-col items-center justify-center z-50 transition-opacity duration-300">
      <img src={iconFinControl} alt="FinControl" className="w-24 h-24 mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold text-white mb-2">FinControl</h1>
      <p className="text-lg text-slate-300">Controle inteligente do seu dinheiro</p>
    </div>
  );
}
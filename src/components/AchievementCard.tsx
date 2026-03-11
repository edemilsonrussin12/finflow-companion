import { useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Share2, MessageCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Achievement } from '@/hooks/useAchievements';

interface Props {
  achievement: Achievement;
  referralCode?: string;
}

export default function AchievementCard({ achievement, referralCode }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getCanvas = useCallback(async () => {
    if (!cardRef.current) return null;
    return html2canvas(cardRef.current, {
      backgroundColor: '#0b1120',
      scale: 2,
      useCORS: true,
    });
  }, []);

  const shareUrl = referralCode
    ? `https://fincontrolapp.com/cadastro?ref=${referralCode}`
    : 'https://fincontrolapp.com';

  const shareText = `Estou organizando minhas finanças com FinControl.\n\nExperimente também:\n${shareUrl}`;

  async function downloadImage() {
    const canvas = await getCanvas();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `fincontrol-${achievement.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast({ title: 'Imagem salva!' });
  }

  async function shareWhatsApp() {
    const text = encodeURIComponent(
      `${achievement.title}\n${achievement.stat ? achievement.stat + '\n' : ''}\n${shareText}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  async function shareNative() {
    const canvas = await getCanvas();
    if (!canvas) {
      // Fallback: text only
      if (navigator.share) {
        await navigator.share({ title: 'FinControl', text: shareText, url: shareUrl });
      }
      return;
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `fincontrol-${achievement.id}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ title: 'FinControl', text: shareText, files: [file] });
        } catch { /* user cancelled */ }
      } else if (navigator.share) {
        try {
          await navigator.share({ title: 'FinControl', text: shareText, url: shareUrl });
        } catch { /* user cancelled */ }
      } else {
        downloadImage();
      }
    }, 'image/png');
  }

  return (
    <div className="space-y-3">
      {/* The visual card */}
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl p-6 ${
          achievement.unlocked
            ? 'bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/30'
            : 'bg-card border border-border/50 opacity-60'
        }`}
      >
        {/* Decorative circles */}
        {achievement.unlocked && (
          <>
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-accent/10 blur-xl" />
          </>
        )}

        <div className="relative z-10 space-y-3">
          <div className="text-3xl">{achievement.icon}</div>
          <h3 className="text-base font-bold text-foreground">{achievement.title}</h3>
          {achievement.stat && (
            <p className="text-2xl font-extrabold text-primary">{achievement.stat}</p>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {achievement.description}
          </p>

          {/* Branding footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <span className="text-[10px] font-semibold text-primary tracking-wide">FINCONTROL</span>
            <span className="text-[10px] text-muted-foreground">fincontrolapp.com</span>
          </div>
        </div>
      </div>

      {/* Share actions — only for unlocked */}
      {achievement.unlocked && (
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={shareWhatsApp} size="sm" className="bg-income hover:bg-income/90 text-income-foreground gap-1.5 text-xs">
            <MessageCircle size={14} />
            WhatsApp
          </Button>
          <Button onClick={shareNative} size="sm" variant="outline" className="gap-1.5 text-xs">
            <Share2 size={14} />
            Compartilhar
          </Button>
          <Button onClick={downloadImage} size="sm" variant="outline" className="gap-1.5 text-xs">
            <Download size={14} />
            Salvar
          </Button>
        </div>
      )}
    </div>
  );
}

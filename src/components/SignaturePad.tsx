import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';

interface Props {
  onSave: (dataUrl: string) => void;
  initialImage?: string;
}

export default function SignaturePad({ onSave, initialImage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  // Stable canvas init — only runs once on mount
  const initialImageRef = useRef(initialImage);
  initialImageRef.current = initialImage;
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use fixed pixel dimensions to avoid mobile resize issues
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(rect.width, 280);
    const h = Math.max(rect.height, 128);
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1e1e1e';
    setCanvasReady(true);

    if (initialImageRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        setHasContent(true);
      };
      img.onerror = () => {
        // Fallback: signature image failed to load, canvas stays blank
        console.warn('Signature image failed to load');
      };
      img.src = initialImageRef.current;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPos(e: React.TouchEvent | React.MouseEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    setDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    if (!drawing) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasContent(true);
  }

  function endDraw() {
    if (!drawing) return;
    setDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasContent) {
      onSave(canvas.toDataURL('image/png'));
    }
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasContent(false);
  }

  return (
    <div className="space-y-2">
      <div className="relative border border-border rounded-xl overflow-hidden bg-background">
        <canvas
          ref={canvasRef}
          className="w-full h-32 cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <p className="absolute bottom-1 left-2 text-[10px] text-muted-foreground pointer-events-none select-none">
          Desenhe sua assinatura aqui
        </p>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={clear} className="gap-1.5 text-xs">
        <Eraser size={14} /> Limpar assinatura
      </Button>
    </div>
  );
}

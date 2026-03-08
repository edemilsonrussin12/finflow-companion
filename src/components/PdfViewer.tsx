import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';

interface PdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function PdfViewer({ url, title, onClose }: PdfViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [loadError, setLoadError] = useState(false);

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const resetZoom = () => setZoom(100);

  // Build absolute URL to bypass any service worker interception
  const absoluteUrl = `${window.location.origin}${url}`;

  const openInNewTab = () => {
    window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
        <div className="min-w-0 flex-1 mr-3">
          <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openInNewTab} title="Abrir em nova aba">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut} disabled={zoom <= 50}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs min-w-[3rem]" onClick={resetZoom}>
            {zoom}%
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn} disabled={zoom >= 200}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto">
        {loadError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
            <p className="text-sm text-muted-foreground">Não foi possível carregar o PDF no app.</p>
            <Button onClick={openInNewTab} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Abrir PDF em nova aba
            </Button>
          </div>
        ) : (
          <div
            className="min-h-full flex justify-center p-4"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <iframe
              src={`${absoluteUrl}#toolbar=0&navpanes=0`}
              className="w-full max-w-3xl rounded-lg border border-border bg-white"
              style={{ height: '100vh', minHeight: '600px' }}
              title={title}
              onError={() => setLoadError(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

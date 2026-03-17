import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Download, Loader2 } from 'lucide-react';

interface PdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function PdfViewer({ url, title, onClose }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState<'direct' | 'google'>('direct');

  // Build absolute URL
  const absoluteUrl = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;

  const directUrl = `${absoluteUrl}#toolbar=1&navpanes=0`;
  const googleUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(absoluteUrl)}`;

  const iframeSrc = attempt === 'direct' ? directUrl : googleUrl;

  const openInNewTab = () => {
    window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
  };

  const downloadPdf = () => {
    const a = document.createElement('a');
    a.href = absoluteUrl;
    a.download = title + '.pdf';
    a.click();
  };

  // Auto-timeout: if direct fails, try google viewer; if both fail, show error
  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    const timer = setTimeout(() => {
      if (attempt === 'direct') {
        setAttempt('google');
      } else {
        setLoadError(true);
        setLoading(false);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [attempt]);

  const handleIframeLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const retry = () => {
    setAttempt('direct');
    setLoadError(false);
    setLoading(true);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
        <div className="min-w-0 flex-1 mr-3">
          <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={downloadPdf} title="Baixar PDF">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openInNewTab} title="Abrir em nova aba">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto relative">
        {loading && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando PDF...</p>
          </div>
        )}

        {loadError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
            <p className="text-sm text-muted-foreground">Não foi possível carregar o PDF no app.</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button onClick={openInNewTab} className="gap-2 w-full">
                <ExternalLink className="h-4 w-4" />
                Abrir PDF em nova aba
              </Button>
              <Button variant="outline" onClick={downloadPdf} className="gap-2 w-full">
                <Download className="h-4 w-4" />
                Baixar PDF
              </Button>
              <Button variant="ghost" onClick={retry} className="gap-2 w-full">
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-full flex justify-center p-2">
            <iframe
              key={attempt}
              src={iframeSrc}
              className="w-full max-w-3xl rounded-lg border border-border bg-white"
              style={{ height: '100vh', minHeight: '600px' }}
              title={title}
              onLoad={handleIframeLoad}
              onError={() => { setLoadError(true); setLoading(false); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

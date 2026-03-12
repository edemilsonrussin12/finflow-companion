import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, Building2, Trash2 } from 'lucide-react';
import SignaturePad from '@/components/SignaturePad';

interface BusinessProfile {
  business_name: string;
  phone: string;
  email: string;
  address: string;
  logo_url: string;
  signature_url: string;
}

export default function PerfilProfissional() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<BusinessProfile>({
    business_name: '', phone: '', email: '', address: '', logo_url: '', signature_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [exists, setExists] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('business_profile')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        business_name: (data as any).business_name ?? '',
        phone: (data as any).phone ?? '',
        email: (data as any).email ?? '',
        address: (data as any).address ?? '',
        logo_url: (data as any).logo_url ?? '',
        signature_url: (data as any).signature_url ?? '',
      });
      setExists(true);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  function update(field: keyof BusinessProfile, value: string) {
    setProfile(p => ({ ...p, [field]: value }));
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !e.target.files?.[0]) return;
    setUploadingLogo(true);
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `${user.id}/logo.${ext}`;

    const { error } = await supabase.storage
      .from('business-assets')
      .upload(path, file, { upsert: true });

    if (error) {
      toast({ title: 'Erro ao enviar logo', description: error.message, variant: 'destructive' });
      setUploadingLogo(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('business-assets').getPublicUrl(path);
    // Add cache buster
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    update('logo_url', url);
    setUploadingLogo(false);
    toast({ title: 'Logo enviado!' });
  }

  async function removeLogo() {
    if (!user) return;
    // Try to delete from storage
    await supabase.storage.from('business-assets').remove([`${user.id}/logo.png`, `${user.id}/logo.jpg`, `${user.id}/logo.jpeg`, `${user.id}/logo.webp`]);
    update('logo_url', '');
    toast({ title: 'Logo removido' });
  }

  async function saveSignature(dataUrl: string) {
    if (!user) return;
    // Convert data URL to blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const path = `${user.id}/signature.png`;

    await supabase.storage
      .from('business-assets')
      .upload(path, blob, { upsert: true, contentType: 'image/png' });

    const { data: urlData } = supabase.storage.from('business-assets').getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    update('signature_url', url);
  }

  async function save() {
    if (!user) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      business_name: profile.business_name,
      phone: profile.phone,
      email: profile.email,
      address: profile.address,
      logo_url: profile.logo_url,
      signature_url: profile.signature_url,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (exists) {
      ({ error } = await supabase
        .from('business_profile')
        .update(payload as any)
        .eq('user_id', user.id));
    } else {
      ({ error } = await supabase
        .from('business_profile')
        .insert(payload as any));
      if (!error) setExists(true);
    }

    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Perfil profissional salvo!' });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Building2 size={24} className="text-primary" />
        <div>
          <h1 className="text-lg font-bold">Perfil Profissional</h1>
          <p className="text-xs text-muted-foreground">Dados usados automaticamente nos orçamentos e PDFs</p>
        </div>
      </div>

      {/* Logo */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <label className="text-xs font-medium text-muted-foreground">Logo da empresa</label>
        {profile.logo_url ? (
          <div className="flex items-center gap-4">
            <img
              src={profile.logo_url}
              alt="Logo"
              className="w-20 h-20 object-contain rounded-xl border border-border bg-background"
            />
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer">
                <span className="text-xs text-primary underline">Trocar logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
              </label>
              <button onClick={removeLogo} className="text-xs text-destructive flex items-center gap-1">
                <Trash2 size={12} /> Remover
              </button>
            </div>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors">
            {uploadingLogo ? (
              <Loader2 size={20} className="animate-spin text-primary" />
            ) : (
              <>
                <Upload size={20} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Clique para enviar seu logo</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
          </label>
        )}
      </div>

      {/* Business Info */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Nome da empresa / profissional</label>
          <Input value={profile.business_name} onChange={e => update('business_name', e.target.value)} placeholder="Ex: João Silva Serviços" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Telefone</label>
          <Input value={profile.phone} onChange={e => update('phone', e.target.value)} placeholder="Ex: (11) 99999-0000" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Email profissional</label>
          <Input type="email" value={profile.email} onChange={e => update('email', e.target.value)} placeholder="Ex: contato@empresa.com" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Endereço</label>
          <Textarea value={profile.address} onChange={e => update('address', e.target.value)} placeholder="Ex: Rua das Flores, 123 - São Paulo/SP" rows={2} />
        </div>
      </div>

      {/* Signature */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <label className="text-xs font-medium text-muted-foreground">Assinatura digital</label>
        <SignaturePad onSave={saveSignature} initialImage={profile.signature_url || undefined} />
      </div>

      {/* Save */}
      <Button onClick={save} disabled={saving} className="w-full gap-2">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Salvar Perfil Profissional
      </Button>
    </div>
  );
}

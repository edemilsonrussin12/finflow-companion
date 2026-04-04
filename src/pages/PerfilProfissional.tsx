import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Save, Upload, Building2, Trash2,
  Trophy, Gift, Crown, Settings, Shield, ChevronRight, UserCircle,
} from 'lucide-react';
import SignaturePad from '@/components/SignaturePad';

interface BusinessProfile {
  business_name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  logo_url: string;
  signature_url: string;
}

const menuItems = [
  { path: '/conquistas', icon: Trophy, label: 'Conquistas', description: 'Suas conquistas financeiras' },
  { path: '/convites', icon: Gift, label: 'Indicações', description: 'Convide amigos e ganhe recompensas' },
  { path: '/minha-assinatura', icon: Crown, label: 'Minha Assinatura', description: 'Gerencie seu plano' },
  { path: '/configuracoes', icon: Settings, label: 'Configurações', description: 'Preferências do app' },
];

const adminItem = { path: '/admin', icon: Shield, label: 'Painel Admin', description: 'Gerenciar usuários e sistema' };

export default function PerfilProfissional() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [profile, setProfile] = useState<BusinessProfile>({
    business_name: '', cnpj: '', phone: '', email: '', address: '', logo_url: '', signature_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [exists, setExists] = useState(false);

  // User display name
  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const allMenuItems = isAdmin ? [...menuItems, adminItem] : menuItems;

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Load business profile and display name in parallel
    const [bizRes, profileRes] = await Promise.all([
      supabase.from('business_profile').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
    ]);

    if (bizRes.data) {
      const data = bizRes.data as any;
      setProfile({
        business_name: data.business_name ?? '',
        cnpj: data.cnpj ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        logo_url: data.logo_url ?? '',
        signature_url: data.signature_url ?? '',
      });
      setExists(true);
    }

    setDisplayName(profileRes.data?.display_name || '');
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  function update(field: keyof BusinessProfile, value: string) {
    setProfile(p => ({ ...p, [field]: value }));
  }

  async function saveDisplayName() {
    if (!user || !displayName.trim()) return;
    setSavingName(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id);

    setSavingName(false);
    if (error) {
      toast({ title: 'Erro ao salvar nome', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Nome atualizado!' });
    }
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

    // Use longer-lived signed URL (24h) to avoid disappearing logo
    const { data: signedData } = await supabase.storage.from('business-assets').createSignedUrl(path, 86400);
    const url = signedData?.signedUrl || '';
    update('logo_url', url);
    setUploadingLogo(false);
    toast({ title: 'Logo enviado!' });
  }

  async function removeLogo() {
    if (!user) return;
    await supabase.storage.from('business-assets').remove([`${user.id}/logo.png`, `${user.id}/logo.jpg`, `${user.id}/logo.jpeg`, `${user.id}/logo.webp`]);
    update('logo_url', '');
    toast({ title: 'Logo removido' });
  }

  async function saveSignature(dataUrl: string) {
    if (!user) return;
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const path = `${user.id}/signature.png`;

    await supabase.storage
      .from('business-assets')
      .upload(path, blob, { upsert: true, contentType: 'image/png' });

    const { data: signedData } = await supabase.storage.from('business-assets').createSignedUrl(path, 3600);
    const url = signedData?.signedUrl || '';
    update('signature_url', url);
  }

  async function save() {
    if (!user) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      business_name: profile.business_name,
      cnpj: profile.cnpj,
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
    <div className="page-container pt-6 pb-24 space-y-5 animate-fade-in">
      {/* Quick Menu */}
      <div className="glass rounded-2xl overflow-hidden divide-y divide-border/50">
        {allMenuItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-accent/50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      {/* Display Name Section */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <UserCircle size={20} className="text-primary" />
          <div>
            <label className="text-xs font-medium text-foreground">Seu nome</label>
            <p className="text-[10px] text-muted-foreground">Exibido no dashboard e em todo o app</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Ex: João da Silva"
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={saveDisplayName}
            disabled={savingName || !displayName.trim()}
            className="shrink-0"
          >
            {savingName ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          </Button>
        </div>
        {!displayName.trim() && (
          <p className="text-[10px] text-yellow-500">⚠️ Adicione seu nome para uma experiência personalizada</p>
        )}
      </div>

      {/* Business Profile Header */}
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
          <label className="text-xs font-medium text-muted-foreground">CNPJ (opcional)</label>
          <Input
            value={profile.cnpj}
            onChange={e => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
              const formatted = digits
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2')
                .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, '$1/$2')
                .replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/, '$1-$2');
              update('cnpj', formatted);
            }}
            placeholder="00.000.000/0000-00"
            maxLength={18}
          />
          {profile.cnpj && profile.cnpj.replace(/\D/g, '').length > 0 && profile.cnpj.replace(/\D/g, '').length < 14 && (
            <p className="text-[10px] text-yellow-500 mt-1">CNPJ incompleto</p>
          )}
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

import { Star } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';

const testimonials = [
  {
    name: "Ana Lima",
    role: "Empreendedora",
    text: "Em 3 meses com o FinControl consegui entender meus gastos e criar minha reserva de emergência. Incrível!",
    avatar: "AL",
    rating: 5,
  },
  {
    name: "Carlos Mendes",
    role: "Desenvolvedor",
    text: "Finalmente consigo ver minha evolução financeira mês a mês. O painel é simplesmente fantástico.",
    avatar: "CM",
    rating: 5,
  },
  {
    name: "Juliana Costa",
    role: "Professora",
    text: "Uso há 2 meses e já economizei R$ 800 que gastava sem perceber. Recomendo demais!",
    avatar: "JC",
    rating: 5,
  },
];

function StatCounter({ end, suffix = '', label, format = true }: { 
  end: number, 
  suffix?: string, 
  label: string,
  format?: boolean 
}) {
  const { ref, inView } = useInView();
  const count = useCountUp(end, 2000, inView);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-extrabold text-primary mb-1">
        {format ? count.toLocaleString('pt-BR') : count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default function SocialProof() {
  const { ref, inView } = useInView();

  return (
    <section className="py-20 px-6">
      <div ref={ref} className={`max-w-6xl mx-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Stats */}
        <div className="glass rounded-3xl p-10 mb-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter end={10000} suffix="+" label="Usuários ativos" />
          <StatCounter end={48} suffix="M+" label="Em transações processadas" format={false} />
          <StatCounter end={98} suffix="%" label="Satisfação dos usuários" format={false} />
          <StatCounter end={3200} suffix="+" label="Metas alcançadas" />
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Milhares de pessoas já estão{' '}
            <span className="text-emerald">transformando suas finanças</span>
          </h2>
          <p className="text-muted-foreground">Veja o que nossos usuários estão dizendo</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div 
              key={i} 
              className="glass p-6 rounded-2xl space-y-4 hover-scale animate-fade-in" 
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { useInView } from '@/hooks/useInView';
import { Shield, Lock, Eye, Server } from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'Criptografia de ponta',
    description: 'Seus dados são criptografados em trânsito e em repouso',
  },
  {
    icon: Shield,
    title: 'Proteção de dados',
    description: 'Seguimos as melhores práticas de segurança do mercado',
  },
  {
    icon: Eye,
    title: 'Privacidade garantida',
    description: 'Seus dados financeiros nunca são compartilhados',
  },
  {
    icon: Server,
    title: 'Infraestrutura segura',
    description: 'Servidores com certificações de segurança',
  },
];

export default function SecuritySection() {
  const { ref, inView } = useInView();

  return (
    <section className="py-20 px-6">
      <div ref={ref} className={`max-w-5xl mx-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="glass rounded-3xl p-10 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald to-primary flex items-center justify-center">
            <Shield size={40} className="text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Seus dados estão{' '}
            <span className="text-emerald">protegidos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            Utilizamos tecnologia de ponta para garantir que suas informações financeiras 
            estejam sempre seguras e privadas.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {securityFeatures.map((feature, i) => (
              <div 
                key={i}
                className="p-5 rounded-2xl bg-background/50 hover-scale"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald/20 flex items-center justify-center">
                  <feature.icon size={24} className="text-emerald" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

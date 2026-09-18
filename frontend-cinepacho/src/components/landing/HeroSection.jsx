//Título principal y descripcion - Hero Section de una página
import Container from '../layout/Container';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
    const { t } = useTranslation();
    
    return (
        <section className="relative min-h-[85vh] w-full flex items-center bg-background overflow-hidden">
        {/*Background con Overlay semántico*/}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent z-10" />
            <img 
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover opacity-40"
            alt="Cine Pacho Hero"
            />
        </div>

        <Container className="relative z-20">
            <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/20 border border-primary-container/30 text-primary-fixed font-label text-xs uppercase tracking-[0.2em] flex-wrap">
                <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="whitespace-nowrap">{t('hero.badge')}</span>
            </div>
            
            <h1 className="font-headline text-5xl md:text-7xl lg:text-9xl font-black uppercase leading-[0.9] md:leading-[0.85] tracking-tighter text-on-surface break-words">
                {t('hero.mainTitle')} <br />
                <span className="text-primary italic">{t('hero.mainTitleHighlight')}</span>
            </h1>
            
            <p className="font-body text-base md:text-lg text-on-surface-variant max-w-lg leading-relaxed">
                {t('hero.description')}
            </p>

            </div>
        </Container>
        </section>
    );
}
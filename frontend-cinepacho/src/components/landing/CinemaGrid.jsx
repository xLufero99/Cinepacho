//Contenedor de las salas
import Container from '../layout/Container';
import SectionTitle from '../ui/SectionTitle';
import CinemaCard from '../common/CinemaCard';
import { useTranslation } from 'react-i18next';

export default function CinemaGrid({ sedes: sedesProp, onSelectHeadquarters, selectedHeadquarters }) {
    const { t } = useTranslation();
    const sedesToUse = sedesProp || [];
    
    return (
        <section id="sedes" className="py-20 bg-background">
        <Container>
            <SectionTitle 
            subtitle={t('cinema.subtitle')}
            className="mb-12"
            >
            {t('cinema.title')} <span className="text-primary uppercase">{t('cinema.titleHighlight')}</span>
            </SectionTitle>

            {/*Grid responsive*/}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sedesToUse.map((sede) => (
                <CinemaCard 
                key={sede.id} 
                sede={sede} 
                className={`bg-surface-container-high hover:bg-surface-bright ${
                    selectedHeadquarters?.id === sede.id ? 'ring-2 ring-primary' : ''
                }`}
                onSelectHeadquarters={onSelectHeadquarters}
                />
            ))}
            </div>
        </Container>
        </section>
    );
}
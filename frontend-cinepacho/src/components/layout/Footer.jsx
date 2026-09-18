//Footer de la página
import Container from './Container';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/10 pt-20 pb-10 mt-20">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/*Columna de Marca*/}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl font-black">movie_filter</span>
              <span className="font-headline text-xl font-black tracking-tighter uppercase">{t('footer.brand')}</span>
            </div>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          {/*Columna: Programación*/}
          <div>
            <h4 className="font-label text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-8">{t('footer.programming')}</h4>
            <ul className="space-y-4 font-body text-sm text-on-surface-variant">
              <li><a href="#" className="hover:text-on-surface transition-colors italic">{t('footer.weeklyPremieres')}</a></li>
              <li><a href="#" className="hover:text-on-surface transition-colors">{t('footer.exclusivePreSales')}</a></li>
              <li><a href="#" className="hover:text-on-surface transition-colors">{t('footer.imaxVipFormats')}</a></li>
            </ul>
          </div>

          {/*Columna: Corporativo*/}
          <div>
            <h4 className="font-label text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-8">{t('footer.corporate')}</h4>
            <ul className="space-y-4 font-body text-sm text-on-surface-variant">
              <li><a href="#" className="hover:text-on-surface transition-colors">{t('footer.ourLocations')}</a></li>
              <li><a href="#" className="hover:text-on-surface transition-colors">{t('footer.employeePortal')}</a></li>
              <li><a href="#" className="hover:text-on-surface transition-colors">{t('footer.termsConditions')}</a></li>
            </ul>
          </div>

          {/*Columna: Social*/}
          <div>
            <h4 className="font-label text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-8">{t('footer.social')}</h4>
            <div className="flex gap-4">
              {['facebook', 'instaphoto', 'X'].map((icon, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-300 shadow-sm"
                >
                  <span className="material-symbols-outlined text-xl">
                    {icon === 'instaphoto' ? 'photo_camera' : icon === 'X' ? 'close' : icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/*Marca "registrada" xD*/}
        <div className="pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <div className="flex gap-4 text-primary opacity-50">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span className="material-symbols-outlined text-sm">payments</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
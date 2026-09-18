import NavBar from './NavBar';
import Footer from './Footer';
import Container from './Container';

export default function MainLayout({ children, user, onSearch, showFooter = true }) {
    return (
        <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col selection:bg-primary/30">
        {/*Pasar el usuario a la NavBar para manejar puntos y roles*/}
        <NavBar  onSearch={onSearch} />
        
        <main className="flex-grow flex flex-col pt-20 min-h-0"> 
            <div className="flex-grow">
                {children}
            </div>
        </main>

        {showFooter && <Footer />}
        </div>
    );
}
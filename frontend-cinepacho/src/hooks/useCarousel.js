//Lógica del movimiento del carrusel (avanzar, retroceder, ir a uno específico)
import { useState, useEffect, useCallback } from 'react';

export default function useCarousel(length, interval = 5000) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % length);
    }, [length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + length) % length);
    }, [length]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (interval <= 0) return;
        const timer = setInterval(nextSlide, interval);
        return () => clearInterval(timer);
    }, [nextSlide, interval]);

    return { currentIndex, nextSlide, prevSlide, goToSlide };
}
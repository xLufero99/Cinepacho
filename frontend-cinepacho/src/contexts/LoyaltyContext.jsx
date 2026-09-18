import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getLoyaltyConfig } from '../services/loyaltyService';

const LoyaltyContext = createContext();

export function LoyaltyProvider({ children }) {
  const [userPoints, setUserPoints] = useState(0);
  const [freeTickets, setFreeTickets] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Load loyalty config from service
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getLoyaltyConfig();
        setLoyaltyConfig(config);
      } catch (error) {
        console.error('Error loading loyalty config:', error);
        // Fallback to default config if service fails
        setLoyaltyConfig({
          puntos_boletas: 10,
          puntos_snacks: 5,
          puntos_redencion: 100,
          vigencia_boleta_gratis_meses: 6,
          tipo_boleta_gratis: 'general',
        });
      } finally {
        setConfigLoading(false);
      }
    };
    loadConfig();
  }, []);

  // Load loyalty data from localStorage on mount
  useEffect(() => {
    try {
      const savedPoints = localStorage.getItem('userPoints');
      const savedFreeTickets = localStorage.getItem('freeTickets');
      const savedHistory = localStorage.getItem('pointsHistory');

      if (savedPoints) setUserPoints(parseInt(savedPoints, 10));
      if (savedFreeTickets) setFreeTickets(JSON.parse(savedFreeTickets));
      if (savedHistory) setPointsHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error('Error loading loyalty data:', e);
    }
  }, []);

  // Save loyalty data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('userPoints', userPoints.toString());
      localStorage.setItem('freeTickets', JSON.stringify(freeTickets));
      localStorage.setItem('pointsHistory', JSON.stringify(pointsHistory));
    } catch (e) {
      console.error('Error saving loyalty data:', e);
    }
  }, [userPoints, freeTickets, pointsHistory]);

  // Calculate points earned from a purchase
  const calculatePointsEarned = (ticketCount, snackCount) => {
    if (!loyaltyConfig) return 0;
    const ticketPoints = ticketCount * loyaltyConfig.puntos_boletas;
    const snackPoints = snackCount * loyaltyConfig.puntos_snacks;
    return ticketPoints + snackPoints;
  };

  // Add points to user balance
  const addPoints = (points, source, description) => {
    const newPoints = userPoints + points;
    setUserPoints(newPoints);

    const historyEntry = {
      id: Date.now(),
      points,
      source,
      description,
      date: new Date().toISOString(),
      type: 'earned'
    };
    setPointsHistory([historyEntry, ...pointsHistory]);

    // Check if user qualifies for a free ticket
    checkForFreeTicket(newPoints);
  };

  // Check if user has reached redemption threshold
  const checkForFreeTicket = (currentPoints) => {
    if (!loyaltyConfig) return;
    const redemptionThreshold = loyaltyConfig.puntos_redencion;
    const freeTicketsEarned = Math.floor(currentPoints / redemptionThreshold);
    const currentFreeTickets = freeTickets.length;

    if (freeTicketsEarned > currentFreeTickets) {
      const newFreeTicketsCount = freeTicketsEarned - currentFreeTickets;
      for (let i = 0; i < newFreeTicketsCount; i++) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + loyaltyConfig.vigencia_boleta_gratis_meses);

        const newFreeTicket = {
          id: Date.now() + i,
          type: loyaltyConfig.tipo_boleta_gratis,
          issuedAt: new Date().toISOString(),
          expiresAt: expiryDate.toISOString(),
          used: false
        };
        setFreeTickets(prev => [...prev, newFreeTicket]);
      }
    }
  };

  // Redeem a free ticket
  const redeemFreeTicket = (ticketId) => {
    setFreeTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, used: true } : ticket
      )
    );
  };

  // Get available (unused) free tickets
  const getAvailableFreeTickets = () => {
    const now = new Date();
    return freeTickets.filter(ticket => 
      !ticket.used && new Date(ticket.expiresAt) > now
    );
  };

  // Get progress towards next free ticket
  const getProgressToNextReward = () => {
    if (!loyaltyConfig) return { progress: 0, pointsNeeded: 0, currentPoints: 0, threshold: 0 };
    const redemptionThreshold = loyaltyConfig.puntos_redencion;
    const pointsInCurrentTier = userPoints % redemptionThreshold;
    const progress = (pointsInCurrentTier / redemptionThreshold) * 100;
    const pointsNeeded = redemptionThreshold - pointsInCurrentTier;

    return {
      progress,
      pointsNeeded,
      currentPoints: pointsInCurrentTier,
      threshold: redemptionThreshold
    };
  };

  // Clear all loyalty data (for testing/logout)
  const clearLoyaltyData = () => {
    setUserPoints(0);
    setFreeTickets([]);
    setPointsHistory([]);
    localStorage.removeItem('userPoints');
    localStorage.removeItem('freeTickets');
    localStorage.removeItem('pointsHistory');
  };

  const value = {
    // State
    userPoints,
    freeTickets,
    pointsHistory,
    loyaltyConfig,
    configLoading,

    // Computed
    availableFreeTickets: getAvailableFreeTickets(),
    progressToNextReward: getProgressToNextReward(),
    canRedeemFreeTicket: getAvailableFreeTickets().length > 0,

    // Actions
    addPoints,
    calculatePointsEarned,
    redeemFreeTicket,
    clearLoyaltyData,
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyaltyContext() {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyaltyContext must be used within a LoyaltyProvider');
  }
  return context;
}

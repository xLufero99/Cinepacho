import api from './api';

// GET /showtimes/movie/:id/headquarters/:hq
export const getShowtimesByMovieAndHeadquarters = async (movieId, headquartersId) => {
  try {
    const response = await api.get(`/showtimes/movie/${movieId}/headquarters/${headquartersId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    return [];
  }
};

// GET /showtimes/:showtimeId/seats
export const getShowtimeSeats = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}/seats`);
  return response.data;
};

// POST /showtimes/:showTimeId/reserve
export const reserveSeats = async (showtimeId, seats) => {
  const response = await api.post(`/showtimes/${showtimeId}/reserve`, { seats });
  return response.data;
};
import api from './api';


//POST /bookings
export const createBooking = async (
    bookingData
) => {

    const response =
        await api.post(
            '/bookings',
            bookingData
        );

    return response.data;
    /*
    Expected response:
    
    */
};
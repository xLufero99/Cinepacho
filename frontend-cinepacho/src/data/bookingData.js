// Seat data configuration
// export const SEAT_PRICES = {
//   PREFERENTIAL: 15000,
//   GENERAL: 11000,
// };

// export const PROCESSING_FEE = 1500;

// export const CINEMA_MULTIPLEXES = ['Titán', 'Unicentro', 'Plaza Central', 'Gran Estación', 'Embajador', 'Las Américas', 'Atlantis'];

// // Preferential section seats (2 rows, 10 seats each with aisle separator)
// export const PREFERENTIAL_SEATS = [
//   [
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'occupied' },
//     { status: 'available' },
//     null, // Aisle separator
//     { status: 'occupied' },
//     { status: 'occupied' },
//     { status: 'available' },
//     { status: 'reserved' },
//     { status: 'reserved' },
//     { status: 'available' },
//   ],
//   [
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     null,
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'occupied' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//   ],
// ];

// General section seats (4 rows, 10 seats each with aisle separator)
// export const GENERAL_SEATS = [
//   [
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'occupied' },
//     { status: 'occupied' },
//     null,
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'occupied' },
//   ],
//   [
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     null,
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//   ],
//   [
//     { status: 'occupied' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     null,
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'occupied' },
//     { status: 'available' },
//     { status: 'available' },
//   ],
//   [
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'occupied' },
//     null,
//     { status: 'available' },
//     { status: 'occupied' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//     { status: 'available' },
//   ],
// ];

// Seat legend for reference
export const SEAT_LEGEND = [
  { status: 'available', label: 'booking.available', color: 'bg-surface-container-highest' },
  { status: 'selected', label: 'booking.selected', color: 'bg-primary' },
  { status: 'occupied', label: 'booking.occupied', color: 'bg-surface-variant/30' },
];

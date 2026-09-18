// Snack items data for CinePacho concessions
export const snacks = [
  {
    id: 1,
    name: "Classic Salted Popcorn",
    description: "Large bucket, perfectly salted and buttered.",
    price: 8.50,
    points: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD43HGbBwfZDoKSSioXo-1p-5Iaou4lfnY0LWhZWxM7ExF4ld0eBvBNN5BSD9HZpEO37JwacODULQUWNO7zYbS84N1FtpWy517iINzXjhAFWN08pUSYOA47UVlbtE019qtmbOW_22DaOF3TGgNGvcN23XygnN3vsqVd4ojkJdLBIi5HMfmPN5NLFTCFdGCpgqTSYFp9dulgfPNBs-JcNZNeI7DWQ7jIXm8SLMOfs1iknal0-Z9JE6Igtfakega_CRkA77y23RWRMG8",
    category: "popcorn",
    featured: true
  },
  {
    id: 2,
    name: "Caramel Sweet Popcorn",
    description: "Large bucket, coated in rich caramel.",
    price: 9.00,
    points: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlqOWM31p_CVrl6N_AZmjgfFtbWDM7zYxFf4Kf_ko5RCobp4wrIOx0TJ83OMbke_k8Kg8ciAx_UKqNgsiQ7KVUu3l18RlXAScswSxLJsD1mMdo-0EzmViKbPwDtdeEx9ayQH83kEJx9xWDHnJnwfTT6F_82lo8UsoCr-wQuTvX4atRFUil0z2z9T8ECP9h3ct0R8qeZxdEJmgIg0OUBu-LBrOgo2OD2PgSzNa2LS3eK5-kOoLWO1-wRPq4rODE-QkZ5d2CJpWu674",
    category: "popcorn",
    featured: false
  },
  {
    id: 3,
    name: "Mixed Popcorn",
    description: "The best of both worlds. 50/50 split.",
    price: 9.00,
    points: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXRVXUYvzqWRczXbKTABckkxq5LrhyAclqmFefgsbl-mDm9aK8AwNEjxjFfTSHl4FUSoPYPYK8d-OkEvezK86Mnq5TjZ6ZnN5cL09pepo4u5jlxqbGqPRxpyFHInEsRR9IeTX03b8-oq16jO-U46h412z3Z4I0037FTDW3YEXzoeDaV-h5ZxcFpXi12r9Zr1hj0t-f4GaLdwzMHfYqd05fOzGtF2KORoWhSnuShxBnCQDsL8B2vstbioG6IQx6UJ-STEwLfSeg0-A",
    category: "popcorn",
    featured: false
  },
  {
    id: 4,
    name: "Premiere Hot Dog",
    description: "100% beef frank with artisan bun.",
    price: 6.50,
    points: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClAdjLMSyhl_MMIY_moFzuY2HGGETpLUMSP7OndjrO7sV3Agf5vZopgymGXLgNbSJ7rv6NbeuIbR8xY5LNnpNFUJkltoA6iXOo9f4uMuMHqhuLphtcGsR3JH2_m4nosY-Js_5iFD5d7z5mxlJw3FtlCnlSaKP7HEHPPvQQtXtKmENzDjJIOe-CmTcjZtFVX9l1etxrhQ6lc-NWkFYRxFSTN1GSVlZth8VrQSkHTXWs4qaNtQUqatHnqLLVm0QbH4TkTLUN2-zE74w",
    category: "hotdog",
    featured: false
  },
  {
    id: 5,
    name: "Spicy Cheese Nachos",
    description: "Warm tortilla chips with jalapeño cheese dip.",
    price: 7.50,
    points: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMNb29enNX6E49XzyW18rgwRgDP4U9aa045Ta7BvyQDO9_M-WYmYyoZjIwk-N-huxQbmJ0V3AoQ4MCeYktBofbUefoEJfb0xS9qYGYh_HF8FdrD2vHF2O83juDkqg9Pt-SoRR71tc-oxCdhMvCLDOoC2tzSbSS3emihttIliaGoLv5-U0D5d2N5wYoTYeWPALh_XjyODL1ysONH65BstQQV1m3FjaTXhuiz779ZqNeJXH-jI8OI0tWbo4vhD6t6QGmZqQIa-HrtWE",
    category: "nachos",
    featured: true
  },
  {
    id: 6,
    name: "Fountain Soda",
    description: "Large icy cold beverage. Choice at counter.",
    price: 5.50,
    points: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVzQ4jgAZ3MeYeTxu6DzVvuHDw16456-MauM-FimsYURKBNhOdNJ2jh3a1-PioCoaJw_WageVkKV9kzZa8jMvHGpWkfsMxZOg-Ujqz4ycLp38ZarnY9_b-558RXxnr6AIPVRzIqyfDMrhzyQvni47Ve6p4AsXxHZ9dOB5uqZSw044afeKj6Y83BiMoqQpaEpe_n1qctvdvNFCK4qD1adB9Gjkz5UB8d72Znpam6FBTQrm6k80-nvZquHTC0qJVmA9vC5dgkbGeTuE",
    category: "drinks",
    featured: false
  }
];

// Categories for filtering
export const snackCategories = [
  { id: 'all', name: 'All Items', icon: 'restaurant_menu' },
  { id: 'popcorn', name: 'Popcorn', icon: 'popcorn' },
  { id: 'hotdog', name: 'Hot Dogs', icon: 'lunch_dining' },
  { id: 'nachos', name: 'Nachos', icon: 'tapas' },
  { id: 'drinks', name: 'Drinks', icon: 'local_cafe' }
];

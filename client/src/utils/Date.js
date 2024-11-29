export const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]
};

export const getDays = () => {
  return Array.from({ length: 31 }, (_, i) => i + 1); // [1, 2, ..., 31]
};

export const getPastYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 100 }, (_, i) => currentYear - i); // Ultimi 100 anni
};

export const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')); // ['01', '02', ..., '12']
};

export const getPastYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 100 }, (_, i) => currentYear - i);
};

export const getDays = (year, month) => {
  if (!year || !month) return [];

  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1).padStart(2, '0'),
  );
};

export const isNotFutureDate = (year, month, day) => {
  const today = new Date();
  const selectedDate = new Date(year, month - 1, day || 1);
  return selectedDate <= today;
};

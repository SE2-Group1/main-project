export const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]
};

// export const getDays = () => {
//   return Array.from({ length: 31 }, (_, i) => i + 1); // [1, 2, ..., 31]
// };

export const getPastYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 100 }, (_, i) => currentYear - i); // Ultimi 100 anni
};

export const getDays = (year, month) => {
  if (!year || !month) return Array.from({ length: 31 }, (_, i) => i + 1);

  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};

export const isValidDate = (year, month, day) => {
  if (!year || !month || !day) return false;

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === parseInt(year) &&
    date.getMonth() + 1 === parseInt(month) &&
    date.getDate() === parseInt(day)
  );
};

export const isNotFutureDate = (year, month, day) => {
  if (!day) day = 1;
  const today = new Date();
  const selectedDate = new Date(year, month - 1, day);
  return selectedDate <= today;
};

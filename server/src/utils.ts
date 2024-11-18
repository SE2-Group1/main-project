export const isNullableType = (value: any, type: string): boolean => {
  return value === null || typeof value === type;
};

export const formatCents = (cents: number) => {
  const dollars = Math.floor(cents / 100);
  const remainingCents = cents % 100;
  return `$${dollars}.${remainingCents.toString().padStart(2, '0')}`;
};

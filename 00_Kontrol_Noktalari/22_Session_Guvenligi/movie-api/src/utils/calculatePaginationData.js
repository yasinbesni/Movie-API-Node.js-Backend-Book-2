export const calculatePaginationData = (
  totalItems,
  limit,
  page,
) => {
  const totalPages = Math.ceil(totalItems / limit);

  const hasNext = page < totalPages;

  const hasPrevious =
    page > 1 &&
    page <= totalPages;

  return {
    totalPages,
    hasNext,
    hasPrevious,
  };
};

import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../constants/pagination.js";

const parseNumber = (value, defaultValue) => {
  if (typeof value !== "string") {
    return defaultValue;
  }

  const parsedNumber = Number(value);

  if (
    !Number.isSafeInteger(parsedNumber) ||
    parsedNumber < 1
  ) {
    return defaultValue;
  }

  return parsedNumber;
};

export const parsePaginationParams = (query) => {
  const { page, limit } = query;

  const parsedPage = parseNumber(
    page,
    DEFAULT_PAGE,
  );

  const parsedLimit = parseNumber(
    limit,
    DEFAULT_LIMIT,
  );

  return {
    page: parsedPage,
    limit: Math.min(parsedLimit, MAX_LIMIT),
  };
};

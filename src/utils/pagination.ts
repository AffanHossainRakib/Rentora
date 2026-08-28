export type PaginationQuery = {
  page?: number;
  limit?: number;
};

export const getPaginationParams = (query: PaginationQuery) => {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

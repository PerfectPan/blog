import { groupBy, orderBy } from 'lodash-es';

export const groupedByDate = <T extends { date: string }>(items: T[]) => {
  const grouped = groupBy<T>(items, (item) =>
    new Date(item.date).getFullYear(),
  );

  return orderBy(Object.keys(grouped), undefined, ['desc']).map((key) => ({
    year: key,
    blogs: orderBy(grouped[key], ['date'], ['desc']),
  }));
};

import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { z } from 'zod';
import { AccountPage } from '../components/account.js';

const routeApi = getRouteApi('/account');

function AccountRoute() {
  const { error } = routeApi.useSearch();
  return <AccountPage searchError={error} />;
}

export const Route = createFileRoute('/account')({
  head: () => ({
    meta: [{ title: "Account | PerfectPan's Blog" }]
  }),
  // `error` is set by Better Auth when linking GitHub fails.
  validateSearch: z.object({ error: z.string().optional() }),
  component: AccountRoute
});

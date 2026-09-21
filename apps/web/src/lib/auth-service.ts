import { createServerFn } from '@tanstack/react-start';
import { githubProviderEnabled } from './auth.js';

/**
 * Which OAuth providers the login / signup UI should render. Informational
 * only (a boolean, no session or user data), so the handler needs no authz.
 */
export const getAuthProvidersServerFn = createServerFn({
  method: 'GET',
}).handler(() => ({ github: githubProviderEnabled }));

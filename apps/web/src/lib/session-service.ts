import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { getSessionUserFromRequest } from './session-core.js';

export const getSessionUserServerFn = createServerFn({ method: 'GET' }).handler(
  () => getSessionUserFromRequest(getRequest()),
);

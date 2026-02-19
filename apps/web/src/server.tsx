import {
  createRequestHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';
import { createRouter } from './router.js';

export default createRequestHandler({
  createRouter,
})(defaultStreamHandler);

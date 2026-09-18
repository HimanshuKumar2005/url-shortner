import { Router } from 'express';

export function createApiRouter({ urlController }) {
  const router = Router();

  router.get('/health', (_request, response) => response.json({ status: 'ok' }));
  router.post('/shorten', urlController.shorten);
  router.get('/analytics/:shortKey', urlController.analytics);

  return router;
}

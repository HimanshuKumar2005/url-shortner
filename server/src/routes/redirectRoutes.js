import { Router } from 'express';

export function createRedirectRouter({ urlController }) {
  const router = Router();

  router.get('/:shortKey', urlController.redirect);

  return router;
}

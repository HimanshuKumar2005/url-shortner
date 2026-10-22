import { Router } from 'express';

export function createApiRouter({ urlController, authController, optionalAuth, requireAuth, shortenRateLimit }) {
  const router = Router();

  router.get('/health', (_request, response) => response.json({ status: 'ok' }));
  router.post('/auth/register', authController.register);
  router.post('/auth/login', authController.login);
  router.post('/auth/google', authController.googleLogin);
  router.get('/auth/me', optionalAuth, requireAuth, authController.me);
  router.post('/shorten', optionalAuth, shortenRateLimit, urlController.shorten);
  router.get('/urls', optionalAuth, requireAuth, urlController.mine);
  router.patch('/urls/:shortKey', optionalAuth, urlController.updateLabel);
  router.get('/analytics/:shortKey', urlController.analytics);

  return router;
}

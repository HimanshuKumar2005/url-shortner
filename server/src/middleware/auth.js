import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-change-me';

export function signUser(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email, name: user.name || '' }, JWT_SECRET, { expiresIn: '7d' });
}

export function optionalAuth(request, _response, next) {
  const header = request.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      request.user = jwt.verify(header.slice(7), JWT_SECRET);
    } catch {
      request.user = null;
    }
  }
  next();
}

export function requireAuth(request, response, next) {
  if (!request.user) return response.status(401).json({ message: 'Authentication required' });
  next();
}
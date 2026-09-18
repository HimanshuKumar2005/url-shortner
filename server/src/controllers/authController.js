import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { signUser } from '../middleware/auth.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function publicUser(user) {
  return { id: user._id, email: user.email, name: user.name || '' };
}

function authResponse(user) {
  return { token: signUser(user), user: publicUser(user) };
}

export function createAuthController({ User }) {
  async function register(request, response, next) {
    try {
      const { email, password, name } = request.body;
      if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 8) {
        return response.status(400).json({ message: 'Use a valid email and a password of at least 8 characters' });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) return response.status(409).json({ message: 'An account with that email already exists' });
      const user = await User.create({ email: normalizedEmail, name: typeof name === 'string' ? name.trim() : '', passwordHash: await bcrypt.hash(password, 12) });
      return response.status(201).json(authResponse(user));
    } catch (error) {
      return next(error);
    }
  }

  async function login(request, response, next) {
    try {
      const { email, password } = request.body;
      const user = await User.findOne({ email: typeof email === 'string' ? email.trim().toLowerCase() : '' }).select('+passwordHash');
      if (!user || !user.passwordHash || !(await bcrypt.compare(password || '', user.passwordHash))) {
        return response.status(401).json({ message: 'Email or password is incorrect' });
      }
      return response.json(authResponse(user));
    } catch (error) {
      return next(error);
    }
  }

  async function googleLogin(request, response, next) {
    try {
      if (!process.env.GOOGLE_CLIENT_ID) return response.status(503).json({ message: 'Google login is not configured' });
      const ticket = await googleClient.verifyIdToken({ idToken: request.body.credential, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) return response.status(401).json({ message: 'Google account could not be verified' });
      let user = await User.findOne({ email: payload.email.toLowerCase() });
      if (!user) user = await User.create({ email: payload.email.toLowerCase(), name: payload.name || '', googleId: payload.sub });
      else if (!user.googleId) user = await User.findByIdAndUpdate(user._id, { googleId: payload.sub, name: user.name || payload.name || '' }, { new: true });
      return response.json(authResponse(user));
    } catch (error) {
      return next(error);
    }
  }

  function me(request, response) {
    return response.json({ user: request.user });
  }

  return { register, login, googleLogin, me };
}
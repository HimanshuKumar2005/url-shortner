import { isIP } from 'node:net';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

const windowMs = Number(process.env.SHORTEN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const maxRequests = Number(process.env.SHORTEN_RATE_LIMIT_MAX || 30);
const blockedDomains = (process.env.BLOCKED_DOMAINS || '')
  .split(',')
  .map((domain) => domain.trim().toLowerCase())
  .filter(Boolean);

export const shortenRateLimit = rateLimit({
  windowMs,
  limit: maxRequests,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (request) => request.user?.sub ? `user:${request.user.sub}` : `ip:${ipKeyGenerator(request.ip)}`,
  message: { message: 'Too many links created. Please try again later.' },
});

function isPrivateIpv4(hostname) {
  const octets = hostname.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  const [first, second] = octets;
  return first === 10
    || first === 127
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 168);
}

function isPrivateHostname(hostname) {
  const normalized = hostname.toLowerCase().replace(/\.$/, '');
  if (normalized === 'localhost' || normalized.endsWith('.localhost') || normalized.endsWith('.local') || normalized.endsWith('.internal')) return true;

  const addressType = isIP(normalized);
  if (addressType === 4) return isPrivateIpv4(normalized);
  if (addressType === 6) return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80');
  return false;
}

export function isBlockedDestination(value) {
  const hostname = new URL(value).hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (isPrivateHostname(hostname)) return true;
  return blockedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

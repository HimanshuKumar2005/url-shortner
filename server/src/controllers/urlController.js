import { encodeBase62 } from '../utils/base62.js';
import { isBlockedDestination } from '../middleware/abuseProtection.js';

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseOptionalDate(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function getLifecycleStatus(url, now = new Date()) {
  if (url.disabled) return 'disabled';
  if (url.startsAt && url.startsAt > now) return 'scheduled';
  if (url.expiresAt && url.expiresAt <= now) return 'expired';
  if (url.maxClicks !== null && url.maxClicks !== undefined && url.clicks >= url.maxClicks) return 'limit-reached';
  return 'active';
}

function toUrlResponse(url, baseUrl) {
  return {
    shortKey: url.shortKey,
    shortUrl: `${baseUrl}/${url.shortKey}`,
    longUrl: url.longUrl,
    label: url.label || 'label1',
    clicks: url.clicks,
    createdAt: url.createdAt,
    startsAt: url.startsAt || null,
    expiresAt: url.expiresAt || null,
    maxClicks: url.maxClicks ?? null,
    disabled: Boolean(url.disabled),
    status: getLifecycleStatus(url),
  };
}

export function createUrlController({ Url, allocator, cache, baseUrl }) {
  async function shorten(request, response, next) {
    try {
      const { expiresAt, label, longUrl, maxClicks, startsAt, website } = request.body;
      if (typeof website === 'string' && website.trim()) {
        return response.status(400).json({ message: 'Request rejected' });
      }
      if (typeof longUrl !== 'string' || !isValidUrl(longUrl)) {
        return response.status(400).json({ message: 'longUrl must be a valid HTTP or HTTPS URL' });
      }
      if (isBlockedDestination(longUrl)) {
        return response.status(400).json({ message: 'This destination domain is not allowed' });
      }
      if (label !== undefined && (typeof label !== 'string' || label.trim().length > 80)) {
        return response.status(400).json({ message: 'label must be a string of 80 characters or fewer' });
      }
      const parsedStartsAt = parseOptionalDate(startsAt, 'startsAt');
      const parsedExpiresAt = parseOptionalDate(expiresAt, 'expiresAt');
      if ((startsAt !== undefined && parsedStartsAt === undefined) || (expiresAt !== undefined && parsedExpiresAt === undefined)) {
        return response.status(400).json({ message: 'startsAt and expiresAt must be valid dates' });
      }
      if (parsedStartsAt && parsedExpiresAt && parsedExpiresAt <= parsedStartsAt) {
        return response.status(400).json({ message: 'expiresAt must be later than startsAt' });
      }
      if (parsedExpiresAt && parsedExpiresAt <= new Date()) {
        return response.status(400).json({ message: 'expiresAt must be in the future' });
      }
      if (maxClicks !== undefined && maxClicks !== null && (!Number.isInteger(Number(maxClicks)) || Number(maxClicks) < 1)) {
        return response.status(400).json({ message: 'maxClicks must be a positive integer' });
      }

      const numericId = await allocator.next();
      const shortKey = encodeBase62(numericId);
      const userId = request.user?.sub || null;
      const defaultLabel = `label${await Url.countDocuments({ userId }) + 1}`;
      const url = await Url.create({ numericId, shortKey, longUrl, label: label?.trim() || defaultLabel, startsAt: parsedStartsAt, expiresAt: parsedExpiresAt, maxClicks: maxClicks === undefined || maxClicks === null || maxClicks === '' ? null : Number(maxClicks), userId });
      await cache.set(shortKey, longUrl);

      return response.status(201).json(toUrlResponse(url, baseUrl));
    } catch (error) {
      return next(error);
    }
  }

  async function mine(request, response, next) {
    try {
      const urls = await Url.find({ userId: request.user.sub }).sort({ createdAt: -1 }).lean();
      return response.json(urls.map((url) => toUrlResponse(url, baseUrl)));
    } catch (error) {
      return next(error);
    }
  }

  async function updateLabel(request, response, next) {
    try {
      const { disabled, expiresAt, label, maxClicks, startsAt } = request.body;
      const updates = {};
      if (label !== undefined) {
        if (typeof label !== 'string' || !label.trim() || label.trim().length > 80) {
          return response.status(400).json({ message: 'label must be between 1 and 80 characters' });
        }
        updates.label = label.trim();
      }
      if (disabled !== undefined) {
        if (typeof disabled !== 'boolean') return response.status(400).json({ message: 'disabled must be a boolean' });
        updates.disabled = disabled;
      }
      const parsedStartsAt = parseOptionalDate(startsAt, 'startsAt');
      const parsedExpiresAt = parseOptionalDate(expiresAt, 'expiresAt');
      if ((startsAt !== undefined && parsedStartsAt === undefined) || (expiresAt !== undefined && parsedExpiresAt === undefined)) {
        return response.status(400).json({ message: 'startsAt and expiresAt must be valid dates' });
      }
      const currentUrl = await Url.findOne({ shortKey: request.params.shortKey, userId: request.user?.sub || null }).lean();
      if (!currentUrl) return response.status(404).json({ message: 'Short URL not found' });
      const nextStartsAt = startsAt === undefined ? currentUrl.startsAt : parsedStartsAt;
      const nextExpiresAt = expiresAt === undefined ? currentUrl.expiresAt : parsedExpiresAt;
      if (nextStartsAt && nextExpiresAt && nextExpiresAt <= nextStartsAt) {
        return response.status(400).json({ message: 'expiresAt must be later than startsAt' });
      }
      if (nextExpiresAt && nextExpiresAt <= new Date()) {
        return response.status(400).json({ message: 'expiresAt must be in the future' });
      }
      if (startsAt !== undefined) updates.startsAt = parsedStartsAt;
      if (expiresAt !== undefined) updates.expiresAt = parsedExpiresAt;
      if (maxClicks !== undefined) {
        if (maxClicks !== null && (!Number.isInteger(Number(maxClicks)) || Number(maxClicks) < 1)) {
          return response.status(400).json({ message: 'maxClicks must be a positive integer' });
        }
        updates.maxClicks = maxClicks === null || maxClicks === '' ? null : Number(maxClicks);
      }
      if (!Object.keys(updates).length) return response.status(400).json({ message: 'At least one update is required' });

      const url = await Url.findOneAndUpdate(
        { _id: currentUrl._id },
        { $set: updates },
        { new: true, runValidators: true },
      ).lean();
      if (!url) return response.status(404).json({ message: 'Short URL not found' });

      return response.json(toUrlResponse(url, baseUrl));
    } catch (error) {
      return next(error);
    }
  }

  async function analytics(request, response, next) {
    try {
      const url = await Url.findOne({ shortKey: request.params.shortKey }).lean();
      if (!url) return response.status(404).json({ message: 'Short URL not found' });

      return response.json(toUrlResponse(url, baseUrl));
    } catch (error) {
      return next(error);
    }
  }

  async function remove(request, response, next) {
    try {
      const url = await Url.findOneAndDelete({
        shortKey: request.params.shortKey,
        userId: request.user?.sub || null,
      }).lean();
      if (!url) return response.status(404).json({ message: 'Short URL not found' });

      await cache.remove(url.shortKey);
      return response.status(204).end();
    } catch (error) {
      return next(error);
    }
  }

  async function redirect(request, response, next) {
    try {
      const { shortKey } = request.params;
      if (!/^[a-zA-Z0-9]{7}$/.test(shortKey)) {
        return response.status(404).json({ message: 'Short URL not found' });
      }

      const url = await Url.findOne({ shortKey }).lean();
      if (!url) return response.status(404).json({ message: 'Short URL not found' });
      const status = getLifecycleStatus(url);
      if (status !== 'active') {
        return response.status(410).json({ message: `Short URL is ${status}`, status });
      }

      let longUrl = await cache.get(shortKey);
      if (!longUrl) {
        longUrl = url.longUrl;
        await cache.set(shortKey, longUrl);
      }

      void Url.updateOne({ shortKey }, { $inc: { clicks: 1 } }).exec().catch((error) => {
        console.error('Click tracking error:', error.message);
      });
      response.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response.redirect(302, longUrl);
    } catch (error) {
      return next(error);
    }
  }

  return { shorten, analytics, mine, redirect, updateLabel, remove };
}

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

function toUrlResponse(url, baseUrl) {
  return {
    shortKey: url.shortKey,
    shortUrl: `${baseUrl}/${url.shortKey}`,
    longUrl: url.longUrl,
    label: url.label || 'label1',
    clicks: url.clicks,
    createdAt: url.createdAt,
  };
}

export function createUrlController({ Url, allocator, cache, baseUrl }) {
  async function shorten(request, response, next) {
    try {
      const { label, longUrl, website } = request.body;
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

      const numericId = await allocator.next();
      const shortKey = encodeBase62(numericId);
      const userId = request.user?.sub || null;
      const defaultLabel = `label${await Url.countDocuments({ userId }) + 1}`;
      const url = await Url.create({ numericId, shortKey, longUrl, label: label?.trim() || defaultLabel, userId });
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
      const { label } = request.body;
      if (typeof label !== 'string' || !label.trim() || label.trim().length > 80) {
        return response.status(400).json({ message: 'label must be between 1 and 80 characters' });
      }

      const url = await Url.findOneAndUpdate(
        { shortKey: request.params.shortKey, userId: request.user?.sub || null },
        { $set: { label: label.trim() } },
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

  async function redirect(request, response, next) {
    try {
      const { shortKey } = request.params;
      if (!/^[a-zA-Z0-9]{7}$/.test(shortKey)) {
        return response.status(404).json({ message: 'Short URL not found' });
      }

      let longUrl = await cache.get(shortKey);
      if (!longUrl) {
        const url = await Url.findOne({ shortKey }).lean();
        if (!url) return response.status(404).json({ message: 'Short URL not found' });
        longUrl = url.longUrl;
        await cache.set(shortKey, longUrl);
      }

      void Url.updateOne({ shortKey }, { $inc: { clicks: 1 } }).exec().catch((error) => {
        console.error('Click tracking error:', error.message);
      });
      return response.redirect(301, longUrl);
    } catch (error) {
      return next(error);
    }
  }

  return { shorten, analytics, mine, redirect, updateLabel };
}

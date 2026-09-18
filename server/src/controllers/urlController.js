import { encodeBase62 } from '../utils/base62.js';

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
    clicks: url.clicks,
    createdAt: url.createdAt,
  };
}

export function createUrlController({ Url, allocator, cache, baseUrl }) {
  async function shorten(request, response, next) {
    try {
      const { longUrl } = request.body;
      if (typeof longUrl !== 'string' || !isValidUrl(longUrl)) {
        return response.status(400).json({ message: 'longUrl must be a valid HTTP or HTTPS URL' });
      }

      const numericId = await allocator.next();
      const shortKey = encodeBase62(numericId);
      const url = await Url.create({ numericId, shortKey, longUrl });
      await cache.set(shortKey, longUrl);

      return response.status(201).json(toUrlResponse(url, baseUrl));
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

  return { shorten, analytics, redirect };
}

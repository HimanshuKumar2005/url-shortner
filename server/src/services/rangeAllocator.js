const COUNTER_KEY = 'url-shortner:numeric-id-counter';

export class RangeAllocator {
  constructor(redis, rangeSize = 1_000_000) {
    this.redis = redis;
    this.rangeSize = rangeSize;
    this.nextId = 0;
    this.rangeEnd = -1;
  }

  async next() {
    if (this.nextId > this.rangeEnd) {
      const newRangeEnd = await this.redis.incrBy(COUNTER_KEY, this.rangeSize);
      this.nextId = newRangeEnd - this.rangeSize + 1;
      this.rangeEnd = newRangeEnd;
    }

    return this.nextId++;
  }
}

// Graceful Degradation Principle - Correct Implementation
// The system continues to provide core functionality even when non-critical components fail

// Analytics service that may or may not be available
class AnalyticsService {
  constructor(isAvailable = true) {
    this.isAvailable = isAvailable;
  }

  trackEvent(eventName, data) {
    if (!this.isAvailable) {
      throw new Error('Analytics service unavailable');
    }
    console.log(`Analytics: ${eventName}`, data);
  }
}

// Cache service that may fail
class CacheService {
  constructor(shouldFail = false) {
    this.cache = new Map();
    this.shouldFail = shouldFail;
  }

  get(key) {
    if (this.shouldFail) {
      throw new Error('Cache service failed');
    }
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.shouldFail) {
      throw new Error('Cache service failed');
    }
    this.cache.set(key, value);
  }
}

// Recommendation engine that may be slow or unavailable
class RecommendationEngine {
  constructor(isAvailable = true) {
    this.isAvailable = isAvailable;
  }

  getRecommendations(userId) {
    if (!this.isAvailable) {
      throw new Error('Recommendation engine unavailable');
    }
    return [`Product ${userId}-1`, `Product ${userId}-2`, `Product ${userId}-3`];
  }
}

// E-commerce service with graceful degradation
class ProductService {
  constructor(analyticsService, cacheService, recommendationEngine) {
    this.analyticsService = analyticsService;
    this.cacheService = cacheService;
    this.recommendationEngine = recommendationEngine;
    this.products = [
      { id: 1, name: 'Laptop', price: 999 },
      { id: 2, name: 'Mouse', price: 29 },
      { id: 3, name: 'Keyboard', price: 79 }
    ];
  }

  // Core functionality always works
  getProduct(productId) {
    try {
      // Try to track analytics, but don't fail if it's unavailable
      this.analyticsService.trackEvent('product_view', { productId });
    } catch (error) {
      console.warn('Analytics tracking failed, continuing without it:', error.message);
    }

    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }

  // Uses cache for performance, but works without it
  searchProducts(query) {
    const cacheKey = `search:${query}`;
    
    // Try to get from cache
    try {
      const cached = this.cacheService.get(cacheKey);
      if (cached) {
        console.log('Cache hit');
        return cached;
      }
    } catch (error) {
      console.warn('Cache read failed, falling back to direct search:', error.message);
    }

    // Perform actual search
    const results = this.products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    // Try to cache results, but don't fail if caching fails
    try {
      this.cacheService.set(cacheKey, results);
    } catch (error) {
      console.warn('Cache write failed, continuing without caching:', error.message);
    }

    return results;
  }

  // Provides recommendations when available, fallback when not
  getProductWithRecommendations(productId) {
    const product = this.getProduct(productId);
    
    let recommendations = [];
    try {
      recommendations = this.recommendationEngine.getRecommendations(productId);
      console.log('Recommendations loaded successfully');
    } catch (error) {
      console.warn('Recommendation engine failed, showing fallback recommendations:', error.message);
      // Fallback: show popular items instead of personalized recommendations
      recommendations = this.products
        .filter(p => p.id !== productId)
        .slice(0, 2)
        .map(p => p.name);
    }

    return {
      product,
      recommendations,
      recommendationsType: recommendations.length > 0 ? 'personalized' : 'fallback'
    };
  }

  // Comprehensive operation with multiple degradation levels
  getProductPage(productId, userId) {
    const result = {
      product: null,
      recommendations: [],
      analytics: false,
      cached: false
    };

    // Core functionality - must work
    try {
      result.product = this.getProduct(productId);
    } catch (error) {
      throw new Error(`Cannot load product: ${error.message}`);
    }

    // Enhanced functionality - gracefully degrade if unavailable
    try {
      result.recommendations = this.recommendationEngine.getRecommendations(userId);
      result.cached = true;
    } catch (error) {
      console.warn('Using basic recommendations');
      result.recommendations = this.products
        .filter(p => p.id !== productId)
        .slice(0, 2)
        .map(p => p.name);
    }

    // Optional functionality - nice to have
    try {
      this.analyticsService.trackEvent('page_view', { productId, userId });
      result.analytics = true;
    } catch (error) {
      console.warn('Analytics unavailable');
      result.analytics = false;
    }

    return result;
  }
}

// Example usage
console.log('=== Scenario 1: All services working ===');
const service1 = new ProductService(
  new AnalyticsService(true),
  new CacheService(false),
  new RecommendationEngine(true)
);

console.log(service1.getProduct(1));
console.log(service1.searchProducts('key'));
console.log(service1.getProductWithRecommendations(1));

console.log('\n=== Scenario 2: Analytics and Cache failed ===');
const service2 = new ProductService(
  new AnalyticsService(false),
  new CacheService(true),
  new RecommendationEngine(true)
);

console.log(service2.getProduct(1));
console.log(service2.searchProducts('key'));

console.log('\n=== Scenario 3: Recommendation engine failed ===');
const service3 = new ProductService(
  new AnalyticsService(true),
  new CacheService(false),
  new RecommendationEngine(false)
);

console.log(service3.getProductWithRecommendations(1));

console.log('\n=== Scenario 4: Multiple failures ===');
const service4 = new ProductService(
  new AnalyticsService(false),
  new CacheService(true),
  new RecommendationEngine(false)
);

const page = service4.getProductPage(1, 123);
console.log('Product page loaded:', page);
console.log('Core functionality works, enhanced features degraded gracefully');

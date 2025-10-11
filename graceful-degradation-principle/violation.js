// Graceful Degradation Principle - Violation
// The system completely fails when any non-critical component is unavailable

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

// E-commerce service WITHOUT graceful degradation
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

  // Fails completely if analytics is down, even though it's not critical
  getProduct(productId) {
    // No error handling - if analytics fails, entire operation fails
    this.analyticsService.trackEvent('product_view', { productId });

    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }

  // Completely depends on cache - fails if cache is unavailable
  searchProducts(query) {
    const cacheKey = `search:${query}`;
    
    // Always try to read from cache - no fallback
    const cached = this.cacheService.get(cacheKey);
    if (cached) {
      console.log('Cache hit');
      return cached;
    }

    // Perform search
    const results = this.products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    // Always try to write to cache - fails if cache is down
    this.cacheService.set(cacheKey, results);

    return results;
  }

  // No fallback for recommendations - all or nothing
  getProductWithRecommendations(productId) {
    const product = this.getProduct(productId);
    
    // No fallback - if recommendation engine is down, the whole operation fails
    const recommendations = this.recommendationEngine.getRecommendations(productId);

    return {
      product,
      recommendations,
      recommendationsType: 'personalized'
    };
  }

  // All features are treated as critical - any failure breaks everything
  getProductPage(productId, userId) {
    // No distinction between critical and non-critical operations
    // All failures are fatal
    
    const product = this.getProduct(productId); // Fails if analytics is down
    const recommendations = this.recommendationEngine.getRecommendations(userId); // Fails if engine is down
    
    // Must have all data or nothing
    this.analyticsService.trackEvent('page_view', { productId, userId });

    return {
      product,
      recommendations,
      analytics: true,
      cached: true
    };
  }

  // No circuit breaker or retry logic
  processOrder(orderId) {
    // Every operation is blocking and required
    this.analyticsService.trackEvent('order_start', { orderId });
    
    const orderData = this.cacheService.get(`order:${orderId}`);
    if (!orderData) {
      throw new Error('Order not in cache');
    }

    this.analyticsService.trackEvent('order_complete', { orderId });
    
    return orderData;
  }
}

// Example usage showing how the system breaks
console.log('=== Scenario 1: All services working ===');
const service1 = new ProductService(
  new AnalyticsService(true),
  new CacheService(false),
  new RecommendationEngine(true)
);

try {
  console.log(service1.getProduct(1));
  console.log('Success!');
} catch (error) {
  console.error('FAILED:', error.message);
}

console.log('\n=== Scenario 2: Analytics failed - entire getProduct() fails ===');
const service2 = new ProductService(
  new AnalyticsService(false), // Analytics down
  new CacheService(false),
  new RecommendationEngine(true)
);

try {
  console.log(service2.getProduct(1));
  console.log('Success!');
} catch (error) {
  console.error('FAILED:', error.message);
  console.error('Cannot get product even though the product data is available!');
}

console.log('\n=== Scenario 3: Cache failed - entire searchProducts() fails ===');
const service3 = new ProductService(
  new AnalyticsService(true),
  new CacheService(true), // Cache down
  new RecommendationEngine(true)
);

try {
  console.log(service3.searchProducts('key'));
  console.log('Success!');
} catch (error) {
  console.error('FAILED:', error.message);
  console.error('Cannot search even though we could perform the search without cache!');
}

console.log('\n=== Scenario 4: Recommendation engine failed ===');
const service4 = new ProductService(
  new AnalyticsService(true),
  new CacheService(false),
  new RecommendationEngine(false) // Recommendations down
);

try {
  console.log(service4.getProductWithRecommendations(1));
  console.log('Success!');
} catch (error) {
  console.error('FAILED:', error.message);
  console.error('Cannot show product because recommendations are unavailable!');
}

console.log('\n=== Scenario 5: Multiple failures - complete system breakdown ===');
const service5 = new ProductService(
  new AnalyticsService(false),
  new CacheService(true),
  new RecommendationEngine(false)
);

try {
  const page = service5.getProductPage(1, 123);
  console.log('Product page loaded:', page);
} catch (error) {
  console.error('COMPLETE FAILURE:', error.message);
  console.error('System is completely unusable even though core functionality (product data) is available!');
}

console.log('\n=== Key Problems ===');
console.log('1. No distinction between critical and non-critical features');
console.log('2. No fallback mechanisms when optional services fail');
console.log('3. No error handling for non-essential operations');
console.log('4. System provides all-or-nothing experience');
console.log('5. Poor user experience when any dependency is unavailable');
console.log('6. Cascading failures affect unrelated functionality');

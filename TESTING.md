# Testing Guide

## Overview
This project uses **Vitest** for unit testing. Tests are located in the `__tests__` directory.

---

## Installation

Before running tests, you need to install Vitest and related dependencies:

```bash
npm install -D vitest @vitest/ui
```

**Note:** If you encounter dependency conflicts with `@clerk/nextjs`, try:
```bash
npm install -D vitest @vitest/ui --legacy-peer-deps
```

---

## Running Tests

### Run All Tests (Watch Mode)
```bash
npm test
```

### Run Tests Once
```bash
npm run test:run
```

### Run Tests with UI
```bash
npm run test:ui
```

This opens a browser-based UI for viewing test results.

---

## Test Files

### 1. `__tests__/flightScoring.test.ts`
Tests for the flight scoring algorithm:
- ✅ Price score calculation
- ✅ Duration score calculation
- ✅ Comfort score calculation (based on stops)
- ✅ Weighted scoring for different user profiles
- ✅ Helper functions (`findCheapest`, `findFastest`, `findBestValue`)
- ✅ Edge cases (empty arrays, single flight, etc.)

**Run specific file:**
```bash
npx vitest run __tests__/flightScoring.test.ts
```

### 2. `__tests__/partnerLinks.test.ts`
Tests for partner deep link generation:
- ✅ Skyscanner URL generation
- ✅ Kayak URL generation
- ✅ Google Flights URL generation
- ✅ Booking.com URL generation
- ✅ Expedia URL generation
- ✅ Main partner link generator
- ✅ Get all partner links function
- ✅ Edge cases (missing fields, different formats)

**Run specific file:**
```bash
npx vitest run __tests__/partnerLinks.test.ts
```

---

## Test Coverage

To generate test coverage reports:

```bash
npx vitest run --coverage
```

**Note:** You may need to install coverage dependencies:
```bash
npm install -D @vitest/coverage-v8
```

---

## Writing New Tests

### Example Test Structure

```typescript
import { describe, test, expect } from 'vitest'
import { yourFunction } from '@/utils/yourFile'

describe('Your Feature', () => {
  test('should do something', () => {
    const result = yourFunction(input)
    expect(result).toBe(expectedOutput)
  })
})
```

### Common Matchers

- `expect(value).toBe(expected)` - Strict equality
- `expect(value).toEqual(expected)` - Deep equality
- `expect(value).toBeGreaterThan(n)` - Number comparison
- `expect(value).toContain(item)` - Array/string contains
- `expect(fn).toThrow()` - Function throws error

---

## Manual Testing

For features that require manual verification (UI, API integration, etc.), see:
- **[Manual Verification Guide](../brain/86700456-5fef-4dbe-9718-e50c616699bd/manual_verification.md)**

---

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors in test files:
1. Ensure Vitest is installed: `npm install -D vitest`
2. Restart your IDE/TypeScript server
3. Check that `vitest.config.ts` is in the project root

### Import Errors

If imports fail with `@/` alias:
1. Check `vitest.config.ts` has correct path alias
2. Ensure `tsconfig.json` has matching paths configuration

### Dependency Conflicts

If npm install fails:
1. Try `--legacy-peer-deps` flag
2. Check for conflicting versions in `package.json`
3. Consider using `npm install -D vitest` only (minimal setup)

---

## CI/CD Integration

To run tests in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm run test:run
```

---

## Next Steps

1. **Install Vitest**: `npm install -D vitest --legacy-peer-deps`
2. **Run Tests**: `npm test`
3. **Fix Failing Tests**: Address any issues found
4. **Add More Tests**: Expand coverage as needed
5. **Manual Verification**: Follow the manual verification guide

# flagr-feature-typescript

## Prerequisites

To use this package, you will need to have [Flagr](https://github.com/openflagr/flagr) installed and accessible

## Usage

### Configuration

```typescript
const feature = createFeature({ flagrUrl: 'http://localhost:18000' });
```

### Evaluation

```typescript
const evaluation = feature.evaluate('flag', {
  on: (attachment) => true, // do stuff when feature is on,
  otherwise: (attachment) => false, // do stuff when any other variant isn't matched
});
console.log(evaluation); // return from evaluate
```

### Conditional

```typescript
const match = feature.match('flag'); // true if evaluated variant is 'on'
const matchOff = feature.match('flag2', 'off'); // true evaluated variant is 'off'
```

## Context

Context can be sent during evaluation

```typescript
feature.setContext({
  env: 'production',
  user: { id: 1, username: 'user' },
});
```

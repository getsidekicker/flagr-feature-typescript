# flagr-feature-typescript

## Prerequisites

To use this package, you will need to have [Flagr](https://github.com/openflagr/flagr) installed and accessible

## Usage

### Configuration

```typescript
const feature = createFeature({ flagrUrl: "http://localhost:18000" });
```

### Block execution

```typescript
feature.eval("flag", {
  on: (attachment) => true, // do stuff when feature is on,
  otherwise: (attachment) => false, // do stuff when any other variant isn't matched
});
```

### Conditional

```typescript
if (feature.match("flag")) {
  // do feature when feature variant is 'on'
} else {
  // do otherwise
}
```

## Context

Context can be sent during evaluation

```typescript
feature.setContext({
  env: "production",
  user: { id: 1, username: "user" },
});
```

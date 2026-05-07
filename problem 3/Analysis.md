# Problem 3 — Issues & optimizations in `Sample.tsx`

Original file: `problem 3/Sample.tsx`  
Refactor file: `problem 3/Refactor.tsx`

## 1) Runtime errors / TypeScript mismatches (critical)

### 1.1 Accessing a field not declared in the type (`balance.blockchain`)
- **Where**: `Sample.tsx` L38, L46–47 use `balance.blockchain`.
- **Problem**: `interface WalletBalance` (L1–4) does not declare `blockchain` ⇒ TypeScript mismatch; at runtime it can be `undefined`, which then flows into `getPriority(undefined)`.
- **Fix**: Add `blockchain` to `WalletBalance` and use a proper union type for supported chains (or at least `string`).

### 1.2 Undefined variable `lhsPriority`
- **Where**: `Sample.tsx` L39.
- **Problem**: `lhsPriority` is never declared ⇒ immediate crash.
- **Fix**: Use the correct variable (`balancePriority`) or rename/recompute it consistently.

### 1.3 Using `FormattedWalletBalance` with the wrong source data
- **Where**: `Sample.tsx` L63–72.
- **Problem**:
  - `sortedBalances` is `WalletBalance[]` but the callback param is annotated as `FormattedWalletBalance`.
  - `formattedBalances` (L56–61) computes `formatted` but is **never used** for rendering.
  - Result: `balance.formatted` can be `undefined`.
- **Fix**: Render from `formattedBalances`, or don’t create a separate array and format directly at render time.

## 2) Logic bugs (wrong output)

### 2.1 Filter condition is inverted (keeps balances <= 0)
- **Where**: `Sample.tsx` L40–41.
- **Problem**: Wallet UIs typically **show only** tokens with `amount > 0`. Current code returns `true` when `amount <= 0`.
- **Fix**: Change to `balance.amount > 0` (and combine with a valid priority check).

### 2.2 `sort` comparator doesn’t handle equality
- **Where**: `Sample.tsx` L45–53.
- **Problem**: No `return 0` when `leftPriority === rightPriority` ⇒ unstable/unpredictable ordering.
- **Fix**: Use `return rightPriority - leftPriority` (naturally returns 0 on ties).

### 2.3 `usdValue` can become `NaN`
- **Where**: `Sample.tsx` L64.
- **Problem**: If `prices[balance.currency]` is `undefined`, then `undefined * amount` becomes `NaN`.
- **Fix**: Fallback to `0` or guard: `const price = prices?.[currency] ?? 0`.

## 3) Computational inefficiencies (wasted CPU / unnecessary re-renders)

### 3.1 `useMemo` depends on `prices` even though it doesn’t use it
- **Where**: `Sample.tsx` L54.
- **Problem**: Every `prices` change recomputes `sortedBalances` even though the memo function does not use `prices` ⇒ wasted work.
- **Fix**: Dependency should be `[balances]` only.

### 3.2 `getPriority` is recreated every render and called repeatedly during sorting
- **Where**: `Sample.tsx` L19–34, L46–47.
- **Problem**: Defining it inside the component creates a new function each render; sorting calls `getPriority` multiple times per item ⇒ repeated work.
- **Fix**:
  - Move the priority table outside the component.
  - Cache priority for sorting: map to `{ b, p }`, sort by `p`.

### 3.3 Computing `formattedBalances` but not using it
- **Where**: `Sample.tsx` L56–61.
- **Problem**: Creates a new array each run, but it is unused ⇒ wasted work.
- **Fix**: Use it for rendering, or format inline in the row mapping.

## 4) React anti-patterns / UX issues

### 4.1 `key={index}`
- **Where**: `Sample.tsx` L68.
- **Problem**: When lists are sorted/filtered, index keys cause React to mismatch items ⇒ incorrect re-mounts, lost local state, UI glitches.
- **Fix**: Use a stable key derived from the data (e.g. `${blockchain}:${currency}`).

### 4.2 `any` for `blockchain`
- **Where**: `Sample.tsx` L19.
- **Problem**: Loses TypeScript safety and makes invalid values easy to pass through.
- **Fix**: Use a union type for supported chains, or `string` + validation.

## 5) Refactored (correct logic + fewer recomputations)

Source: `problem 3/Refactor.tsx`

```tsx
type BlockchainType = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: BlockchainType | string;
}

interface Props extends BoxProps {}

const PRIORITY_BY_CHAIN: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: WalletBalance["blockchain"]): number =>
  PRIORITY_BY_CHAIN[String(blockchain)] ?? -99;

const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((b) => getPriority(b.blockchain) > -99 && b.amount > 0)
      .map((b) => ({ b, p: getPriority(b.blockchain) }))
      .sort((a, c) => c.p - a.p)
      .map(({ b }) => b);
  }, [balances]);

  return (
    <div {...rest}>
      {sortedBalances.map((balance) => {
        const price = prices?.[balance.currency] ?? 0;
        const usdValue = price * balance.amount;
        return (
          <WalletRow
            className={classes.row}
            key={`${balance.blockchain}:${balance.currency}`}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.amount.toFixed()}
          />
        );
      })}
    </div>
  );
};
```


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


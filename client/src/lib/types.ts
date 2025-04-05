import { Stock, Transaction, Portfolio } from "@shared/schema";

export interface PortfolioWithStock extends Portfolio {
    stock?: Stock;
    currentValue: number;
    profitLoss: number;
    profitLossPercentage: number;
}

export interface TransactionWithStock extends Transaction {
    stock?: Stock;
}

export interface PortfolioSummary {
    totalInvestedValue: number;
    totalCurrentValue: number;
    totalValue: number;
    walletBalance: number;
    profitLoss: number;
    profitLossPercentage: number;
    assetAllocation: AssetAllocation[];
}

export interface AssetAllocation {
    stockId: number;
    symbol: string;
    name: string;
    value: number;
    percentage: number;
}

export interface LeaderboardEntry {
    userId: number;
    username: string;
    portfolioValue: number;
}

export interface MarketStat {
    name: string;
    value: number;
    change: number;
    isPositive: boolean;
}

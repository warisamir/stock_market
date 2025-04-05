import {
    users, type User, type InsertUser,
    stocks, type Stock, type InsertStock,
    stockPriceHistory, type StockPriceHistory, type InsertStockPriceHistory,
    portfolios, type Portfolio, type InsertPortfolio,
    transactions, type Transaction, type InsertTransaction,
    type TradeOrder
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface definition
export interface IStorage {
    // User operations
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    updateUserWalletBalance(userId: number, newBalance: number): Promise<User>;

    // Stock operations
    getAllStocks(): Promise<Stock[]>;
    getStock(id: number): Promise<Stock | undefined>;
    getStockBySymbol(symbol: string): Promise<Stock | undefined>;
    createStock(stock: InsertStock): Promise<Stock>;
    updateStockPrice(id: number, price: number): Promise<Stock>;

    // Stock price history operations
    addStockPriceHistory(stockPriceHistory: InsertStockPriceHistory): Promise<StockPriceHistory>;
    getStockPriceHistory(stockId: number, limit?: number): Promise<StockPriceHistory[]>;

    // Portfolio operations
    getPortfolio(userId: number): Promise<Portfolio[]>;
    getPortfolioItem(userId: number, stockId: number): Promise<Portfolio | undefined>;
    updatePortfolioItem(userId: number, stockId: number, quantity: number, averageBuyPrice: number): Promise<Portfolio>;

    // Transaction operations
    createTransaction(transaction: InsertTransaction): Promise<Transaction>;
    getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;

    // Trade operations
    executeTrade(userId: number, tradeOrder: TradeOrder): Promise<Transaction>;

    // Leaderboard
    getLeaderboard(limit?: number): Promise<{ userId: number, username: string, portfolioValue: number }[]>;

    // Session store
    sessionStore: session.SessionStore;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
    sessionStore: session.SessionStore;

    constructor() {
        this.sessionStore = new MemoryStore({
            checkPeriod: 86400000, // 24 hours
        });
    }

    // User operations
    async getUser(id: number): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user;
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const [user] = await db
            .insert(users)
            .values(insertUser)
            .returning();
        return user;
    }

    async updateUserWalletBalance(userId: number, newBalance: number): Promise<User> {
        const [user] = await db
            .update(users)
            .set({ walletBalance: newBalance })
            .where(eq(users.id, userId))
            .returning();
        return user;
    }

    // Stock operations
    async getAllStocks(): Promise<Stock[]> {
        return db.select().from(stocks);
    }

    async getStock(id: number): Promise<Stock | undefined> {
        const [stock] = await db.select().from(stocks).where(eq(stocks.id, id));
        return stock;
    }

    async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
        const [stock] = await db.select().from(stocks).where(eq(stocks.symbol, symbol));
        return stock;
    }

    async createStock(insertStock: InsertStock): Promise<Stock> {
        const [stock] = await db
            .insert(stocks)
            .values(insertStock)
            .returning();
        return stock;
    }

    async updateStockPrice(id: number, price: number): Promise<Stock> {
        const currentStock = await this.getStock(id);
        if (!currentStock) throw new Error(`Stock with id ${id} not found`);

        const [updatedStock] = await db
            .update(stocks)
            .set({
                previousClose: currentStock.currentPrice,
                currentPrice: price,
                updatedAt: new Date()
            })
            .where(eq(stocks.id, id))
            .returning();
        return updatedStock;
    }

    // Stock price history operations
    async addStockPriceHistory(insertStockPriceHistory: InsertStockPriceHistory): Promise<StockPriceHistory> {
        const [priceHistory] = await db
            .insert(stockPriceHistory)
            .values(insertStockPriceHistory)
            .returning();
        return priceHistory;
    }

    async getStockPriceHistory(stockId: number, limit: number = 100): Promise<StockPriceHistory[]> {
        return db
            .select()
            .from(stockPriceHistory)
            .where(eq(stockPriceHistory.stockId, stockId))
            .orderBy(desc(stockPriceHistory.timestamp))
            .limit(limit);
    }

    // Portfolio operations
    async getPortfolio(userId: number): Promise<Portfolio[]> {
        return db
            .select()
            .from(portfolios)
            .where(eq(portfolios.userId, userId));
    }

    async getPortfolioItem(userId: number, stockId: number): Promise<Portfolio | undefined> {
        const [portfolioItem] = await db
            .select()
            .from(portfolios)
            .where(
                and(
                    eq(portfolios.userId, userId),
                    eq(portfolios.stockId, stockId)
                )
            );
        return portfolioItem;
    }

    async updatePortfolioItem(userId: number, stockId: number, quantity: number, averageBuyPrice: number): Promise<Portfolio> {
        const existingItem = await this.getPortfolioItem(userId, stockId);

        if (existingItem) {
            const [updatedItem] = await db
                .update(portfolios)
                .set({
                    quantity,
                    averageBuyPrice,
                    updatedAt: new Date()
                })
                .where(
                    and(
                        eq(portfolios.userId, userId),
                        eq(portfolios.stockId, stockId)
                    )
                )
                .returning();
            return updatedItem;
        } else {
            const [newItem] = await db
                .insert(portfolios)
                .values({
                    userId,
                    stockId,
                    quantity,
                    averageBuyPrice
                })
                .returning();
            return newItem;
        }
    }

    // Transaction operations
    async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
        const [transaction] = await db
            .insert(transactions)
            .values(insertTransaction)
            .returning();
        return transaction;
    }

    async getUserTransactions(userId: number, limit: number = 10): Promise<Transaction[]> {
        return db
            .select()
            .from(transactions)
            .where(eq(transactions.userId, userId))
            .orderBy(desc(transactions.createdAt))
            .limit(limit);
    }

    // Trade operations
    async executeTrade(userId: number, tradeOrder: TradeOrder): Promise<Transaction> {
        const { stockId, type, quantity, price } = tradeOrder;
        const total = quantity * price;

        // Get user
        const user = await this.getUser(userId);
        if (!user) throw new Error("User not found");

        // Get stock
        const stock = await this.getStock(stockId);
        if (!stock) throw new Error("Stock not found");

        // Get existing portfolio item if any
        const portfolioItem = await this.getPortfolioItem(userId, stockId);

        // Start a transaction to ensure everything succeeds or fails together
        try {
            // Check if user has enough funds or stocks
            if (type === "BUY") {
                if (user.walletBalance < total) {
                    throw new Error("Insufficient wallet balance");
                }

                // Update user's wallet balance
                await this.updateUserWalletBalance(userId, user.walletBalance - total);

                // Update or create portfolio item
                const currentQuantity = portfolioItem?.quantity || 0;
                const currentTotal = portfolioItem?.quantity * portfolioItem?.averageBuyPrice || 0;
                const newQuantity = currentQuantity + quantity;
                const newTotal = currentTotal + total;
                const newAveragePrice = newTotal / newQuantity;

                await this.updatePortfolioItem(userId, stockId, newQuantity, newAveragePrice);
            } else if (type === "SELL") {
                // Check if user has enough shares
                if (!portfolioItem || portfolioItem.quantity < quantity) {
                    throw new Error("Insufficient shares to sell");
                }

                // Update user's wallet balance
                await this.updateUserWalletBalance(userId, user.walletBalance + total);

                // Update portfolio item
                const newQuantity = portfolioItem.quantity - quantity;

                if (newQuantity > 0) {
                    await this.updatePortfolioItem(userId, stockId, newQuantity, portfolioItem.averageBuyPrice);
                } else {
                    // Remove portfolio item if quantity becomes 0
                    await db
                        .delete(portfolios)
                        .where(
                            and(
                                eq(portfolios.userId, userId),
                                eq(portfolios.stockId, stockId)
                            )
                        );
                }
            } else {
                throw new Error("Invalid trade type");
            }

            // Create transaction record
            return this.createTransaction({
                userId,
                stockId,
                type,
                quantity,
                price,
                total,
                status: "COMPLETED"
            });
        } catch (error) {
            // Create failed transaction record
            await this.createTransaction({
                userId,
                stockId,
                type,
                quantity,
                price,
                total,
                status: "FAILED"
            });

            throw error;
        }
    }

    // Leaderboard
    async getLeaderboard(limit: number = 10): Promise<{ userId: number, username: string, portfolioValue: number }[]> {
        // This query calculates the total portfolio value for each user
        const portfolioValues = await db.execute(sql`
      SELECT 
        u.id as user_id, 
        u.username, 
        COALESCE(SUM(p.quantity * s.current_price), 0) + u.wallet_balance as portfolio_value
      FROM 
        users u
      LEFT JOIN 
        portfolios p ON u.id = p.user_id
      LEFT JOIN 
        stocks s ON p.stock_id = s.id
      GROUP BY 
        u.id, u.username
      ORDER BY 
        portfolio_value DESC
      LIMIT 
        ${limit}
    `);

        return portfolioValues.rows.map((row: any) => ({
            userId: row.user_id,
            username: row.username,
            portfolioValue: parseFloat(row.portfolio_value)
        }));
    }
}

export const storage = new DatabaseStorage();

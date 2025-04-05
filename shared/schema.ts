import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, foreignKey, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    walletBalance: doublePrecision("wallet_balance").notNull().default(100000),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
    portfolios: many(portfolios),
    transactions: many(transactions),
}));

// Stocks table
export const stocks = pgTable("stocks", {
    id: serial("id").primaryKey(),
    symbol: text("symbol").notNull().unique(),
    name: text("name").notNull(),
    currentPrice: doublePrecision("current_price").notNull(),
    previousClose: doublePrecision("previous_close").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stocksRelations = relations(stocks, ({ many }) => ({
    priceHistory: many(stockPriceHistory),
    portfolios: many(portfolios),
    transactions: many(transactions),
}));

// Stock price history table
export const stockPriceHistory = pgTable("stock_price_history", {
    id: serial("id").primaryKey(),
    stockId: integer("stock_id").notNull().references(() => stocks.id),
    price: doublePrecision("price").notNull(),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const stockPriceHistoryRelations = relations(stockPriceHistory, ({ one }) => ({
    stock: one(stocks, {
        fields: [stockPriceHistory.stockId],
        references: [stocks.id],
    }),
}));

// Portfolios table (for user holdings)
export const portfolios = pgTable("portfolios", {
    id: serial("id"),
    userId: integer("user_id").notNull().references(() => users.id),
    stockId: integer("stock_id").notNull().references(() => stocks.id),
    quantity: integer("quantity").notNull(),
    averageBuyPrice: doublePrecision("average_buy_price").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
    return {
        userStockPk: primaryKey({ columns: [table.userId, table.stockId] }),
    };
});

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
    user: one(users, {
        fields: [portfolios.userId],
        references: [users.id],
    }),
    stock: one(stocks, {
        fields: [portfolios.stockId],
        references: [stocks.id],
    }),
}));

// Transactions table
export const transactions = pgTable("transactions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    stockId: integer("stock_id").notNull().references(() => stocks.id),
    type: text("type", { enum: ["BUY", "SELL"] }).notNull(),
    quantity: integer("quantity").notNull(),
    price: doublePrecision("price").notNull(),
    total: doublePrecision("total").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    status: text("status", { enum: ["COMPLETED", "FAILED", "PENDING"] }).notNull().default("COMPLETED"),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
    user: one(users, {
        fields: [transactions.userId],
        references: [users.id],
    }),
    stock: one(stocks, {
        fields: [transactions.stockId],
        references: [stocks.id],
    }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});

export const insertStockSchema = createInsertSchema(stocks).pick({
    symbol: true,
    name: true,
    currentPrice: true,
    previousClose: true,
});

export const insertStockPriceHistorySchema = createInsertSchema(stockPriceHistory).pick({
    stockId: true,
    price: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).pick({
    userId: true,
    stockId: true,
    quantity: true,
    averageBuyPrice: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
    userId: true,
    stockId: true,
    type: true,
    quantity: true,
    price: true,
    total: true,
    status: true,
});

export const tradeOrderSchema = z.object({
    stockId: z.number(),
    type: z.enum(["BUY", "SELL"]),
    quantity: z.number().positive(),
    price: z.number().positive(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;

export type InsertStockPriceHistory = z.infer<typeof insertStockPriceHistorySchema>;
export type StockPriceHistory = typeof stockPriceHistory.$inferSelect;

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type TradeOrder = z.infer<typeof tradeOrderSchema>;

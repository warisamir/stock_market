import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { StockSimulator } from "./stocksimulator";
import { tradeOrderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
    // Set up authentication routes
    setupAuth(app);

    // Initialize stock simulator
    const stockSimulator = new StockSimulator();
    await stockSimulator.initialize();
    stockSimulator.start();

    // Middleware to check if user is authenticated
    const isAuthenticated = (req: any, res: any, next: any) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.status(401).json({ message: "Unauthorized" });
    };

    // API Routes

    // Stocks endpoints
    app.get("/api/stocks", async (req, res, next) => {
        try {
            const stocks = await storage.getAllStocks();
            res.json(stocks);
        } catch (error) {
            next(error);
        }
    });

    app.get("/api/stocks/:id", async (req, res, next) => {
        try {
            const stockId = parseInt(req.params.id);
            const stock = await storage.getStock(stockId);

            if (!stock) {
                return res.status(404).json({ message: "Stock not found" });
            }

            res.json(stock);
        } catch (error) {
            next(error);
        }
    });

    app.get("/api/stocks/:id/history", async (req, res, next) => {
        try {
            const stockId = parseInt(req.params.id);
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

            const priceHistory = await storage.getStockPriceHistory(stockId, limit);
            res.json(priceHistory);
        } catch (error) {
            next(error);
        }
    });

    // Portfolio endpoints (protected)
    app.get("/api/portfolio", isAuthenticated, async (req, res, next) => {
        try {
            const userId = req.user!.id;
            const portfolioItems = await storage.getPortfolio(userId);

            // Get stock details for each portfolio item
            const portfolioWithStocks = await Promise.all(
                portfolioItems.map(async (item) => {
                    const stock = await storage.getStock(item.stockId);
                    return {
                        ...item,
                        stock,
                        currentValue: stock ? stock.currentPrice * item.quantity : 0,
                        profitLoss: stock
                            ? (stock.currentPrice - item.averageBuyPrice) * item.quantity
                            : 0,
                        profitLossPercentage: stock
                            ? ((stock.currentPrice - item.averageBuyPrice) / item.averageBuyPrice) * 100
                            : 0
                    };
                })
            );

            res.json(portfolioWithStocks);
        } catch (error) {
            next(error);
        }
    });

    // Transactions endpoints (protected)
    app.get("/api/transactions", isAuthenticated, async (req, res, next) => {
        try {
            const userId = req.user!.id;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            const transactions = await storage.getUserTransactions(userId, limit);

            // Get stock details for each transaction
            const transactionsWithStocks = await Promise.all(
                transactions.map(async (transaction) => {
                    const stock = await storage.getStock(transaction.stockId);
                    return {
                        ...transaction,
                        stock
                    };
                })
            );

            res.json(transactionsWithStocks);
        } catch (error) {
            next(error);
        }
    });

    // Trade endpoint (protected)
    app.post("/api/trade", isAuthenticated, async (req, res, next) => {
        try {
            const userId = req.user!.id;

            // Validate trade order
            const validationResult = tradeOrderSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    message: "Invalid trade order",
                    errors: validationResult.error.format()
                });
            }

            // Execute trade
            const transaction = await storage.executeTrade(userId, validationResult.data);
            res.status(201).json(transaction);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                next(error);
            }
        }
    });

    // Leaderboard endpoint
    app.get("/api/leaderboard", async (req, res, next) => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const leaderboard = await storage.getLeaderboard(limit);
            res.json(leaderboard);
        } catch (error) {
            next(error);
        }
    });

    // Get portfolio summary with total value
    app.get("/api/portfolio/summary", isAuthenticated, async (req, res, next) => {
        try {
            const userId = req.user!.id;
            const user = await storage.getUser(userId);
            const portfolioItems = await storage.getPortfolio(userId);

            // Calculate total value and profit/loss
            let totalInvestedValue = 0;
            let totalCurrentValue = 0;

            for (const item of portfolioItems) {
                const stock = await storage.getStock(item.stockId);
                if (stock) {
                    totalInvestedValue += item.averageBuyPrice * item.quantity;
                    totalCurrentValue += stock.currentPrice * item.quantity;
                }
            }

            // Add wallet balance to total value
            const walletBalance = user?.walletBalance || 0;
            const totalValue = totalCurrentValue + walletBalance;

            const profitLoss = totalCurrentValue - totalInvestedValue;
            const profitLossPercentage = totalInvestedValue > 0
                ? (profitLoss / totalInvestedValue) * 100
                : 0;

            // Calculate asset allocation
            const assetAllocation = await Promise.all(
                portfolioItems.map(async (item) => {
                    const stock = await storage.getStock(item.stockId);
                    if (!stock) return null;

                    const value = stock.currentPrice * item.quantity;
                    const percentage = totalCurrentValue > 0
                        ? (value / totalCurrentValue) * 100
                        : 0;

                    return {
                        stockId: item.stockId,
                        symbol: stock.symbol,
                        name: stock.name,
                        value,
                        percentage
                    };
                })
            );

            // Filter out null values
            const filteredAssetAllocation = assetAllocation.filter(
                item => item !== null
            ) as { stockId: number, symbol: string, name: string, value: number, percentage: number }[];

            res.json({
                totalInvestedValue,
                totalCurrentValue,
                totalValue,
                walletBalance,
                profitLoss,
                profitLossPercentage,
                assetAllocation: filteredAssetAllocation
            });
        } catch (error) {
            next(error);
        }
    });

    const httpServer = createServer(app);

    return httpServer;
}

import { Stock, InsertStock } from "@shared/schema";
import { storage } from "./storage";
import { log } from "./vite";

// Initial stock data
const initialStocks: Omit<InsertStock, "previousClose">[] = [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd.", currentPrice: 2540.75 },
    { symbol: "TCS", name: "Tata Consultancy Services Ltd.", currentPrice: 3421.30 },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", currentPrice: 1678.20 },
    { symbol: "INFY", name: "Infosys Ltd.", currentPrice: 1452.85 },
    { symbol: "TATASTEEL", name: "Tata Steel Ltd.", currentPrice: 126.40 },
    { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd.", currentPrice: 875.60 },
    { symbol: "ITC", name: "ITC Ltd.", currentPrice: 435.25 },
    { symbol: "WIPRO", name: "Wipro Ltd.", currentPrice: 425.50 },
    { symbol: "SBIN", name: "State Bank of India", currentPrice: 625.75 },
    { symbol: "MARUTI", name: "Maruti Suzuki India Ltd.", currentPrice: 10245.60 },
    { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd.", currentPrice: 1120.35 },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", currentPrice: 963.45 },
    { symbol: "AXISBANK", name: "Axis Bank Ltd.", currentPrice: 1023.70 },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd.", currentPrice: 1745.20 },
    { symbol: "POWERGRID", name: "Power Grid Corporation of India Ltd.", currentPrice: 245.80 },
    { symbol: "ASIANPAINT", name: "Asian Paints Ltd.", currentPrice: 3145.65 },
    { symbol: "ADANIPORTS", name: "Adani Ports and Special Economic Zone Ltd.", currentPrice: 875.40 },
    { symbol: "TECHM", name: "Tech Mahindra Ltd.", currentPrice: 1256.90 },
    { symbol: "TITAN", name: "Titan Company Ltd.", currentPrice: 3256.75 },
    { symbol: "HCLTECH", name: "HCL Technologies Ltd.", currentPrice: 1175.50 }
];

// Function to generate a random price change factor between -3% and 3%
function getRandomPriceChangeFactor(): number {
    return (Math.random() * 6 - 3) / 100; // Between -0.03 and 0.03
}

export class StockSimulator {
    private interval: NodeJS.Timeout | null = null;
    private stocks: Stock[] = [];

    constructor(private updateInterval: number = 60000) { } // Default 1 minute

    async initialize() {
        try {
            // Get existing stocks from DB
            this.stocks = await storage.getAllStocks();

            // If no stocks exist, seed the database
            if (this.stocks.length === 0) {
                log("No stocks found in database. Seeding with initial stock data...", "StockSimulator");
                await this.seedStocks();
            } else {
                log(`Loaded ${this.stocks.length} stocks from database`, "StockSimulator");
            }
        } catch (error) {
            log(`Error initializing stock simulator: ${(error as Error).message}`, "StockSimulator");
        }
    }

    private async seedStocks() {
        try {
            for (const stockData of initialStocks) {
                const stock = await storage.createStock({
                    ...stockData,
                    previousClose: stockData.currentPrice
                });
                this.stocks.push(stock);

                // Add initial price history entry
                await storage.addStockPriceHistory({
                    stockId: stock.id,
                    price: stock.currentPrice
                });
            }
            log(`Seeded database with ${initialStocks.length} stocks`, "StockSimulator");
        } catch (error) {
            log(`Error seeding stocks: ${(error as Error).message}`, "StockSimulator");
        }
    }

    start() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        // Immediately update prices once
        this.updatePrices();

        // Set interval for future updates
        this.interval = setInterval(() => this.updatePrices(), this.updateInterval);
        log(`Stock simulator started. Updating prices every ${this.updateInterval / 1000} seconds`, "StockSimulator");
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            log("Stock simulator stopped", "StockSimulator");
        }
    }

    private async updatePrices() {
        try {
            log("Updating stock prices...", "StockSimulator");

            for (const stock of this.stocks) {
                // Generate a random price change factor
                const changeFactor = getRandomPriceChangeFactor();

                // Calculate new price (ensure it's never negative)
                const newPrice = Math.max(stock.currentPrice * (1 + changeFactor), 0.01);
                const roundedPrice = Math.round(newPrice * 100) / 100; // Round to 2 decimal places

                // Update stock price in database
                const updatedStock = await storage.updateStockPrice(stock.id, roundedPrice);

                // Add to price history
                await storage.addStockPriceHistory({
                    stockId: stock.id,
                    price: roundedPrice
                });

                // Update local cache
                const index = this.stocks.findIndex(s => s.id === stock.id);
                if (index !== -1) {
                    this.stocks[index] = updatedStock;
                }
            }

            log("Stock prices updated successfully", "StockSimulator");
        } catch (error) {
            log(`Error updating stock prices: ${(error as Error).message}`, "StockSimulator");
        }
    }
}

package com.pricetracker.engine;

import com.pricetracker.database.DatabaseManager;
import com.pricetracker.model.Product;
import com.pricetracker.scrapers.AmazonScraper;
import com.pricetracker.scrapers.FlipkartScraper;
import com.pricetracker.scrapers.RelianceScraper;
import com.pricetracker.scrapers.CromaScraper;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeMap;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class EngineManager {
    private final ExecutorService executorService = Executors.newFixedThreadPool(4);
    private final DatabaseManager databaseManager = new DatabaseManager();

    public TreeMap<Double, Product> executeSearch(String searchKeyword) {
        TreeMap<Double, Product> sortedResults = new TreeMap<>();
        List<Callable<Product>> tasks = List.of(
            new AmazonScraper(searchKeyword),
            new FlipkartScraper(searchKeyword),
            new RelianceScraper(searchKeyword),
            new CromaScraper(searchKeyword)
        );

        try {
            List<Future<Product>> futures = new ArrayList<>();
            for (Callable<Product> task : tasks) futures.add(executorService.submit(task));

            for (Future<Product> future : futures) {
                try {
                    Product result = future.get();
                    if (result != null && Double.isFinite(result.getPrice()) && result.getPrice() < Double.MAX_VALUE) {
                        double key = result.getPrice();
                        while (sortedResults.containsKey(key)) key = Math.nextUp(key);
                        sortedResults.put(key, result);
                        databaseManager.savePriceHistory(result);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    System.err.println("Scraper interrupted: " + e.getMessage());
                } catch (ExecutionException e) {
                    System.err.println("Scraper failed: " + e.getCause());
                }
            }
        } catch (Exception e) {
            System.err.println("Search engine error: " + e.getMessage());
        }
        return sortedResults;
    }
}

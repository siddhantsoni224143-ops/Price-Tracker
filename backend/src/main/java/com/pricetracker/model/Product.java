package com.pricetracker.model;

import org.json.JSONObject;

public class Product implements Comparable<Product> {
    private String name;
    private double price;
    private String platform;
    private String url;
    private String seller;
    private String stock;
    private String sku;

    public Product(String name, double price, String platform, String url) {
        this(name, price, platform, url, "Unknown", "Unknown", "");
    }

    public Product(String name, double price, String platform, String url, String seller, String stock, String sku) {
        this.name = name == null ? "" : name;
        this.price = price;
        this.platform = platform == null ? "Unknown" : platform;
        this.url = url == null ? "" : url;
        this.seller = seller == null || seller.isBlank() ? "Unknown" : seller;
        this.stock = stock == null || stock.isBlank() ? "Unknown" : stock;
        this.sku = sku == null ? "" : sku;
    }

    public String getName() { return name; }
    public double getPrice() { return price; }
    public String getPlatform() { return platform; }
    public String getUrl() { return url; }
    public String getSeller() { return seller; }
    public String getStock() { return stock; }
    public String getSku() { return sku; }

    public JSONObject toJSON() {
        JSONObject json = new JSONObject();
        json.put("name", name);
        json.put("price", price);
        json.put("platform", platform);
        json.put("url", url);
        json.put("seller", seller);
        json.put("stock", stock);
        json.put("sku", sku);
        return json;
    }

    @Override
    public int compareTo(Product other) {
        return Double.compare(this.price, other.price);
    }

    @Override
    public String toString() {
        return platform + ": " + name + " - ₹" + price + " - Seller: " + seller + " - Stock: " + stock;
    }
}

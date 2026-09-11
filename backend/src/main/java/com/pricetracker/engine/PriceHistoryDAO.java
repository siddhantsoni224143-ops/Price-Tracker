package com.pricetracker.engine;

import com.pricetracker.model.Product;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PriceHistoryDAO {
    private static final String DB_URL = "jdbc:sqlite:price_history.db";

    public List<Product> getHistory(String title) {
        List<Product> history = new ArrayList<>();
        String sql = "SELECT product_name, price, platform, url, seller, stock, sku "
                   + "FROM price_history WHERE product_name LIKE ? ORDER BY scraped_at DESC LIMIT 50";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, "%" + title + "%");
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    history.add(new Product(
                        rs.getString("product_name"),
                        rs.getDouble("price"),
                        rs.getString("platform"),
                        rs.getString("url"),
                        rs.getString("seller"),
                        rs.getString("stock"),
                        rs.getString("sku")
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Query Error: " + e.getMessage());
        }
        return history;
    }
}

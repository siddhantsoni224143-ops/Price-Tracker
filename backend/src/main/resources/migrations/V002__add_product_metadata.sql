ALTER TABLE price_history ADD COLUMN seller TEXT DEFAULT 'Unknown';
ALTER TABLE price_history ADD COLUMN stock TEXT DEFAULT 'Unknown';
ALTER TABLE price_history ADD COLUMN sku TEXT DEFAULT '';

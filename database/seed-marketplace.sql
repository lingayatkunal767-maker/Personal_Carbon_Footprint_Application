-- Marketplace Sample Products
-- Insert eco-friendly products

INSERT INTO products (name, description, category, price, eco_points_price, carbon_saving, image_url, stock_quantity, is_active, rating, review_count, sustainability_score, vendor) VALUES
-- REUSABLE category
('Stainless Steel Water Bottle', 'Insulated 750ml bottle, keeps drinks hot/cold for 12 hours. Eliminates single-use plastic bottles.', 'REUSABLE', 24.99, 200, 156.0, '/images/water-bottle.jpg', 50, true, 4.7, 128, 9.5, 'EcoLife'),
('Reusable Shopping Bags Set', 'Set of 5 durable mesh bags for grocery shopping. Machine washable.', 'REUSABLE', 15.99, 120, 52.0, '/images/shopping-bags.jpg', 75, true, 4.5, 89, 9.0, 'GreenCart'),
('Bamboo Utensil Set', 'Travel cutlery set with bamboo fork, spoon, knife, and chopsticks. Includes carrying case.', 'REUSABLE', 12.99, 100, 12.5, '/images/bamboo-utensils.jpg', 100, true, 4.6, 156, 8.8, 'BambooLife'),
('Silicone Food Storage Bags', 'Set of 4 reusable silicone bags. Freezer and microwave safe. Replaces 1000+ plastic bags.', 'REUSABLE', 29.99, 240, 85.0, '/images/silicone-bags.jpg', 40, true, 4.8, 203, 9.3, 'EcoStore'),

-- ENERGY_EFFICIENT category
('LED Smart Bulb 4-Pack', 'WiFi-enabled LED bulbs, 75W equivalent. 15,000 hour lifespan. Uses 80% less energy.', 'ENERGY_EFFICIENT', 34.99, 280, 312.0, '/images/led-bulbs.jpg', 60, true, 4.4, 92, 8.5, 'SmartHome'),
('Solar Phone Charger', 'Portable 20,000mAh solar power bank. Charges 2 devices simultaneously.', 'ENERGY_EFFICIENT', 39.99, 320, 45.0, '/images/solar-charger.jpg', 35, true, 4.3, 67, 8.0, 'SolarTech'),
('Smart Power Strip', 'Energy monitoring power strip with individual outlet control. Prevents vampire power drain.', 'ENERGY_EFFICIENT', 44.99, 360, 125.0, '/images/power-strip.jpg', 45, true, 4.6, 134, 8.7, 'SmartHome'),
('Insulated Window Film', 'Heat-retaining window film. Reduces heating costs by 30%. 5m roll.', 'ENERGY_EFFICIENT', 54.99, 440, 520.0, '/images/window-film.jpg', 25, true, 4.5, 78, 9.2, 'EnergySaver'),

-- SUSTAINABLE_FASHION category
('Organic Cotton T-Shirt', '100% organic cotton, fair trade certified. Available in 5 colors.', 'SUSTAINABLE_FASHION', 29.99, 240, 8.5, '/images/organic-tshirt.jpg', 80, true, 4.7, 145, 9.0, 'EcoWear'),
('Recycled Polyester Jacket', 'Made from 20 recycled plastic bottles. Water-resistant and breathable.', 'SUSTAINABLE_FASHION', 89.99, 720, 24.0, '/images/recycled-jacket.jpg', 30, true, 4.8, 98, 9.5, 'GreenThreads'),
('Hemp Sneakers', 'Casual sneakers made from hemp fiber and natural rubber. Zero plastic.', 'SUSTAINABLE_FASHION', 64.99, 520, 15.6, '/images/hemp-sneakers.jpg', 40, true, 4.6, 112, 8.9, 'EcoFootwear'),
('Bamboo Socks 6-Pack', 'Soft, breathable socks made from bamboo fiber. Anti-bacterial and moisture-wicking.', 'SUSTAINABLE_FASHION', 24.99, 200, 6.2, '/images/bamboo-socks.jpg', 90, true, 4.5, 187, 8.5, 'ComfortSocks'),

-- ORGANIC_FOOD category
('Organic Coffee Beans 1kg', 'Single-origin fair trade coffee. Dark roast. Carbon-neutral shipping.', 'ORGANIC_FOOD', 22.99, 184, 3.5, '/images/coffee-beans.jpg', 70, true, 4.9, 234, 9.2, 'GreenBean'),
('Organic Fruit & Veggie Box', 'Weekly subscription box with seasonal organic produce. Local farm sourced.', 'ORGANIC_FOOD', 45.00, 360, 12.8, '/images/veggie-box.jpg', 999, true, 4.8, 421, 9.5, 'FarmFresh'),
('Plant-Based Protein Powder', 'Organic pea and rice protein blend. 30 servings. Vegan and gluten-free.', 'ORGANIC_FOOD', 34.99, 280, 18.5, '/images/protein-powder.jpg', 55, true, 4.6, 156, 8.8, 'PlantPower'),

-- ECO_TRANSPORT category
('Folding Electric Bike', 'Compact e-bike with 40km range. Perfect for urban commuting. Eliminates car trips.', 'ECO_TRANSPORT', 1299.99, 10400, 2600.0, '/images/ebike.jpg', 8, true, 4.7, 43, 9.8, 'EcoRide'),
('Bicycle Repair Kit', 'Complete toolkit with tire levers, patches, multi-tool, and pump.', 'ECO_TRANSPORT', 29.99, 240, 5.2, '/images/bike-repair.jpg', 50, true, 4.4, 89, 7.5, 'CycleMaster'),
('Electric Scooter', 'Foldable e-scooter with 25km range. Top speed 25km/h. App-controlled.', 'ECO_TRANSPORT', 449.99, 3600, 850.0, '/images/escooter.jpg', 15, true, 4.5, 67, 9.3, 'ScootSmart'),

-- HOME_GARDEN category
('Composting Bin', 'Indoor kitchen compost bin with charcoal filter. Reduces food waste.', 'HOME_GARDEN', 39.99, 320, 180.0, '/images/compost-bin.jpg', 40, true, 4.7, 167, 9.4, 'GreenHome'),
('Indoor Herb Garden Kit', 'Self-watering planter with LED grow light. Grow basil, mint, parsley at home.', 'HOME_GARDEN', 79.99, 640, 25.0, '/images/herb-garden.jpg', 28, true, 4.8, 234, 8.9, 'UrbanGarden'),
('Rainwater Collection Barrel', '200L capacity rain barrel with spigot. Reduces water consumption for gardening.', 'HOME_GARDEN', 119.99, 960, 420.0, '/images/rain-barrel.jpg', 12, true, 4.6, 45, 9.6, 'WaterWise'),
('Native Plant Seed Kit', 'Collection of 10 native wildflower species. Supports local pollinators.', 'HOME_GARDEN', 18.99, 152, 8.5, '/images/seed-kit.jpg', 85, true, 4.5, 98, 9.1, 'NativeSeeds');

---
name: swadam-foods
description: Search, browse, and order authentic Maharashtrian snacks and instant breakfast premixes from Swadam Foods in Pune.
version: 1.0.0
author: Swadam Foods
---

# Swadam Foods Agent Skill

Use this skill to look up traditional Indian delicacies, check ingredient & pricing details, compute shipping rates for Pune, and facilitate order placement.

## Products Offered

1. **Patal Poha Chivda**
   - Weight: 200 g
   - Price: ₹90
   - Description: Thin, crispy flattened rice tossed with roasted peanuts, curry leaves, and traditional spices. Ready to eat.

2. **Instant Kanda Poha Premix**
   - Weight: 150 g
   - Price: ₹70
   - Description: Authentic Maharashtrian onion poha breakfast premix. Add boiling water (1:2 ratio), cover for 5 minutes, and enjoy.

3. **Instant Upma Premix**
   - Weight: 150 g
   - Price: ₹70
   - Description: Fragrant, roasted semolina premix with mustard seeds, ginger, and curry leaves. Ready in 5 minutes with boiling water.

## API Endpoints

- **List Products**: `GET https://swadamfoods.eu.cc/api/products`
- **Service Status**: `GET https://swadamfoods.eu.cc/api/status`
- **Create Order**: `POST https://swadamfoods.eu.cc/api/orders`
- **Track Order**: `GET https://swadamfoods.eu.cc/api/orders/{id}`

## Delivery Options

- Standard Home Delivery in Pune: Flat ₹50
- Express / Custom Distance (Porter): Dynamic by distance

# Product Carousel in Chat - Implementation Guide

## Overview
The chat system now displays matching products in an interactive carousel format when the AI recommends relevant products. Users can browse through suggested products directly in the chat interface.

## Changes Made

### 1. **Backend - `controllers/chatCtrl.js`**

#### New Feature: Product Extraction
```javascript
// Extract product IDs from AI response and fetch matching products
let suggestedProducts = [];
try {
    // Look for product titles in the AI response
    const productTitles = products
        .filter(p => p.inventory > 0)
        .map(p => p.title);
    
    suggestedProducts = products.filter(p => 
        p.inventory > 0 && 
        aiMessage.toLowerCase().includes(p.title.toLowerCase())
    ).slice(0, 5); // Limit to 5 products
} catch (err) {
    console.error('Error extracting products:', err);
}
```

**What it does:**
- Scans AI response for product titles mentioned
- Filters products that have inventory > 0
- Returns up to 5 matching products
- Handles errors gracefully

**API Response Format:**
```json
{
  "status": "success",
  "message": "AI recommendation text here...",
  "session_id": "session_xxxx",
  "products": [
    {
      "id": "mongodb_id",
      "product_id": "prod_001",
      "title": "Áo khoác dạ mùa đông",
      "brand": "Brand Name",
      "category": "Outerwear",
      "price": 599000,
      "description": "...",
      "inventory": 25,
      "images": {
        "url": "image_url"
      },
      "variants": [
        {
          "sku": "SKU123",
          "attributes": { "color": "black", "size": "M" },
          "price": 599000,
          "inventory": 10
        }
      ]
    }
  ]
}
```

### 2. **Frontend API - `client/src/api/ChatAPI.js`**

#### Updated Message Structure
```javascript
// Add AI response with products
const aiMsg = {
    role: 'assistant',
    content: res.data.message,
    products: res.data.products || [],  // ← NEW
    timestamp: new Date()
}
```

**Message Object Format:**
```javascript
{
  role: 'assistant',
  content: 'Recommendation text...',
  products: [/* array of product objects */],
  timestamp: Date
}
```

### 3. **UI Component - `client/src/components/mainpages/chat/ChatBubble.js`**

#### New ProductCarousel Component
```javascript
<ProductCarousel products={products} />
```

**Features:**
- ✅ Horizontal product carousel with image
- ✅ Product details (title, brand, price, inventory)
- ✅ Variant information (color, size, etc.)
- ✅ Navigation controls (prev/next buttons)
- ✅ Current position indicator (e.g., "2 / 5")
- ✅ Responsive design
- ✅ Smooth animations

**Product Display Includes:**
- Product image with fallback
- Product title and brand
- Description (truncated to 80 chars)
- Price in Vietnamese currency format
- Inventory status
- Available variants (up to 3 shown, +N for rest)

#### Updated Message Rendering
```javascript
{msg.role === "assistant" && msg.products && msg.products.length > 0 && (
  <div className="message-products">
    <ProductCarousel products={msg.products} />
  </div>
)}
```

### 4. **Styling - `client/src/components/mainpages/chat/chatBubble.css`**

#### New CSS Classes for Product Carousel

**Main Container:**
- `.product-carousel` - Card wrapper with shadow
- `.product-carousel-container` - Flexbox layout

**Image Section:**
- `.product-image-wrapper` - Image container (100x100px)
- `.product-image` - Actual image
- `.product-image-placeholder` - Fallback icon

**Info Section:**
- `.product-info` - Product details container
- `.product-title` - Product name (truncated)
- `.product-brand` - Brand name in purple
- `.product-description` - 2-line description
- `.product-meta` - Price & inventory row

**Price & Inventory:**
- `.product-price` - Red price with background
- `.product-inventory` - Green inventory status

**Variants:**
- `.product-variants` - Variants container
- `.variant-label` - "Variants:" label
- `.variant-list` - Variants in a row
- `.variant-tag` - Individual variant (purple gradient)
- `.variant-more` - "+N more" indicator

**Controls:**
- `.carousel-controls` - Navigation bar
- `.carousel-btn` - Prev/Next buttons (hover effects)
- `.carousel-indicator` - "X / Y" counter

#### Color Scheme
- Primary Gradient: `#667eea (purple) → #764ba2 (violet)`
- Price: `#ff6b6b (red)`
- Inventory: `#10b981 (green)`
- Brand: `#667eea (purple)`
- Text: `#1f2937 (dark gray)`

#### Animations
- **slideInUp**: 0.3s ease-out for carousel appearance
- **Hover effects** on buttons with scale transformation
- **Smooth transitions** on all interactive elements

## How It Works

### User Flow:
1. User asks: *"Mình đang cần tìm trang phục công sở phù hợp cho mùa đông"*
2. Frontend sends message to `/api/chat`
3. Backend:
   - Gets all products & categories
   - Sends full catalog JSON to Gemini AI
   - AI recommends products from catalog
   - Backend extracts product titles from AI response
   - Fetches matching product objects (max 5)
   - Returns response with `products` array
4. Frontend:
   - Receives response with products
   - Stores in message object
   - Renders ProductCarousel component
   - User sees products with navigate buttons

### Product Matching Logic:
```javascript
// Matches if:
// 1. Product has inventory > 0
// 2. Product title appears in AI response (case-insensitive)
// 3. Limited to 5 products max

suggestedProducts = products.filter(p => 
    p.inventory > 0 && 
    aiMessage.toLowerCase().includes(p.title.toLowerCase())
).slice(0, 5);
```

## Example Conversation

**User:** "Tôi cần áo sơ mi công sở mùa hè"

**AI:** "Tuyệt vời! Tôi có vài gợi ý áo sơ mi công sở phù hợp cho mùa hè:"

**Product Carousel Shows:**
```
┌─────────────────────────────────┐
│ [Image]  Áo sơ mi cotton nam    │
│          Brand: ABC             │
│          Suitable for office    │
│          299,000đ ✓ 15 available│
│          [Black] [Blue] [White] │
└─────────────────────────────────┘
[◀] 1 / 3 [▶]
```

User can click `[▶]` to see next product.

## Future Enhancements

1. **Product Links**: Click product to view full details page
2. **Quick Add to Cart**: Add to cart from carousel
3. **Wishlist**: Save favorite products
4. **Reviews**: Show product ratings
5. **Stock Alerts**: Notify when product back in stock
6. **Recommendation Confidence**: Show AI confidence score
7. **Smart Filtering**: Filter by price, brand, etc.

## Troubleshooting

### Products Not Showing?
- ✅ Check AI response includes product titles exactly as in database
- ✅ Verify products have `inventory > 0`
- ✅ Check browser console for errors

### Images Not Loading?
- ✅ Verify `images.url` field in product data
- ✅ Check image URLs are valid and accessible
- ✅ Placeholder will show if image fails

### Carousel Navigation Issues?
- ✅ Check CSS is loaded correctly
- ✅ Verify no CSS conflicts with other styles
- ✅ Check browser console for errors

## Performance Notes

- **Product Fetch**: Done in backend per message (cached for session)
- **Carousel**: Lightweight CSS animations (GPU accelerated)
- **Memory**: Stored in message objects (cleared on session clear)
- **API Calls**: One call per AI response (already being made)

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (responsive)

## Files Modified

1. `controllers/chatCtrl.js` - Added product extraction logic
2. `client/src/api/ChatAPI.js` - Added products to message object
3. `client/src/components/mainpages/chat/ChatBubble.js` - Added ProductCarousel component
4. `client/src/components/mainpages/chat/chatBubble.css` - Added carousel styles (130+ lines)

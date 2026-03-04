# Product Matching & Display Guide

## Overview
The chat system now automatically extracts product keywords from user messages and returns matching products for display in the chat interface.

## How It Works

### 1. Backend Changes (`controllers/chatCtrl.js`)

#### New Helper Functions

**`extractProductKeywords(message)`**
- Extracts product search parameters from user messages
- Identifies:
  - **Sizes**: XS, S, M, L, XL, XXL
  - **Colors**: đỏ (red), xanh (blue/green), vàng (yellow), đen (black), trắng (white), xám (gray), hồng (pink), cam (orange), tím (purple), nâu (brown)
  - **Product Types**: áo (shirt), quần (pants), đầm (dress), áo khoác (jacket), váy (skirt), giày (shoes)

Returns:
```javascript
{
  sizes: ['M', 'L'],
  colors: ['đỏ', 'xanh'],
  types: ['đầm', 'áo khoác'],
  searchTerms: []
}
```

**`findMatchingProducts(products, keywords, searchMessage)`**
- Matches products based on extracted keywords
- Filters by:
  1. Inventory availability (inventory > 0)
  2. Search message relevance (title, brand, description)
  3. Size variants (if specified)
  4. Color attributes (if specified)
  5. Product type (if specified)
- Returns up to 5 matching products

#### Modified Chat Function
The `/api/chat` endpoint now:
1. Extracts keywords from user message
2. Finds matching products
3. Returns products in the response:
```json
{
  "status": "success",
  "message": "AI response text...",
  "session_id": "session_xxx",
  "products": [
    {
      "_id": "...",
      "product_id": "...",
      "title": "Product Name",
      "brand": "Brand Name",
      "price": 500000,
      "description": "...",
      "inventory": 5,
      "images": { "url": "..." },
      "variants": [...]
    }
  ],
  "keywords": { "sizes": [], "colors": [], "types": [] }
}
```

### 2. Frontend Changes

#### ChatAPI (`client/src/api/ChatAPI.js`)
Already handles products data:
- Receives `products` array from API response
- Stores products in message object: `aiMsg.products = res.data.products || []`
- Updates state with messages containing product data

#### ChatBubble Component (`client/src/components/mainpages/chat/ChatBubble.js`)

**ProductCarousel Component**
- Displays a single product with carousel navigation
- Shows:
  - Product image (or placeholder if no image)
  - Product title & brand
  - Price formatted in Vietnamese (VND)
  - Available inventory count
  - Product variants (color/size options)
- Navigation: Previous/Next buttons to browse products
- Carousel indicator shows current position (e.g., "1/3")

**ChatContent Component**
- Renders each message in the chat
- After each AI message, displays ProductCarousel if products exist
- Message structure:
  ```jsx
  {msg.role === "assistant" && msg.products && msg.products.length > 0 && (
    <div className="message-products">
      <ProductCarousel products={msg.products} />
    </div>
  )}
  ```

### 3. CSS Styling (`client/src/components/mainpages/chat/chatBubble.css`)

#### Product Carousel Styles
- `.product-carousel`: Main container with padding/styling
- `.product-carousel-container`: Flexbox layout for image + info
- `.product-image-wrapper`: Image container with fixed dimensions
- `.product-image`: Responsive image scaling
- `.product-info`: Product details section
- `.product-meta`: Price and inventory display
- `.product-variants`: Variant tags showing color/size options
- `.carousel-controls`: Navigation buttons and indicator
- `.carousel-btn`: Styled navigation buttons
- `.carousel-indicator`: Shows current product / total products

## Usage Examples

### User Input → Product Match

**Example 1: Size & Color Specification**
```
User: "Mình cần đầm dài size M màu đỏ"

Extracted Keywords:
{
  sizes: ['M'],
  colors: ['đỏ'],
  types: ['đầm'],
  searchTerms: ['dài']
}

Result: Returns all dresses with:
- Size M variants available
- Red color in title/description
- Inventory > 0
- Up to 5 products
```

**Example 2: General Category**
```
User: "Tôi cần trang phục công sở cho mùa đông"

Extracted Keywords:
{
  sizes: [],
  colors: [],
  types: ['áo khoác'],
  searchTerms: ['công sở', 'mùa đông']
}

Result: Returns all office-appropriate products
matching "công sở" or "mùa đông" in search
```

**Example 3: Just Color**
```
User: "Có áo xanh không?"

Extracted Keywords:
{
  sizes: [],
  colors: ['xanh'],
  types: ['áo'],
  searchTerms: ['áo']
}

Result: Returns all blue/green shirts with inventory > 0
```

## Response Flow

```
User Message
    ↓
extractProductKeywords()  ← Parse message for size/color/type
    ↓
findMatchingProducts()    ← Find relevant products
    ↓
Gemini AI Response        ← Generate consultant text
    ↓
Return JSON Response      ← Include AI message + products
    ↓
Frontend ChatAPI          ← Receive and store products
    ↓
ChatBubble Component      ← Display message + carousel
    ↓
User Views Products       ← Sees 5 top matching products
```

## Testing

### Test Case 1: Size Specification
```bash
POST /api/chat
{
  "message": "Mình muốn áo size L",
  "session_id": "session_xxx"
}
```
Expected: Returns AI message + all products with L size variants and inventory > 0

### Test Case 2: Color Search
```bash
POST /api/chat
{
  "message": "Có quần đen không",
  "session_id": "session_xxx"
}
```
Expected: Returns AI message + all black pants with inventory > 0

### Test Case 3: Complex Request
```bash
POST /api/chat
{
  "message": "Tôi cần áo khoác màu xám size M cho mùa đông",
  "session_id": "session_xxx"
}
```
Expected: Returns AI message + all gray jackets with M size variants

## Limitations & Future Improvements

### Current Limitations
1. Keyword extraction is regex-based (Vietnamese language only)
2. Color matching looks for exact Vietnamese color words
3. Max 5 products returned per message
4. No fuzzy matching for typos

### Future Improvements
1. NLP-based keyword extraction for better accuracy
2. AI-powered product matching using embeddings
3. Multi-language support (English, Chinese, etc.)
4. Advanced filters (price range, brand preference, rating)
5. Product recommendation based on chat history
6. "Add to Cart" button in carousel
7. Product details modal/drawer
8. User preference learning over time

## Troubleshooting

### No products displayed
- Check if products have `inventory > 0`
- Verify product title/description matches keywords
- Check browser console for errors

### Wrong products returned
- Keywords might not match product attributes
- Product might be out of stock (inventory = 0)
- Try more specific search terms

### Products array is empty
- User might not have mentioned specific criteria
- No products match the search terms
- Products might all be out of stock

## Code References

- Backend: `controllers/chatCtrl.js`
  - Lines 8-104: `buildProductCatalogJson()`
  - Lines 106-167: `extractProductKeywords()`
  - Lines 169-209: `findMatchingProducts()`
  - Lines 211-300: `chat()` function

- Frontend: `client/src/api/ChatAPI.js`
  - Lines 45-53: Product data handling in `sendMessage()`

- Frontend: `client/src/components/mainpages/chat/ChatBubble.js`
  - Lines 8-89: `ProductCarousel` component
  - Lines 147-156: Carousel rendering in chat messages

- Styling: `client/src/components/mainpages/chat/chatBubble.css`
  - Lines 595-720: Product carousel CSS

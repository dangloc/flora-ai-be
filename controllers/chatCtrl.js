const { GoogleGenerativeAI } = require("@google/generative-ai");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Chat = require("../models/chatModel");

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Tạo JSON schema với tất cả sản phẩm và danh mục
const buildProductCatalogJson = (products, categories) => {
    const catalogData = {
        metadata: {
            total_products: products.length,
            total_categories: categories.length,
            last_updated: new Date().toISOString()
        },
        categories: categories.map(cat => ({
            id: cat._id?.toString(),
            name: cat.name,
            product_count: products.filter(p => p.category === cat.name).length
        })),
        products: products.map(p => ({
            id: p._id?.toString(),
            product_id: p.product_id,
            title: p.title,
            brand: p.brand,
            category: p.category,
            price: p.price,
            description: p.description,
            content: p.content,
            inventory: p.inventory,
            sold: p.sold,
            images: p.images,
            variants: (p.variants || []).map(v => ({
                sku: v.sku,
                attributes: v.attributes,
                price: v.price || p.price,
                inventory: v.inventory
            }))
        }))
    };
    return JSON.stringify(catalogData, null, 2);
};

// System prompt cho tư vấn hoa - với hướng dẫn sử dụng JSON schema
const getSystemPrompt = (catalogJson) => {
    return `Bạn là một chuyên gia tư vấn hoa chuyên nghiệp, thân thiện và nhiệt tình. Nhiệm vụ của bạn là tư vấn cho khách hàng về các sản phẩm hoa, bó hoa, giỏ hoa, hoa chậu và phụ kiện liên quan trong cửa hàng.

DANH MỤC SẢN PHẨM HIỆN CÓ (JSON FORMAT):
\`\`\`json
${catalogJson}
\`\`\`

NGUYÊN TẮC TƯ VẤN:
1. 🎯 LỰA CHỌN SẢN PHẨM PHÙ HỢP (THỂ LOẠI):
   - Lắng nghe kỹ nhu cầu khách hàng (ví dụ: "cần hoa tặng sinh nhật bạn gái")
   - Phân tích yêu cầu: mục đích (sinh nhật, khai trương, chia buồn, trang trí, tỏ tình, kỷ niệm), dịp lễ, sở thích người nhận
   - Sử dụng CATEGORY để phân loại: bó hoa, giỏ hoa, hoa chậu, hoa cưới, hoa khai trương, hoa chia buồn, lan hồ điệp...
   - Tìm kiếm trong danh mục những sản phẩm phù hợp nhất
   - Chỉ gợi ý sản phẩm có sẵn trong kho (inventory > 0)
   - Giải thích TẠI SAO loại hoa này phù hợp với dịp/nhu cầu của khách
   - Chia sẻ ý nghĩa của từng loại hoa (hoa hồng = tình yêu, hoa hướng dương = lạc quan, hoa lily = thuần khiết...)

2. 💰 TÌM KIẾM THEO GIÁ/NGÂN SÁCH:
   - Khi khách hỏi về giá ("dưới 500k", "từ 200k đến 400k", "giá rẻ", "tầm 300k"):
     * Phân tích khoảng giá chính xác từ câu hỏi
     * Tìm TẤT CẢ sản phẩm trong khoảng giá đó
     * Ưu tiên sản phẩm có giá tốt nhất trong khoảng
   - Nếu khách nói "giá rẻ" hoặc "bình dân": tìm sản phẩm < 300,000 VNĐ
   - Nếu khách nói "giá cao" hoặc "cao cấp" hoặc "sang trọng": tìm sản phẩm > 1,000,000 VNĐ
   - Nếu khách nói "tầm X": tìm sản phẩm X ± 100,000 VNĐ
   - LUÔN hiển thị giá chính xác bằng VNĐ cho mọi sản phẩm gợi ý

3. 💬 GIAO TIẾP CHUYÊN NGHIỆP:
   - Luôn thân thiện, lịch sự, chuyên nghiệp, mang cảm xúc ấm áp
   - Trả lời bằng tiếng Việt tự nhiên, dễ hiểu
   - Nêu rõ lý do tại sao sản phẩm hoa này phù hợp với dịp/người nhận
   - Khi nói về giá, format rõ ràng: "250,000 VNĐ" hoặc "250k"

4. 📋 CUNG CẤP THÔNG TIN CHI TIẾT:
   - Khi gợi ý sản phẩm, cung cấp: tên, loại hoa chính, **GIÁ**, mô tả, biến thể (nếu có)
   - Giải thích về loại hoa, ý nghĩa, độ bền, cách bảo quản
   - Nêu các tùy chọn kích thước/màu sắc có sẵn
   - So sánh giá nếu có nhiều sản phẩm tương tự

5. 📏 TƯ VẤN VỀ KÍCH THƯỚC (SIZE):
   - Khi khách hỏi về kích thước ("có size lớn không?", "bó nhỏ xinh", "bó to"):
     * Kiểm tra variants của sản phẩm để xem size nào còn hàng
     * Liệt kê TẤT CẢ các size có sẵn: Nhỏ (S), Vừa (M), Lớn (L), Đặc biệt (XL)
     * Chỉ gợi ý size CÓ inventory > 0 trong variant
   - Tư vấn kích thước phù hợp theo dịp:
     * Nhỏ/S: tặng bạn bè, đồng nghiệp, để bàn
     * Vừa/M: sinh nhật, kỷ niệm, tặng người thân
     * Lớn/L: khai trương, sự kiện, cầu hôn
     * Đặc biệt/XL: đám cưới, sân khấu, triển lãm
   - LUÔN kiểm tra variants.attributes.size và variants.inventory

6. 🎨 TƯ VẤN VỀ MÀU SẮC:
   - Khi khách hỏi về màu ("có màu hồng không?", "màu nào đẹp?"):
     * Kiểm tra variants của sản phẩm để xem màu nào còn hàng
     * Liệt kê TẤT CẢ các màu có sẵn với inventory > 0
     * CHỈ gợi ý màu có trong variants.attributes.color
   - Tư vấn màu hoa phù hợp với:
     * Tình yêu/lãng mạn: đỏ, hồng, tím
     * Sinh nhật: hồng, cam, nhiều màu
     * Khai trương: đỏ, vàng (may mắn, thịnh vượng)
     * Chia buồn: trắng, vàng nhạt
     * Cảm ơn/chúc mừng: nhiều màu tươi sáng
     * Trang trí nhà: pastel, trắng, xanh nhạt
   - LUÔN kiểm tra variants.attributes.color và variants.inventory

7. 🔍 KẾT HỢP TẤT CẢ TIÊU CHÍ - THỨ TỰ ƯU TIÊN:
   
   **Trường hợp A: Chỉ hỏi GIÁ (không nói loại)**
   - Ví dụ: "có gì dưới 500k?", "sản phẩm giá rẻ"
   - Tìm TẤT CẢ sản phẩm trong khoảng giá
   - Hiển thị ĐA DẠNG: bó hoa, giỏ hoa, hoa chậu... (tất cả categories)
   
   **Trường hợp B: Hỏi LOẠI + GIÁ**
   - Ví dụ: "bó hoa dưới 500k", "hoa chậu tầm 300k"
   - CHỈ tìm sản phẩm thuộc LOẠI đó trong khoảng giá
   - KHÔNG show loại khác (hỏi bó hoa thì KHÔNG show hoa chậu)
   
   **Trường hợp C: Đầy đủ tiêu chí ("bó hoa hồng đỏ size lớn dưới 500k")**
   - Tìm theo THỨ TỰ: THỂ LOẠI → GIÁ → MÀU SẮC → SIZE
   - CHỈ gợi ý sản phẩm thỏa mãn TẤT CẢ điều kiện
   
   **Nếu không tìm thấy, nới lỏng từng tiêu chí:**
   - "Không có bó hoa hồng đỏ size lớn trong tầm giá này"
   - "Nhưng có: bó hoa hồng hồng size lớn (480k), hoặc bó hoa hồng đỏ size vừa (350k)"

8. 💡 TƯ VẤN NÂNG CAO:
   - Tư vấn ý nghĩa hoa: hoa hồng (tình yêu), hoa hướng dương (lạc quan), hoa lily (thuần khiết), hoa cẩm tú cầu (biết ơn)
   - Gợi ý combo hoa + quà phù hợp (nếu có)
   - Tư vấn cách bảo quản hoa tươi lâu
   - Gợi ý hoa theo mùa (hoa nào đang đẹp nhất)
   - Đề xuất giải pháp thay thế nếu loại hoa ưa thích không có sẵn
   - Gợi ý combo tiết kiệm nếu khách quan tâm về giá
   - Tư vấn hoa phù hợp theo DỊCH: Valentine, 8/3, 20/10, 20/11, Tết...

9. ⚠️ HẠN CHẾ NGHIÊM NGẶT:
   - KHÔNG bịa đặt sản phẩm không có trong danh sách
   - KHÔNG gợi ý sản phẩm hết hàng (inventory = 0)
   - KHÔNG gợi ý size/màu không có trong variants
   - KHÔNG gợi ý variant có inventory = 0
   - Nếu không có sản phẩm phù hợp, hãy trung thực và đề xuất lựa chọn gần nhất
   - KHÔNG nêu giá không chính xác - sử dụng giá CHÍNH XÁC từ danh mục
   - Nếu không có sản phẩm trong khoảng giá, nói thật và đề xuất khoảng giá gần nhất

10. ❓ HỎI CÂU HỎI LÀM RÕ:
   - Hỏi về NGÂN SÁCH nếu chưa biết: "Bạn dự định chi bao nhiêu cho hoa?"
   - Hỏi về KÍCH THƯỚC nếu chưa biết: "Bạn muốn bó/giỏ hoa size nào? Nhỏ xinh, vừa hay hoành tráng?"
   - Hỏi về MÀU SẮC ưa thích: "Bạn thích tông màu nào? Hoặc người nhận thích màu gì?"
   - Hỏi về MỤC ĐÍCH/DỊP: "Bạn mua hoa cho dịp gì? Sinh nhật, khai trương, tỏ tình, hay trang trí?"
   - Hỏi về NGƯỜI NHẬN: "Bạn tặng cho ai? Bạn gái, mẹ, sếp, hay bạn bè?"
   - Hỏi về LOẠI HOA yêu thích: "Bạn thích loại hoa nào? Hồng, lily, hướng dương, cẩm tú cầu?"

VÍ DỤ PHẢN HỒI TỐT (ĐẦY ĐỦ THÔNG TIN):

**Ví dụ 1 - Tìm theo GIÁ + THỂ LOẠI:**
"Tuyệt vời! Mình tìm thấy những bó hoa dưới 500,000 VNĐ phù hợp với bạn:

1. **Bó hoa hồng đỏ [Tên]**
   💰 Giá: 450,000 VNĐ
   📏 Size có sẵn: Nhỏ, Vừa, Lớn
   🎨 Màu có sẵn: Đỏ, Hồng, Trắng
   🌹 Loại hoa: 20 bông hồng Ecuador, baby trắng, lá bạc
   ✨ Phù hợp: Tặng người yêu, sinh nhật, kỷ niệm
   
2. **Bó hoa hướng dương [Tên]**
   💰 Giá: 380,000 VNĐ (tiết kiệm hơn!)
   📏 Size: Vừa, Lớn
   🎨 Màu: Vàng tươi
   🌻 Loại hoa: 10 hướng dương, cúc tana, lá xanh
   ✨ Phù hợp: Chúc mừng, khai trương, tặng bạn bè

Bạn thích loại nào? Và bạn mua cho dịp gì nhé?"

**Ví dụ 2 - Tìm theo MÀU + GIÁ:**
"Để mình tìm hoa tông hồng dưới 300k cho bạn nhé! 🌸

Tuyệt! Mình có 2 sản phẩm hoàn hảo:

1. **Bó hoa hồng pastel** - 
   💰 Giá: 280,000 VNĐ
   📏 Size Vừa: CÒN HÀNG (5 bó)
   🎨 Tông hồng pastel dịu dàng
   🌷 Gồm: hồng pastel, cẩm chướng hồng, baby hồng
   ✨ Rất phù hợp tặng bạn gái hoặc mẹ
   
2. **Giỏ hoa cẩm tú cầu hồng**
   💰 Giá: 250,000 VNĐ
   📏 Size Nhỏ: CÒN HÀNG (3 giỏ)
   🎨 Hồng tím
   💐 Gồm: cẩm tú cầu hồng, hoa sáp, ruy-băng
   ✨ Thanh lịch, phù hợp để bàn hoặc tặng đồng nghiệp

Cả 2 đều rất xinh! Bạn muốn style bó hoa hay giỏ hoa?"

**Ví dụ 3 - CHỈ HỎI GIÁ (không nói loại):**
"Có gì dưới 500k không?"

"Dạ có rất nhiều sản phẩm dưới 500k ạ! Để mình gợi ý:

1. 🌹 **Bó hoa hồng đỏ classic** - 350k
2. 🌻 **Bó hoa hướng dương tươi** - 280k
3. 🌸 **Giỏ hoa cẩm tú cầu** - 420k
4. 🌷 **Hoa chậu lan hồ điệp mini** - 380k
5. 💐 **Bó hoa mix nhiều màu** - 300k

Shop có đa dạng từ bó hoa, giỏ hoa đến hoa chậu. Bạn quan tâm loại nào nhất để mình tư vấn chi tiết hơn?"

**Ví dụ 4 - HỎI LOẠI + GIÁ (chỉ show đúng loại):**
"Có giỏ hoa nào dưới 500k không?"

"Dạ có nhiều mẫu giỏ hoa đẹp dưới 500k ạ:

1. **Giỏ hoa cẩm tú cầu hồng** - 420k
   📏 Size: Nhỏ, Vừa | 🎨 Màu: Hồng, Xanh, Tím
   
2. **Giỏ hoa hồng mix** - 350k
   📏 Size: Nhỏ, Vừa | 🎨 Màu: Đỏ-Hồng, Pastel
   
3. **Giỏ hoa đồng tiền** - 280k
   📏 Size: Vừa | 🎨 Màu: Nhiều màu

Tất cả đều là GIỎ HOA nhé! Bạn thích mẫu nào?"

**Ví dụ 5 - Không tìm thấy CHÍNH XÁC:**
"Mình rất tiếc vì không tìm thấy bó hoa lily trắng size lớn dưới 200k trong kho hiện tại 😔

Tuy nhiên, mình có một số gợi ý gần nhất:

• **Bó lily trắng size vừa** giá 280k (đúng hoa, nhỏ hơn 1 size, hơn budget 80k)
• **Bó hoa hồng trắng size lớn** giá 190k (tông trắng, đúng size, trong budget)
• **Bó lily hồng size lớn** giá 250k (cùng loại lily, khác màu)

Bạn có muốn xem những lựa chọn này không? Hoặc mình có thể tìm trong khoảng giá cao hơn?"

Hãy bắt đầu cuộc trò chuyện một cách thân thiện và tỏ vẻ sẵn sàng giúp đỡ. Luôn thể hiện sự am hiểu về hoa và niềm đam mê với nghệ thuật cắm hoa.`;
};

// Hàm trích xuất khoảng giá từ message
const extractPriceRange = (message) => {
    const priceInfo = {
        minPrice: null,
        maxPrice: null,
        hasPriceQuery: false
    };

    const messageLower = message.toLowerCase();

    // Detect các từ khóa liên quan đến giá
    const priceKeywords = ['giá', 'price', 'vnđ', 'vnd', 'đồng', 'k', 'nghìn', 'triệu', 'rẻ', 'mắc', 'bao nhiêu', 'tầm', 'khoảng', 'dưới', 'trên', 'từ'];
    priceInfo.hasPriceQuery = priceKeywords.some(keyword => messageLower.includes(keyword));

    // Pattern: "dưới 500k", "dưới 500 nghìn", "dưới 500000"
    const underPattern = /(dưới|under|<|nhỏ hơn|ít hơn)\s*([0-9]+)\s*(k|nghìn|triệu|tr|đồng|vnd|vnđ)?/i;
    const underMatch = message.match(underPattern);
    if (underMatch) {
        const value = parseInt(underMatch[2]);
        const unit = underMatch[3]?.toLowerCase();
        priceInfo.maxPrice = unit === 'triệu' || unit === 'tr' ? value * 1000000 : 
                            (unit === 'k' || unit === 'nghìn') ? value * 1000 : value;
        priceInfo.minPrice = 0;
        priceInfo.hasPriceQuery = true;
    }

    // Pattern: "trên 1 triệu", "trên 1000k"
    const abovePattern = /(trên|above|>|lớn hơn|nhiều hơn)\s*([0-9]+)\s*(k|nghìn|triệu|tr|đồng|vnd|vnđ)?/i;
    const aboveMatch = message.match(abovePattern);
    if (aboveMatch) {
        const value = parseInt(aboveMatch[2]);
        const unit = aboveMatch[3]?.toLowerCase();
        priceInfo.minPrice = unit === 'triệu' || unit === 'tr' ? value * 1000000 : 
                            (unit === 'k' || unit === 'nghìn') ? value * 1000 : value;
        priceInfo.maxPrice = null;
        priceInfo.hasPriceQuery = true;
    }

    // Pattern: "từ 200k đến 500k", "200-500k", "khoảng 200 đến 500 nghìn"
    const rangePattern = /(từ|from|khoảng)?\s*([0-9]+)\s*(k|nghìn|triệu|tr)?\s*(đến|tới|to|-|->)\s*([0-9]+)\s*(k|nghìn|triệu|tr|đồng|vnd|vnđ)?/i;
    const rangeMatch = message.match(rangePattern);
    if (rangeMatch) {
        const value1 = parseInt(rangeMatch[2]);
        const unit1 = rangeMatch[3]?.toLowerCase();
        const value2 = parseInt(rangeMatch[5]);
        const unit2 = rangeMatch[6]?.toLowerCase();
        
        priceInfo.minPrice = unit1 === 'triệu' || unit1 === 'tr' ? value1 * 1000000 : 
                            (unit1 === 'k' || unit1 === 'nghìn') ? value1 * 1000 : value1;
        priceInfo.maxPrice = unit2 === 'triệu' || unit2 === 'tr' ? value2 * 1000000 : 
                            (unit2 === 'k' || unit2 === 'nghìn') ? value2 * 1000 : value2;
        priceInfo.hasPriceQuery = true;
    }

    // Pattern: "tầm 300k", "khoảng 500 nghìn"
    const aroundPattern = /(tầm|khoảng|around|~)\s*([0-9]+)\s*(k|nghìn|triệu|tr|đồng|vnd|vnđ)?/i;
    const aroundMatch = message.match(aroundPattern);
    if (aroundMatch && !rangeMatch) {
        const value = parseInt(aroundMatch[2]);
        const unit = aroundMatch[3]?.toLowerCase();
        const price = unit === 'triệu' || unit === 'tr' ? value * 1000000 : 
                     (unit === 'k' || unit === 'nghìn') ? value * 1000 : value;
        priceInfo.minPrice = price - 100000; // ±100k
        priceInfo.maxPrice = price + 100000;
        priceInfo.hasPriceQuery = true;
    }

    // Pattern: "giá rẻ", "bình dân"
    if (/(giá rẻ|rẻ|bình dân|cheap|budget|tiết kiệm)/i.test(message) && !rangeMatch && !underMatch) {
        priceInfo.minPrice = 0;
        priceInfo.maxPrice = 300000;
        priceInfo.hasPriceQuery = true;
    }

    // Pattern: "giá cao", "cao cấp", "sang trọng"
    if (/(cao cấp|sang trọng|đắt|giá cao|luxury|premium)/i.test(message) && !rangeMatch && !aboveMatch) {
        priceInfo.minPrice = 1000000;
        priceInfo.maxPrice = null;
        priceInfo.hasPriceQuery = true;
    }

    return priceInfo;
};

// Hàm để trích xuất keywords từ tin nhắn người dùng (kích thước, màu sắc, loại sản phẩm hoa)
const extractProductKeywords = (message, categories = []) => {
    const keywords = {
        sizes: [],
        colors: [],
        types: [],
        searchTerms: [],
        priceRange: extractPriceRange(message)
    };

    // Các kích thước hoa: nhỏ, vừa, lớn, đặc biệt
    const sizePatterns = [
        { pattern: /\b(nhỏ|mini|bé|small)\b|size s/i, size: 'S' },
        { pattern: /\b(vừa|trung bình|medium)\b|size m/i, size: 'M' },
        { pattern: /\b(lớn|to|big|large)\b|size l/i, size: 'L' },
        { pattern: /\b(đặc biệt|siêu lớn|khổng lồ|extra large)\b|size xl|XL/i, size: 'XL' }
    ];

    // Các màu sắc phổ biến cho hoa
    const colorPatterns = [
        /đỏ|red/i,
        /xanh lá|xanh|green/i,
        /xanh dương|blue/i,
        /vàng|yellow/i,
        /trắng|white/i,
        /hồng|pink/i,
        /cam|orange/i,
        /tím|purple|violet/i,
        /pastel/i,
        /nhiều màu|mix|colorful|sắc màu/i
    ];

    // =====================================================
    // TỰ ĐỘNG LẤY LOẠI SẢN PHẨM TỪ CATEGORIES DATABASE
    // =====================================================
    const messageLower = message.toLowerCase();
    let matchedTypes = new Set();
    
    // 1. Tìm các từ khóa loại sản phẩm hoa trong message
    const typeKeywords = [
        'bó hoa', 'giỏ hoa', 'hoa chậu', 'hoa cưới', 'hoa khai trương',
        'hoa chia buồn', 'hoa tang', 'lan hồ điệp', 'hoa hồng', 'hoa ly',
        'hoa hướng dương', 'hoa cẩm tú cầu', 'hoa tulip', 'hoa đồng tiền',
        'hoa cúc', 'hoa lan', 'hoa baby', 'hoa sáp', 'hoa khô', 'hoa giả',
        'kệ hoa', 'lẵng hoa', 'hộp hoa', 'chậu hoa',
        'bouquet', 'basket', 'orchid', 'rose', 'sunflower', 'lily',
        'tulip', 'hydrangea', 'flower', 'wreath', 'arrangement'
    ];
    
    const detectedKeywords = [];
    typeKeywords.forEach(keyword => {
        // Tìm từ khóa (hỗ trợ cả cụm từ nhiều chữ)
        if (messageLower.includes(keyword.toLowerCase())) {
            detectedKeywords.push(keyword.toLowerCase());
        }
    });
    
    // Nếu không match cụm từ, thử match từ đơn phổ biến
    if (detectedKeywords.length === 0) {
        const singleKeywords = ['hoa', 'bó', 'giỏ', 'chậu', 'lẵng', 'hộp', 'kệ', 'lan'];
        singleKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(messageLower)) {
                detectedKeywords.push(keyword.toLowerCase());
            }
        });
    }
    
    console.log('Detected type keywords from message:', detectedKeywords);
    
    // 2. Map từ đồng nghĩa tiếng Anh sang tiếng Việt
    const synonymMap = {
        'bouquet': 'bó hoa',
        'basket': 'giỏ hoa',
        'orchid': 'lan hồ điệp',
        'rose': 'hoa hồng',
        'sunflower': 'hoa hướng dương',
        'lily': 'hoa ly',
        'tulip': 'hoa tulip',
        'hydrangea': 'hoa cẩm tú cầu',
        'flower': 'hoa',
        'wreath': 'vòng hoa',
        'arrangement': 'lẵng hoa',
        'pot': 'hoa chậu',
        'dried flower': 'hoa khô',
        'artificial': 'hoa giả'
    };
    
    // Chuyển đổi từ tiếng Anh sang tiếng Việt
    const vietnameseKeywords = detectedKeywords.map(kw => synonymMap[kw] || kw);
    
    console.log('Vietnamese keywords:', vietnameseKeywords);
    
    // 3. Match với categories từ database
    if (categories && categories.length > 0 && vietnameseKeywords.length > 0) {
        vietnameseKeywords.forEach(keyword => {
            // Tìm category có chứa từ khóa này (flexible matching)
            const matchingCategories = categories.filter(cat => {
                const catName = cat.name?.toLowerCase() || '';
                return catName.includes(keyword);
            });
            
            if (matchingCategories.length > 0) {
                // Thêm tất cả categories match
                matchingCategories.forEach(cat => matchedTypes.add(cat.name));
            } else {
                // Nếu không tìm thấy trong DB, thêm từ khóa trực tiếp
                matchedTypes.add(keyword);
            }
        });
    } else if (vietnameseKeywords.length > 0) {
        // Nếu không có categories, dùng trực tiếp từ khóa
        vietnameseKeywords.forEach(kw => matchedTypes.add(kw));
    }

    // Trích xuất kích thước
    sizePatterns.forEach(({ pattern, size }) => {
        if (pattern.test(message)) {
            keywords.sizes.push(size);
        }
    });

    // Trích xuất màu sắc
    colorPatterns.forEach(pattern => {
        if (pattern.test(message)) {
            const match = message.match(pattern);
            if (match) keywords.colors.push(match[0]);
        }
    });

    // Xử lý xung đột giữa các loại cụ thể và tổng quát
    // VD: "bó hoa hồng" thì bỏ "hoa" đơn thuần, "giỏ hoa" thì bỏ "hoa"
    const specificTypes = ['bó hoa', 'giỏ hoa', 'hoa chậu', 'hoa cưới', 'hoa khai trương', 'hoa chia buồn', 'lan hồ điệp', 'hoa hồng', 'hoa ly', 'hoa hướng dương', 'hoa cẩm tú cầu', 'lẵng hoa', 'hộp hoa', 'kệ hoa', 'hoa khô', 'hoa giả', 'hoa sáp'];
    const generalTypes = ['hoa', 'bó', 'giỏ', 'chậu', 'lẵng', 'hộp', 'kệ'];
    
    specificTypes.forEach(specificType => {
        if (matchedTypes.has(specificType)) {
            generalTypes.forEach(generalType => {
                if (specificType.includes(generalType)) {
                    matchedTypes.delete(generalType);
                }
            });
        }
    });
    
    keywords.types = Array.from(matchedTypes);

    return keywords;
};

// Hàm để yêu cầu AI tìm sản phẩm phù hợp từ catalog
const getProductMatchesFromAI = async (catalogJson, message, products, priceRange, keywords) => {
    try {
        let instructions = '';
        
        // Thêm hướng dẫn về giá
        if (priceRange && priceRange.hasPriceQuery) {
            if (priceRange.minPrice !== null && priceRange.maxPrice !== null) {
                instructions += `\n\n⚠️ GIÁ: Khách hàng yêu cầu sản phẩm trong khoảng giá từ ${priceRange.minPrice} đến ${priceRange.maxPrice} VNĐ.\nCHỈ chọn sản phẩm có giá (price) nằm trong khoảng này.`;
            } else if (priceRange.maxPrice !== null) {
                instructions += `\n\n⚠️ GIÁ: Khách hàng yêu cầu sản phẩm có giá DƯỚI ${priceRange.maxPrice} VNĐ.\nCHỈ chọn sản phẩm có giá (price) <= ${priceRange.maxPrice}.`;
            } else if (priceRange.minPrice !== null) {
                instructions += `\n\n⚠️ GIÁ: Khách hàng yêu cầu sản phẩm có giá TRÊN ${priceRange.minPrice} VNĐ.\nCHỈ chọn sản phẩm có giá (price) >= ${priceRange.minPrice}.`;
            }
        }
        
        // Thêm hướng dẫn về size
        if (keywords && keywords.sizes && keywords.sizes.length > 0) {
            instructions += `\n\n⚠️ SIZE: Khách hàng yêu cầu size: ${keywords.sizes.join(', ')}.\nCHỈ chọn sản phẩm có variants với size này VÀ inventory > 0.`;
        }
        
        // Thêm hướng dẫn về màu sắc
        if (keywords && keywords.colors && keywords.colors.length > 0) {
            instructions += `\n\n⚠️ MÀU SẮC: Khách hàng yêu cầu màu: ${keywords.colors.join(', ')}.\nCHỈ chọn sản phẩm có variants với màu này VÀ inventory > 0.`;
        }
        
        // Thêm hướng dẫn về loại sản phẩm
        if (keywords && keywords.types && keywords.types.length > 0) {
            instructions += `\n\n⚠️⚠️⚠️ THỂ LOẠI (BẮT BUỘC - NGHIÊM NGẶT): Khách hàng CHỈ TÌM: ${keywords.types.join(', ')}.

QUY TẮC CHẶT CHẼ:
- CHỈ chọn sản phẩm có category HOẶC title CHỨA: ${keywords.types.join(' HOẶC ')}
- TUYỆT ĐỐI KHÔNG chọn sản phẩm thuộc loại khác
- VD 1: Hỏi "Hoa tình yêu" → CHỈ chọn sản phẩm có "hoa" và "tình yêu" (KHÔNG chọn chậu trái cây, hoa tang lễ, hoặc sản phẩm không liên quan)

Kiểm tra KỸ category và title trước khi chọn!`;
        }

        const matcherPrompt = `Dựa trên danh sách sản phẩm này:
${catalogJson}

Người dùng yêu cầu: "${message}"${instructions}

Hãy trả lại danh sách chính xác các sản phẩm phù hợp nhất (tối đa 5) dưới dạng JSON:
{
  "matched_products": ["product_id_1", "product_id_2", ...]
}

CHỈ trả lại JSON, không có text khác.
Nếu không có sản phẩm phù hợp, trả lại: {"matched_products": []}`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent(matcherPrompt);
        const responseText = result.response.text().trim();

        console.log('AI matcher response:', responseText.substring(0, 200));

        // Parse JSON từ response
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.matched_products && Array.isArray(parsed.matched_products)) {
                    console.log('AI returned product IDs:', parsed.matched_products);
                    
                    // Tìm các sản phẩm theo product_id
                    const matchedProducts = parsed.matched_products
                        .map(id => {
                            const found = products.find(p => p.product_id === id || p._id?.toString() === id);
                            console.log(`Looking for ID "${id}":`, found ? found.title : 'NOT FOUND');
                            return found;
                        })
                        .filter(p => p && p.inventory > 0);
                    
                    console.log('Matched products after filtering:', matchedProducts.map(p => p.title));
                    
                    // Nếu tìm thấy sản phẩm, trả về
                    if (matchedProducts.length > 0) {
                        return matchedProducts.slice(0, 5);
                    }
                    
                    // Nếu AI không tìm thấy (empty array), tìm sản phẩm tương tự bằng cách khác
                    console.log('AI returned empty, trying alternative matching...');
                    return getAlternativeProducts(message, products, priceRange, keywords);
                }
            }
        } catch (parseErr) {
            console.error('Error parsing AI response:', parseErr);
            // Fallback: tìm sản phẩm tương tự
            return getAlternativeProducts(message, products, priceRange, keywords);
        }
    } catch (err) {
        console.error('Error getting AI product matches:', err);
        // Fallback: tìm sản phẩm tương tự
        return getAlternativeProducts(message, products, priceRange, keywords);
    }
};

// Hàm fallback: tìm sản phẩm tương tự khi AI không tìm thấy
const getAlternativeProducts = (message, products, priceRange = null, keywords = null) => {
    console.log('Using alternative product matching for:', message);
    console.log('Price range:', priceRange);
    console.log('Keywords:', keywords);
    
    let availableProducts = products.filter(p => p.inventory > 0);
    
    // Lọc theo giá nếu có yêu cầu về giá
    if (priceRange && priceRange.hasPriceQuery) {
        availableProducts = availableProducts.filter(p => {
            const price = p.price || 0;
            let inRange = true;
            
            if (priceRange.minPrice !== null && price < priceRange.minPrice) {
                inRange = false;
            }
            if (priceRange.maxPrice !== null && price > priceRange.maxPrice) {
                inRange = false;
            }
            
            return inRange;
        });
        console.log('Products after price filtering:', availableProducts.length);
    }
    
    // Lọc theo size nếu có yêu cầu
    if (keywords && keywords.sizes && keywords.sizes.length > 0) {
        availableProducts = availableProducts.filter(p => {
            if (!p.variants || p.variants.length === 0) return false;
            return p.variants.some(v => 
                keywords.sizes.some(size => 
                    v.attributes?.size?.toLowerCase() === size.toLowerCase() && 
                    v.inventory > 0
                )
            );
        });
        console.log('Products after size filtering:', availableProducts.length);
    }
    
    // Lọc theo màu sắc nếu có yêu cầu
    if (keywords && keywords.colors && keywords.colors.length > 0) {
        availableProducts = availableProducts.filter(p => {
            if (!p.variants || p.variants.length === 0) return false;
            return p.variants.some(v => 
                keywords.colors.some(color => 
                    v.attributes?.color?.toLowerCase().includes(color.toLowerCase()) && 
                    v.inventory > 0
                )
            );
        });
        console.log('Products after color filtering:', availableProducts.length);
    }
    
    if (availableProducts.length === 0) {
        console.log('No products with inventory > 0 (after all filters)');
        return [];
    }

    // Tách keywords từ message
    const messageLower = message.toLowerCase();
    
    // Nếu có yêu cầu về LOẠI SẢN PHẨM cụ thể, filter CHẶT CHẼ
    if (keywords && keywords.types && keywords.types.length > 0) {
        console.log('Filtering by product types:', keywords.types);
        
        // Lọc theo types trong keywords
        availableProducts = availableProducts.filter(product => {
            const productText = `${product.title} ${product.category} ${product.description}`.toLowerCase();
            
            // Kiểm tra xem sản phẩm có chứa bất kỳ type nào được yêu cầu
            return keywords.types.some(type => {
                const typeLower = type.toLowerCase();
                return productText.includes(typeLower);
            });
        });
        
        console.log('Products after type filtering:', availableProducts.length);
        
        if (availableProducts.length > 0) {
            console.log('Found by types:', availableProducts.map(p => p.title));
            return availableProducts.slice(0, 5);
        }
    }
    
    // Nếu KHÔNG có yêu cầu về loại (chỉ hỏi giá), tìm theo category
    const categoryMatches = availableProducts.filter(p => 
        messageLower.includes(p.category?.toLowerCase())
    );
    
    if (categoryMatches.length > 0) {
        console.log('Found by category:', categoryMatches.map(p => p.title));
        return categoryMatches.slice(0, 5);
    }

    // Tìm theo keywords trong title/description
    const searchWords = messageLower.split(/\s+/).filter(w => w.length > 2);
    const titleMatches = availableProducts.filter(product => {
        const productText = `${product.title} ${product.brand} ${product.description}`.toLowerCase();
        return searchWords.some(word => productText.includes(word));
    });

    if (titleMatches.length > 0) {
        console.log('Found by title/description:', titleMatches.map(p => p.title));
        return titleMatches.slice(0, 5);
    }

    // Nếu vẫn không tìm thấy, trả về một số sản phẩm ngẫu nhiên có hàng
    // (chỉ khi người dùng không có yêu cầu cụ thể về loại sản phẩm)
    if (!keywords || !keywords.types || keywords.types.length === 0) {
        console.log('No matches found, returning random products');
        return availableProducts.slice(0, 5);
    }
    
    console.log('No products found matching all criteria');
    return [];
};

const chatCtrl = {
    // Chat với AI tư vấn
    chat: async (req, res) => {
        try {
            const { message, session_id } = req.body;

            if (!message || message.trim() === '') {
                return res.status(400).json({ msg: "Vui lòng nhập câu hỏi" });
            }

            console.log('\n=== CHAT REQUEST ===');
            console.log('Message:', message);
            console.log('Session ID:', session_id);

            // Lấy danh sách sản phẩm và danh mục để cung cấp context
            const products = await Products.find();
            const categories = await Category.find();

            console.log('Total products in DB:', products.length);
            console.log('Products with inventory > 0:', products.filter(p => p.inventory > 0).length);
            console.log('Categories:', categories.length);

            // Xây dựng JSON schema với tất cả dữ liệu
            const catalogJson = buildProductCatalogJson(products, categories);

            // Lấy lịch sử chat nếu có session_id
            let chatHistory = [];
            let chatDoc = null;

            if (session_id) {
                chatDoc = await Chat.findOne({ session_id });
                if (chatDoc && chatDoc.messages.length > 0) {
                    // Chuyển đổi lịch sử chat sang format của Gemini
                    chatHistory = chatDoc.messages.slice(-10).map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    }));
                }
            }

            // Khởi tạo model Gemini
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash-lite",
                systemInstruction: getSystemPrompt(catalogJson)
            });

            // Tạo chat với lịch sử
            const chat = model.startChat({
                history: chatHistory,
            });

            // Gửi message và nhận phản hồi
            const result = await chat.sendMessage(message);
            const response = await result.response;
            const aiMessage = response.text();

            // Lưu lịch sử chat
            const userMessage = {
                role: 'user',
                content: message,
                timestamp: new Date()
            };

            const assistantMessage = {
                role: 'assistant',
                content: aiMessage,
                timestamp: new Date()
            };

            // Trích xuất keywords từ user message để tìm sản phẩm phù hợp
            const keywords = extractProductKeywords(message, categories);
            let suggestedProducts = [];

            console.log('Extracted keywords:', keywords);

            // Sử dụng AI để tìm sản phẩm phù hợp từ catalog
            suggestedProducts = await getProductMatchesFromAI(catalogJson, message, products, keywords.priceRange, keywords);

            console.log('Suggested products found:', suggestedProducts.length);
            if (suggestedProducts.length > 0) {
                console.log('Product titles:', suggestedProducts.map(p => p.title));
            } else {
                console.log('No matching products found by AI');
            }
            console.log('=== END CHAT REQUEST ===\n');

            // Lấy user_id từ request
            const userId = req.user?.id || req.body?.user_id || null;

            // Lưu vào database
            if (chatDoc) {
                // Cập nhật chat hiện có
                chatDoc.messages.push(userMessage, assistantMessage);
                if (!chatDoc.user_id && userId) {
                    chatDoc.user_id = userId;
                }
                await chatDoc.save();
            } else {
                // Tạo chat mới
                const newSessionId = session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const newChat = new Chat({
                    session_id: newSessionId,
                    messages: [userMessage, assistantMessage],
                    user_id: userId
                });
                await newChat.save();

                // Trả về session_id mới nếu chưa có
                if (!session_id) {
                    return res.json({
                        status: "success",
                        message: aiMessage,
                        session_id: newSessionId,
                        products: suggestedProducts,
                        keywords: keywords
                    });
                }
            }

            res.json({
                status: "success",
                message: aiMessage,
                session_id: session_id || chatDoc?.session_id,
                products: suggestedProducts
            });
        } catch (err) {
            console.error("Chat error:", err);
            return res.status(500).json({
                msg: "Có lỗi xảy ra khi xử lý tin nhắn. Vui lòng thử lại.",
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    },

    // Lấy lịch sử chat
    getChatHistory: async (req, res) => {
        try {
            const { session_id } = req.params;

            if (!session_id) {
                return res.status(400).json({ msg: "Thiếu session_id" });
            }

            const chat = await Chat.findOne({ session_id });
            if (!chat) {
                return res.json({
                    status: "success",
                    messages: []
                });
            }

            res.json({
                status: "success",
                messages: chat.messages,
                session_id: chat.session_id
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Xóa lịch sử chat
    clearChatHistory: async (req, res) => {
        try {
            const { session_id } = req.params;

            if (!session_id) {
                return res.status(400).json({ msg: "Thiếu session_id" });
            }

            await Chat.findOneAndDelete({ session_id });
            res.json({ msg: "Xóa lịch sử chat thành công" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Tạo session mới - KHÔNG LƯU VÀO DATABASE
    // Chỉ tạo session_id, chỉ save khi có message đầu tiên
    createSession: async (req, res) => {
        try {
            const session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Không save session rỗng vào database
            // Chỉ trả về session_id cho client sử dụng tạm thời
            // Session sẽ được tạo khi user gửi message đầu tiên

            res.json({
                status: "success",
                session_id,
                msg: "Session ID được tạo (chưa lưu database)"
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = chatCtrl;


# 🔧 FIX CSS - Tab Tràn Lên

## Vấn đề
Khi click tab thứ 2, tab đầu bị tràn lên trên.

## Nguyên Nhân
- `.ant-tabs-tabpane` không bị ẩn khi inactive
- Chiều cao của modal không cố định
- Flex layout không được cấu hình đúng

## Giải Pháp

Đã update `chatModal.css` với các fix:

### 1. Modal Content - Cố định chiều cao
```css
.unified-chat-modal .ant-modal-content {
  height: 520px !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}
```

### 2. Modal Body - Flex layout
```css
.unified-chat-modal .ant-modal-body {
  flex: 1 !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
}
```

### 3. Tabs Container - Full height
```css
.chat-tabs.ant-tabs {
  height: 100% !important;
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}
```

### 4. Tab Panes - Hide inactive, show active
```css
.chat-tabs .ant-tabs-tabpane {
  display: none !important;  /* Hide by default */
}

.chat-tabs .ant-tabs-tabpane-active {
  display: flex !important;  /* Show only active */
}
```

### 5. Content Area - Flex layout
```css
.chat-tabs .ant-tabs-content {
  flex: 1 !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}
```

## Kết Quả
✅ Tab đầu không tràn lên  
✅ Chuyển tab mượt mà  
✅ Chiều cao cố định  
✅ Không có scroll thừa  

## Test
1. Mở chat bubble
2. Click tab 1 → tab 2 → tab 1
3. Kiểm tra không có overlap

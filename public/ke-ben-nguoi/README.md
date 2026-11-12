# Kể bên người (By your side)

Trang nghe các đoạn âm thanh ASMR kèm script (bản dịch) cố định ở bên trái.

## Cấu trúc
```
ke-ben-nguoi/
├── index.html          trang (có HEADER MẪU, thay bằng header dùng chung của site)
├── style.css           toàn bộ giao diện (biến --header-h = chiều cao header của site)
├── script.js           logic; đầu file có cờ DEMO_TONE
├── tracks.json         DỮ LIỆU các đoạn (chỗ duy nhất cần sửa khi thêm/bớt đoạn)
└── assets/
    ├── byyourside.jpg  ảnh nền
    ├── audio/          đặt file âm thanh (mp3 hoặc m4a)
    └── thumbs/         đặt ảnh nhỏ cho từng đoạn (tùy chọn)
```

## Thêm một đoạn mới
Thêm một khối vào mảng `tracks` trong `tracks.json`:
```json
{
  "name": "Tên đoạn",
  "desc": "Mô tả rất ngắn (một dòng)",
  "dur": 184,
  "src": "assets/audio/16.mp3",
  "thumb": "assets/thumbs/16.jpg",
  "script": ["Đoạn văn thứ nhất", "Đoạn văn thứ hai"]
}
```
- `dur`: thời lượng tính bằng giây (hiện trong danh sách).
- `src`: `null` nếu chưa có file.
- `thumb`: `null` thì dùng ảnh tạm cắt từ ảnh nền. Khuyến nghị 168×108 px, jpg/webp, dưới 20 KB.
- `name`, `desc`, `script` có thể là `{ "vi": "...", "en": "..." }` để đa ngôn ngữ.
- Script không cần mốc thời gian: mỗi phần tử là một đoạn văn.

## Chạy thử
`tracks.json` được nạp bằng `fetch`, nên phải mở qua máy chủ, không mở trực tiếp file:
```
cd ke-ben-nguoi
python3 -m http.server 8000
# mở http://localhost:8000
```

## Khi chạy thật
- Đặt `var DEMO_TONE = false;` ở đầu `script.js` (đoạn chưa có file sẽ mờ đi và không bấm được).
- File âm thanh nên cùng tên miền với site và máy chủ phải hỗ trợ Range requests (để tua).

# Prompt cho trợ lý AI: thêm trang "Kể bên người" vào website

## NHIỆM VỤ
Thêm vào website của tôi một trang mới tên **"Kể bên người"** (tiếng Anh: **"By your side"**): trang nghe các đoạn âm thanh ASMR kèm bản dịch (script).
Giao diện và hành vi tôi đã làm xong và duyệt từng điểm, nằm trong thư mục `ke-ben-nguoi/` (đính kèm, đã chạy thử). Việc của bạn là **TÍCH HỢP** nó vào site và điền dữ liệu thật, **KHÔNG thiết kế lại hay "cải thiện" thêm**.

## BỐI CẢNH SITE
- Fanweb cho nhân vật Thẩm Tinh Hồi (Xavier, Love and Deepspace), tôi code tay bằng HTML/CSS/JS (không dùng Wix).
- Phong cách cyberpunk / Blade Runner 2049, tím làm chủ đạo. Các trang khác đã có sẵn; trang này thuộc mục "Hẹn hò".
- Mọi chi tiết cần khớp (màu, font, kích thước) đã nằm trong `style.css`.

## CẤU TRÚC FILE ĐÍNH KÈM
```
ke-ben-nguoi/
├── index.html          trang (có HEADER MẪU cần thay)
├── style.css           giao diện; biến --header-h = chiều cao header của site
├── script.js           logic; đầu file có cờ DEMO_TONE
├── tracks.json         DỮ LIỆU các đoạn
├── README.md           cách thêm đoạn mới, cách chạy thử
└── assets/
    ├── byyourside.jpg  ảnh nền
    ├── audio/          đặt file âm thanh
    └── thumbs/         đặt ảnh nhỏ (tùy chọn)
```

## VIỆC CẦN LÀM
1. **Đặt thư mục vào site**, giữ nguyên cấu trúc tương đối bên trong. Nếu chưa rõ đường dẫn đích hoặc cách đặt tên trang trong site, hỏi tôi. Sửa các đường dẫn liên quan cho khớp.
2. **Header:** xóa HEADER MẪU (khối có ghi chú trong `index.html` và trong `style.css`), dùng header dùng chung của site. Quy ước breadcrumb của tôi: trang hiện tại chỉ khác ở chỗ chữ đậm hơn và sáng hơn, không gạch chân hay trang trí gì thêm. Đặt `--header-h` đúng bằng chiều cao thật của header để vùng ảnh cao đúng `100vh - header`, trang không bị cuộn dọc.
3. **Ngôn ngữ:** site đã có hệ thống đổi ngôn ngữ, đừng tạo cái mới.
   - Trang đọc `document.documentElement.lang`. Hãy thêm vào đúng chỗ site đổi ngôn ngữ dòng `document.dispatchEvent(new Event('langchange'))` (sau khi đã đổi `<html lang>`) để trang tự cập nhật.
   - Chữ giao diện nằm trong object `UI` ở `script.js` (vi/en). Nếu site có file ngôn ngữ riêng, chuyển các chuỗi này sang đó và nối lại.
   - Nội dung đoạn (`name`, `desc`, `script`) trong `tracks.json` có thể là chuỗi hoặc `{ "vi": "...", "en": "..." }`.
4. **Dữ liệu thật:** điền `tracks.json` theo README (các trường: `name`, `desc`, `dur`, `src`, `thumb`, `script`). **Không tự bịa nội dung hay mô tả.** Nếu tôi đưa script ở định dạng khác (txt, srt, Excel...), chuyển thành mảng đoạn văn; mốc thời gian bỏ đi, vì script này hiển thị trọn vẹn chứ không chạy theo audio.
5. **Âm thanh:**
   - File đặt ở `assets/audio/`, định dạng mp3 hoặc m4a (AAC) khoảng 96 đến 128 kbps.
   - File phải cùng tên miền với site. Trang dùng Web Audio để tạo ánh sáng nhẹ theo giọng nói; với file khác nguồn không có CORS thì âm thanh sẽ im lặng.
   - Máy chủ cần hỗ trợ Range requests để tua. Không tự phát khi vào trang; chỉ phát khi người dùng bấm.
   - Khi đã có file thật, đặt `var DEMO_TONE = false;` ở đầu `script.js` (đoạn chưa có file sẽ mờ đi và không bấm được).
6. **Ảnh nhỏ (tùy chọn):** `thumb` khoảng 168×108 px, jpg hoặc webp, dưới 20 KB. `null` thì dùng ảnh tạm cắt từ ảnh nền.
7. **Hiệu ứng chuyển trang:** nếu site có hiệu ứng riêng cho từng trang, nối trang này vào đúng cơ chế đó theo cách các trang khác đang làm. Bản đính kèm không có hiệu ứng chuyển trang nào ngoài một đường quét ngắn khi chọn đoạn.
8. **Chạy thử qua máy chủ cục bộ** (xem README), vì `tracks.json` nạp bằng `fetch` và âm thanh sẽ im lặng nếu mở trực tiếp file.

## THIẾT KẾ ĐÃ CHỐT (không thay đổi)
**Màn danh sách**
- Ảnh nền `byyourside.jpg` mờ và tối. Cột trái là danh sách **thẳng** (không khung bao, không cuộn cong, không carousel).
- Mỗi dòng: ảnh nhỏ hình chữ nhật (cắt chéo một góc trên bên phải), số thứ tự, tên đoạn, một dòng mô tả ngắn, thời lượng.
- Ảnh nhỏ **luôn màu thật, không phủ màu tím** (chỉ có scanline mảnh).
- Ô tìm kiếm dạng gạch dưới, không viền hộp. Số thứ tự đổi màu tím cho đoạn đã nghe.

**Màn đang phát**
- Bấm một đoạn thì tự phát. Ảnh nền nét dần, danh sách ẩn đi.
- Tên đoạn nằm ở góc trên trái, **không có khung**.
- Toàn bộ script nằm cố định ở bên trái, ngay trên ảnh, phía sau là lớp tối mờ; **không khung, không đồng bộ theo audio, không mốc thời gian, không hiệu ứng hiện từng chữ**; cuộn được.
- Thanh phát: ba nút điều khiển (đoạn trước, phát/dừng, đoạn sau), thanh thời gian, rồi ba nút icon: mắt (ẩn/hiện script), ba đường gạch (về danh sách), hai mũi tên (phát ngẫu nhiên đoạn khác).
- Điện thoại: thanh phát còn **đúng hai dòng**: dòng các nút, dòng thanh thời gian.
- Hết một đoạn thì tự chuyển sang đoạn kế (không có nút bật/tắt).

**Đã bỏ chủ ý (đừng thêm lại):** thanh volume, hẹn giờ tắt, nút tải file lên, sóng âm hay equalizer, thanh tab con (Kể bên người, Ước hẹn rung động...), dòng "TRANSMISSION // ...", "... MHz", "BY YOUR SIDE // n TRANSMISSIONS", dòng "nên đeo tai nghe", mọi khung bao quanh tên đoạn.

**Màu và font:** đúng token trong `style.css` (tím `#A964F7`, ngà `#F2E6C4`...; font Chakra Petch, IBM Plex Mono, Be Vietnam Pro). Nếu site tự host font thì dùng font đã có thay cho link Google Fonts.

## KHÔNG LÀM
- Không đổi thiết kế, không thêm hiệu ứng hay nút mới, không thêm thư viện/framework, không thêm theo dõi (tracking), không tự phát khi vào trang.
- Nếu có điểm nào mâu thuẫn với site (ví dụ header cao hơn 72px, cấu trúc thư mục khác), **hỏi tôi** thay vì tự đổi thiết kế.

## TIÊU CHÍ NGHIỆM THU
- Mở qua máy chủ cục bộ: danh sách hiện đủ số đoạn trong `tracks.json`; bấm một đoạn thì phát đúng file; tua, đoạn trước/sau, ngẫu nhiên, ẩn/hiện script, về danh sách đều chạy.
- Hết một đoạn tự chuyển sang đoạn kế; hết đoạn cuối quay về đoạn đầu.
- Đổi ngôn ngữ của site thì tiêu đề, ô tìm kiếm, nhãn nút và nội dung đoạn đổi theo.
- Kiểm tra ở độ rộng 1920, 1440 và 390px: không tràn ngang, header của site không bị trang đè lên, thanh phát trên điện thoại đúng hai dòng.
- Không có lỗi trong console (ngoài lỗi 404 nếu có đoạn chưa có file).

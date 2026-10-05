# E-REPORT SAGS — rà soát FIXED UI RULE

Ngày: 04/10/2026. Bản sửa: V6.4.116, trên nền V6.4.115 MOBILE RELEASE SYNC.

## Kết quả sửa

- Dùng chung `SAGSButtonBase.create/enhance`, lớp `sagsUiButton` và token trong `fixed-ui-rule-v64113.css` cho nút hiện có và nút tạo động.
- Lớp CSS `sags-fixed-ui` giữ ưu tiên cho chuẩn nút trước CSS lịch sử: radius 12px, action 44px, điều hướng mobile/tablet 48px, chữ 13–14px, weight 700, nền navy và shadow phẳng.
- Icon toolbar nằm bên trái, kích thước 18px và accent theo chức năng. Bỏ nền bubble ở icon menu. Giữ nguyên chức năng Ký theo xác nhận của người quản lý.
- Hàng thao tác: Nhập nhanh / Ký / Xuất PDF / Hoàn tất, tùy quyền và trạng thái. Nhãn Nhập nhanh rút gọn thành Nhập ở màn hình 430px trở xuống, giữ tên trợ năng đầy đủ.
- Không ép hiện nút đã bị logic nghiệp vụ ẩn. Không thay node button hoặc callback nghiệp vụ khi chuẩn hóa icon/nhãn.
- Bỏ thao tác ghi lại class/style giống hệt ở mỗi lần reconcile, chặn vòng cập nhật toolbar liên tục.
- Điều hướng mobile/tablet chiếm 60px cộng safe area; content chừa chiều cao dock đo được + điều hướng + safe area + 12px. Không thu nhỏ biểu mẫu/PDF để bù chỗ.
- Sửa header A/C Limits tràn ngang; giữ tab và nút Đóng trong vùng màn hình.
- Nút trong repair.html và mobile-preview.html cũng dùng chuẩn chung.
- Chỉ trường nhập liệu dùng font 16px trong trình quản lý popup; input button/submit/reset dùng hệ chữ của nút.
- Giữ nguyên nền PWA mới trên main. Chỉ đồng bộ danh tính release/cache, URL asset và checksum cho bản sửa UI; không sửa thuật toán cache/controller hoặc dữ liệu Firebase.
- Lưu nguyên văn quy tắc trong FIXED_UI_RULE.md và hướng dẫn kế thừa trong AGENTS.md / PROJECT_RULES.md.

## Kiểm tra

| Chiều rộng | Nút được đo trong popup | Kết quả |
|---|---:|---|
| 360px | 165 | Đạt |
| 375px | 165 | Đạt |
| 390px | 165 | Đạt |
| 412px | 165 | Đạt |
| 430px | 165 | Đạt |
| 820px tablet | 166 | Đạt |
| 1280px desktop | 166 | Đạt |

54 popup được dựng và kiểm tra ở mỗi chiều rộng; tổng 1.157 lượt đo nút, không còn vi phạm trong các mẫu đã kiểm tra. Bộ đo kiểm tra radius, chiều cao, cỡ/độ đậm chữ, shadow và biên ngang.

- Hành trình ứng dụng: đăng nhập, menu, My Flight, nút Menu/Trang chủ, mở lại và panel Admin trên năm cỡ mobile cùng desktop.
- Toolbar: bốn nút một hàng, cùng chiều cao; nút PDF ẩn vẫn ẩn; số cột cập nhật đúng; callback chữ ký được giữ; observer ngừng cập nhật khi rảnh.
- Component mới: callback click và hình học không đổi ở active, selected, disabled, loading; selected vẫn phân biệt bằng màu.
- Safe area: mô phỏng inset đáy 24px tại 390px, điều hướng cao 84px, dock 57px, padding nội dung 153px.
- Print: toolbar được ẩn.
- Hồ sơ chuyến: 12 tổ hợp quyền/viewport, mở/đóng/mở lại và khôi phục sau lỗi đều đạt.
- `npm test`, `npm run check:ui`, `npm run test:ui` và kiểm tra cú pháp đã chạy.

## Phạm vi xác minh

Kiểm tra trình duyệt dùng dữ liệu giả và không ghi Firebase thật. Hình học toolbar được đo trên snapshot DOM/CSS của ứng dụng để tách khỏi tiến trình cập nhật quyền nền; hành trình thật được kiểm tra riêng bằng mobile-navy và dossier. Safe area dùng mô phỏng CSS vì trình duyệt hiện có không hỗ trợ lệnh mô phỏng native.

Chưa xác minh trên iPhone/Android vật lý hoặc toàn bộ tổ hợp biểu mẫu, dữ liệu và vai trò trong hệ thống vận hành. Không thêm chức năng thu gọn mới; đã kiểm tra ẩn/hiện toolbar theo màn hình và bản in. Các test PDF nghiệp vụ đã qua, nhưng chưa xuất một PDF có chữ ký bằng dữ liệu vận hành thật.

Lệnh tái kiểm tra: `npm run test:ui`. Có thể đặt `SAGS_BROWSER_EXECUTABLE` để dùng trình duyệt được cài sẵn; `SAGS_UI_AUDIT_OUTPUT` và `SAGS_UI_SCREENSHOTS` để lưu số đo và ảnh kiểm tra.

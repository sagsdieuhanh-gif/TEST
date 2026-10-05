# Hướng dẫn mobile V6.4.107

1. Đăng nhập bằng tài khoản được AD cấp.
2. Chọn MENU để mở các chức năng theo quyền. Chọn TRANG CHỦ để trở về menu làm việc.
3. Trong My Flight, chọn ngày, tìm chuyến, chọn HỒ SƠ CHUYẾN để xem tài liệu và nhận hoặc tiếp tục nhiệm vụ.
4. Các nút NHẬN, TIẾP TỤC, XUẤT PDF, KẾT THÚC CHUYẾN giữ chức năng hiện có. Trạng thái hoàn thành và cảnh báo vẫn có màu riêng.
5. Khi có bản mới, bấm CẬP NHẬT. Không cần tải lại khi đang nhập dữ liệu. Kiểm tra nhãn V6.4.107 sau cập nhật.
6. ĐỔI MẬT KHẨU và ĐĂNG XUẤT ở cuối menu.

## Nội dung bản cập nhật

- Giao diện mobile dùng chung nền navy, thẻ bo góc, viền xanh, nút chính xanh sáng theo ảnh mẫu.
- Màn hình đăng nhập dùng hình máy bay có sẵn trong dự án; các ô nhập dễ chạm, chữ đủ lớn.
- Menu chỉ hiển thị tên chức năng. Các màn hình quản lý, hồ sơ và thanh thao tác dùng cùng bộ màu.
- Gom tài nguyên tải trang theo thứ tự, nén CSS và giảm việc quét lại DOM.
- Khôi phục fallback mở hồ sơ chuyến và giữ danh sách kho hàng riêng.
- Đồng bộ phiên bản, hash tài nguyên và cache PWA.
- TEST chạy trên địa chỉ của TEST; bỏ chuyển hướng sang dự án khác.

## Cập nhật V6.4.107

Header cao 48px, thẻ chức năng cao 48px, icon 28px. Thu gọn logo, thẻ thông tin tài khoản, khoảng cách nhóm chức năng và màn hình đăng nhập. My Flight giảm phần đầu và cỡ tiêu đề để hiển thị nhiều chuyến hơn. Menu dài có thể cuộn; các nút chính vẫn cao 44px.


### V6.4.108 — màn nghiệp vụ
My Flight cá nhân được thu gọn: đầu trang 56px, bộ lọc 44px, tab 44px, ô biểu mẫu 48px. Bỏ khối hướng dẫn lặp lại; giữ nút QUAY LẠI, LÀM MỚI, TỰ NHẬN VIỆC. Login và menu giữ nguyên. Bấm CẬP NHẬT để nạp bản mới.


### V6.4.109 — My Flight từ menu
Bấm My Flight mở màn gọn: header 54px, ô biểu mẫu 60px, ô ngày 44px. QUAY LẠI để về menu; giữ LÀM MỚI, TỰ NHẬN VIỆC, HỒ SƠ CHUYẾN và KẾT THÚC CHUYẾN. Bấm CẬP NHẬT để nạp bản mới.

## V6.4.110

MENU và TRANG CHỦ ở đáy mobile và luôn dùng được trong My Flight. ĐỔI MẬT KHẨU và ĐĂNG XUẤT nằm cùng một hàng trong menu. Bỏ QUAY LẠI và TỰ NHẬN VIỆC trong My Flight. Daily Roster mặc định cập nhật một phần: đọc preview, kiểm tra và xác nhận publish; chỉ chọn FULL khi thay toàn bộ ngày. Xem báo cáo trong TEST-V6.4.110-ROSTER-MOBILE.md.


## V6.4.111 — xác nhận Daily Roster

AD bấm ĐỔ DAILY ROSTER: nút XÁC NHẬN PUBLISH luôn hiển thị trong màn roster và giữ ở đầu vùng cuộn. Chọn file, kiểm tra PREVIEW rồi xác nhận. Nút bị khóa khi chưa chọn file, đang đọc hoặc có lỗi. Chỉ đọc file không ghi phân công; thông báo lỗi được giữ để AD xử lý rồi chọn lại file. Bấm CẬP NHẬT để nạp bản V6.4.111.


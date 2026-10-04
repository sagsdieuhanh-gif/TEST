============================================================
E-REPORT SAGS — FIXED UI RULE / BUTTON DESIGN SYSTEM
STATUS: MANDATORY
SCOPE: TOÀN BỘ DỰ ÁN
============================================================

Từ thời điểm này, toàn bộ giao diện của E-REPORT SAGS phải tuân thủ UI Rule dưới đây.

Đây là QUY TẮC CỐ ĐỊNH của dự án.

KHÔNG tự ý sáng tạo thêm style nút mới.
KHÔNG thay đổi ngôn ngữ thiết kế đã được duyệt.
KHÔNG vì thêm chức năng mới mà tạo thêm một kiểu button mới.

NGUYÊN TẮC CHÍNH:

"THÊM CHỨC NĂNG MỚI, KHÔNG THÊM PHONG CÁCH NÚT MỚI."


============================================================
1. STYLE BUTTON CHUẨN
============================================================

Tất cả button/action button trong hệ thống phải sử dụng cùng một kiểu thiết kế đã được duyệt ở màn hình biểu mẫu F54.

Hình dạng:

- Hình chữ nhật.
- Bo góc vừa phải.
- Không làm button hình tròn.
- Không làm dạng capsule/pill.
- Không bo tròn quá nhiều.
- Không tạo card lớn để giả làm button.

Border radius tiêu chuẩn:

10px – 14px.

Ưu tiên:

12px.

Button phải có cảm giác:
- gọn
- chắc
- hiện đại
- đồng nhất
- phù hợp giao diện dark navy hiện tại.


============================================================
2. CHIỀU CAO BUTTON
============================================================

Button phải có chiều cao GỌN.

Không được làm button quá cao hoặc chiếm quá nhiều không gian màn hình.

Mobile:

Action button nhỏ:
40px – 46px

Button điều hướng lớn:
46px – 52px

Desktop:

40px – 48px tùy khu vực.

Không tự ý tăng chiều cao chỉ để làm button nổi bật hơn.

Ưu tiên giữ chiều cao thấp nhưng vẫn đảm bảo vùng bấm thuận tiện.


============================================================
3. MÀU SẮC
============================================================

Button phải đồng bộ với giao diện hiện tại của E-REPORT SAGS.

Base color:

- Navy blue
- Dark blue
- Blue-grey

Border:

- xanh nhạt
- cyan-blue nhẹ
- opacity thấp

Không sử dụng:

- gradient quá mạnh
- shadow dày
- neon quá mức
- hiệu ứng 3D
- glassmorphism nặng
- màu sắc không liên quan tới hệ thống

Các màu khác chỉ dùng để phân biệt chức năng:

Nhập nhanh:
Blue / Cyan

Ghi chú:
Amber / Yellow

Xuất PDF:
Green

Hoàn tất:
Purple / Blue / Green tùy trạng thái

Màu chỉ được áp dụng chủ yếu cho ICON hoặc accent.

Không biến mỗi button thành một khối màu khác nhau quá mạnh.


============================================================
4. ICON
============================================================

Icon nằm bên trái.

Text nằm bên phải.

Cấu trúc:

[ ICON ]  LABEL

Icon và text phải căn giữa theo chiều dọc.

Icon:

18px – 22px trên mobile.

Không đặt icon vào một hình tròn lớn.

Không dùng icon bubble tròn.

Không tạo thêm nền tròn bao icon nếu không thực sự cần thiết.

Icon có thể sử dụng màu accent để phân biệt chức năng.


============================================================
5. TEXT BUTTON
============================================================

Text phải:

- rõ
- ngắn
- dễ đọc
- không quá lớn
- không xuống dòng nếu có thể tránh được

Font weight:

600 – 700.

Mobile:

13px – 15px.

Desktop:

14px – 16px.

Không sử dụng typography quá to chỉ để gây chú ý.


============================================================
6. PADDING
============================================================

Button phải gọn.

Padding mobile tham khảo:

padding-inline:
10px – 14px

padding-block:
8px – 10px

Không tạo khoảng trống lớn bên trong button.


============================================================
7. CÁC BUTTON CÙNG HÀNG
============================================================

Các button nằm cùng một hàng phải:

- cùng chiều cao
- cùng radius
- cùng border
- cùng padding
- icon cùng kích thước
- typography cùng hệ thống
- căn thẳng hàng

Không để một button cao hơn hoặc to hơn các button còn lại nếu chúng cùng cấp chức năng.


============================================================
8. TOOLBAR BIỂU MẪU MOBILE
============================================================

Toolbar ở màn hình biểu mẫu phải giữ đúng cấu trúc đã duyệt.

HÀNG 1:

[ Nhập nhanh ] [ Ghi chú ] [ Xuất PDF ] [ Hoàn tất ]

4 button nằm trên CÙNG MỘT HÀNG.

Button phải gọn.

Không xuống dòng nếu màn hình có đủ khả năng bố trí.

Có thể giảm:
- padding
- font-size
- khoảng cách icon

nhưng KHÔNG được phá style.


HÀNG 2:

[ MENU ] [ TRANG CHỦ ]

Hai button cùng một hàng.

Chiều rộng chia đều.

Không làm button quá cao.


============================================================
9. TOOLBAR CÓ THỂ THU GỌN
============================================================

Toolbar biểu mẫu được phép:

- mở
- đóng
- thu gọn
- hiện lại

Khi thu gọn:

phải tăng diện tích hiển thị biểu mẫu.

Khi mở:

phải hiển thị đúng 2 hàng button như thiết kế chuẩn.


============================================================
10. TUYỆT ĐỐI KHÔNG CHE NỘI DUNG
============================================================

Đây là quy tắc rất quan trọng.

Toolbar phía dưới KHÔNG ĐƯỢC đè lên:

- biểu mẫu
- input
- nút chức năng khác
- chữ ký
- footer
- nội dung PDF

Nếu toolbar sử dụng:

position: fixed

thì vùng nội dung phải tự động có:

padding-bottom = toolbar height + safe area + khoảng thở.

Ví dụ:

contentPaddingBottom =
toolbarHeight +
env(safe-area-inset-bottom) +
12px;

Không được giải quyết bằng cách ép nội dung hoặc thu nhỏ PDF bất hợp lý.


============================================================
11. SAFE AREA MOBILE
============================================================

Phải hỗ trợ:

env(safe-area-inset-bottom)

đối với thiết bị có:

- gesture navigation
- home indicator
- iPhone notch
- Android gesture bar

Không để button sát cạnh màn hình.


============================================================
12. RESPONSIVE
============================================================

Không sử dụng kích thước cứng khiến giao diện:

- tràn ngang
- xuống quá nhiều hàng
- che nội dung
- biến dạng

Ưu tiên:

CSS Grid
Flexbox
minmax()
clamp()

Ví dụ:

grid-template-columns:
repeat(4, minmax(0, 1fr));

Các button phải tự co giãn trong phạm vi hợp lý.


============================================================
13. TRẠNG THÁI BUTTON
============================================================

Các trạng thái:

normal
hover
active
selected
disabled
loading

chỉ được thay đổi:

- background
- border
- opacity
- brightness
- accent color

KHÔNG thay đổi:

- border radius
- chiều cao
- cấu trúc button
- vị trí icon
- hình dạng button


============================================================
14. KHÔNG ĐƯỢC TỰ Ý DÙNG STYLE SAU
============================================================

CẤM sử dụng tùy tiện:

- button hình tròn
- floating circle button
- pill button
- capsule button
- button quá cao
- giant CTA
- 3D button
- shadow quá mạnh
- glass card dày
- icon bubble lớn
- card chồng lên card
- mỗi chức năng một kiểu button khác nhau


============================================================
15. COMPONENT HÓA
============================================================

Không viết CSS button riêng rải rác trong từng màn hình.

Phải tạo component dùng chung.

Ví dụ:

AppButton
ActionButton
ToolbarButton
NavButton
IconButton

Tất cả component trên phải kế thừa cùng một Button Base Style.

Variant chỉ được phép thay đổi:

- accent color
- icon
- trạng thái
- kích thước trong phạm vi cho phép

Variant KHÔNG được thay đổi ngôn ngữ thiết kế.


============================================================
16. DESIGN TOKEN
============================================================

Ưu tiên tạo token dùng chung.

Ví dụ:

--ui-button-radius: 12px;
--ui-button-height: 44px;
--ui-button-nav-height: 48px;
--ui-button-font-size: 14px;
--ui-button-font-weight: 700;
--ui-button-icon-size: 20px;
--ui-button-gap: 8px;
--ui-button-padding-x: 12px;

--ui-button-bg: rgba(...);
--ui-button-border: rgba(...);
--ui-button-active: rgba(...);

Không hard-code các giá trị khác nhau ở từng màn hình.


============================================================
17. ÁP DỤNG CHO TOÀN DỰ ÁN
============================================================

Rule này áp dụng cho:

- Login
- Menu làm việc
- My Flight
- Form Viewer
- Form Manager
- FINAL
- Crosscheck
- Kết sổ
- Hồ sơ chuyến
- Thông báo
- Admin
- Popup
- Modal
- Bottom toolbar
- Desktop
- Tablet
- Mobile

Mọi màn hình mới cũng phải kế thừa rule này.


============================================================
18. QUY TẮC KHI SỬA CODE
============================================================

Trước khi tạo button mới:

1. Kiểm tra component button dùng chung.
2. Nếu component đã tồn tại → tái sử dụng.
3. Nếu cần chức năng khác → thêm variant.
4. Không tạo CSS button riêng nếu component hiện tại xử lý được.
5. Không thay đổi design system để phù hợp riêng một màn hình.


============================================================
19. KHÔNG ĐƯỢC PHÁ GIAO DIỆN HIỆN TẠI
============================================================

Khi chỉnh button:

KHÔNG được làm ảnh hưởng tới:

- logic nghiệp vụ
- Firebase
- quyền user
- dữ liệu chuyến
- Form Manager
- PDF
- chữ ký
- trạng thái biểu mẫu
- service worker
- PWA
- desktop layout

Chỉ chỉnh phần UI cần thiết.


============================================================
20. KIỂM TRA TRƯỚC KHI HOÀN THÀNH
============================================================

Bắt buộc test:

360px
375px
390px
412px
430px

và desktop.

Kiểm tra:

- không tràn màn hình
- không xuống dòng bất hợp lý
- không che nội dung
- không bị toolbar đè
- không bị safe-area đè
- button cùng hàng bằng nhau
- icon/text căn giữa
- toolbar mở/đóng bình thường


============================================================
21. UI RULE TỐI CAO
============================================================

Đây là rule mặc định và cố định của E-REPORT SAGS:

"THÊM CHỨC NĂNG MỚI NHƯNG KHÔNG THÊM MỘT PHONG CÁCH NÚT MỚI."

Nếu một yêu cầu mới không nói rõ cần thay đổi design system:

→ PHẢI GIỮ NGUYÊN STYLE BUTTON HIỆN TẠI.

Không tự thiết kế lại.

Không tự đổi style.

Không tự làm đẹp theo phong cách khác.

Nếu cần thay đổi toàn bộ design system:

→ phải có yêu cầu rõ ràng từ người quản lý dự án.

============================================================
END OF FIXED UI RULE
============================================================
# E-REPORT SAGS — FIXED UI RULE

**Status:** MANDATORY  
**Scope:** toàn bộ dự án, desktop + tablet + mobile.

> **THÊM CHỨC NĂNG MỚI NHƯNG KHÔNG THÊM MỘT PHONG CÁCH NÚT MỚI.**

## Button base
- Mọi button/action dùng hình chữ nhật bo góc vừa phải. Radius chuẩn **12px**, phạm vi cho phép **10–14px**.
- Cấm button tròn, pill/capsule, giant CTA, 3D, shadow dày hoặc glassmorphism nặng.
- Mobile action button: **40–46px**; navigation button: **46–52px**. Desktop thường **40–48px**.
- Nền mặc định navy/dark blue, border xanh nhạt tinh tế; semantic danger/warning/success được giữ màu chức năng nhưng không đổi hình học.
- Icon trái, chữ phải; icon khoảng **18–22px**; cùng hàng phải cùng chiều cao/radius/border/padding.
- Font button mobile **13–15px**, desktop **14–16px**, weight **600–700**. Hạn chế xuống dòng bằng cách giảm padding/font hợp lý, không tăng chiều cao tùy tiện.
- Hover/active/selected/disabled chỉ đổi màu, border, opacity hoặc brightness; không đổi hình dạng.
- Tái sử dụng component/token chung. Không viết một style button riêng chỉ cho một màn hình nếu base component xử lý được.

## Form toolbar mobile
- Thanh thao tác biểu mẫu là một dock gọn, không chồng card lên card.
- Hàng action phải gom các thao tác hiện có trên **một hàng**; chuẩn mục tiêu là Nhập nhanh / thao tác nhập-ký liên quan / Xuất PDF / Hoàn tất.
- Hàng điều hướng bên dưới chỉ gồm **Menu | Trang chủ**.
- Nếu chức năng hiện hữu khác theo từng biểu mẫu, giữ logic nghiệp vụ nhưng vẫn dùng cùng hình học button. Không xóa chức năng chỉ để ép đủ số nút.
- Toolbar có thể thu gọn/mở lại nhưng khi mở phải giữ nguyên design system.

## Không che nội dung
- Fixed toolbar không được đè lên PDF, input, chữ ký, footer hoặc nội dung biểu mẫu.
- Vùng nội dung phải chừa bottom padding bằng: **form dock height + navigation height + safe area + khoảng thở**.
- Bắt buộc hỗ trợ `env(safe-area-inset-bottom)`.
- Không sửa lỗi overlap bằng cách ép nhỏ PDF hoặc khóa cuộn.

## Responsive
Bắt buộc kiểm tra tối thiểu: **360, 375, 390, 412, 430px** và desktop. Không tràn ngang, không xuống dòng bất hợp lý, không mất nút, không che nội dung.

## UI copy
- Không hiển thị lại các khối trạng thái biểu mẫu đã có ở khu vực chính.
- Loại bỏ các khối dư kiểu **“HỒ SƠ BIỂU MẪU · F-54/F-94 · CHỜ NHẬN”** nếu cùng trạng thái đã được thể hiện ở danh sách/biểu mẫu phía trên.
- Không hiển thị câu giải thích dư **“Hoàn tất nhập biểu mẫu và Kết thúc chuyến là hai trạng thái riêng biệt.”**

## Quy tắc sửa code
1. Kiểm tra component/style chung trước khi tạo button.
2. Có component thì tái sử dụng; khác chức năng thì dùng variant, không tạo design system mới.
3. Không ảnh hưởng logic nghiệp vụ, Firebase, phân quyền, roster, form state, PDF/chữ ký, PWA/service worker.
4. Khi thay đổi UI release phải giữ đồng bộ version/cache/asset-manifest.
5. Nếu yêu cầu mới không nói rõ đổi design system, **phải giữ FIXED UI RULE này**.

Implementation authority for current release:
- `app/styles/fixed-ui-rule-v64113.css` là lớp CSS override cuối cùng.
- `app/boot/32-fixed-ui-rule-v64113.js` chỉ sắp xếp UI động/loại copy trùng, không được thay đổi nghiệp vụ.


## Legacy UI normalization
- Khi rà soát màn hình cũ, mọi `button`, `[role="button"]`, submit/reset control và action động phải được đưa về cùng hình học chuẩn: radius 12px, shadow phẳng, chiều cao gọn và trạng thái chỉ đổi màu/border.
- Các nút đóng/quay lại/icon-only vẫn giữ chức năng riêng nhưng **không được biến thành nút tròn hoặc pill**; dùng hình chữ nhật bo góc cùng hệ.
- Semantic danger/success/warning chỉ dùng màu accent; không được đổi sang một hình dáng button khác.
- Lớp override cuối cùng có quyền chuẩn hóa legacy UI để tránh mỗi module tự tạo một phong cách nút riêng.


## PWA / release identity
- Mỗi build phát hành **bắt buộc có CacheStorage riêng**, tên cache phải được suy ra từ chính `build`; cấm tái sử dụng tên cache của build cũ.
- Không được coi một bản cập nhật là hoàn tất chỉ vì số version trên giao diện đã đổi. `index.html`, `version.json`, `asset-manifest.json`, service worker đang điều khiển và các UI asset phải cùng **một build**.
- Nếu `index.html` đang chạy build mới nhưng service worker/controller còn build cũ, ứng dụng phải tự chuyển sang luồng repair trước khi tiếp tục sử dụng.
- Cache hit của executable/CSS phải được đối chiếu checksum của manifest hiện hành; cache sai checksum phải bị loại bỏ và tải lại.
- Service worker sau khi activate và vượt qua xác minh release phải claim client để tránh tình trạng “version mới nhưng giao diện/nội dung bên trong vẫn là bản cũ”.
- Mọi thay đổi UI/PWA release phải có regression guard cho cache identity và mixed-build protection.


## Xác nhận của người quản lý — 04/10/2026
- Văn bản đầy đủ, bắt buộc: `FIXED_UI_RULE.md`.
- Giữ nút **Ký** và chức năng chữ ký hiện có, theo xác nhận trực tiếp của người quản lý. Hàng thao tác hiện tại: **Nhập nhanh | Ký | Xuất PDF | Hoàn tất**, tùy quyền và trạng thái biểu mẫu.
- Trên màn hình 430px trở xuống, nhãn Nhập nhanh được rút gọn thành **Nhập** để giữ chữ 13px và icon 18px; tên trợ năng đầy đủ vẫn là Nhập nhanh.
- `SAGSButtonBase.create/enhance` là API dùng chung cho nút mới/cũ. Các nút động kế thừa lớp `sagsUiButton`.
- CSS layer `sags-fixed-ui` có quyền ưu tiên các thuộc tính UI chuẩn trước CSS lịch sử; không được ghi đè trạng thái ẩn theo quyền hoặc trạng thái hoàn tất.


## My Flight navigation contract
- **Không tạo nút mũi tên Quay lại trong My Flight.** Điều hướng dùng **MENU** và **TRANG CHỦ** của hệ thống.
- Không dùng MutationObserver để gỡ/chèn nút back theo trạng thái; cấm tái tạo vòng lặp focus/render trên mobile.
- Từ Hồ sơ chuyến đóng hồ sơ để trở về My Flight; từ My Flight dùng MENU để mở menu hệ thống hoặc TRANG CHỦ để về màn hình chính.
- KH/Cargo phải dùng **cùng chính renderer/card/tile/header/tabs của My Flight** như ĐH/CBTT/PVHK. Không dùng tiêu đề “DANH SÁCH CHUYẾN BAY”, không tạo shell UI riêng.
- Khác biệt của KH/Cargo chỉ là phạm vi dữ liệu: được xem toàn bộ chuyến có FSAGS 208, tìm theo số hiệu và nhận chuyến cần xử lý; không phụ thuộc roster theo tên như ĐH/CBTT.


## Performance / scale contract
- `app/core/app.v503.js` và `app/core/runtime.v503hf2.bundle.js` là **source/build input**, không được nạp trực tiếp ở `index.html` hoặc đưa lại vào executable bootstrap.
- Runtime lớn phải giữ theo chunk độc lập để khi chỉ một phần thay đổi, PWA chỉ tải lại phần thay đổi thay vì tải lại một bundle lớn.
- Không thêm Firebase SDK vào startup nếu code không thực sự sử dụng. Auth, RTDB và Firestore hiện là SDK cần thiết; Functions compat không được nạp khi không có `firebase.functions/httpsCallable`.
- Service worker phải giữ build-unique cache + checksum contract, nhưng không được băm lại cùng một asset đã xác minh ở mọi request trong cùng worker lifetime.
- MutationObserver/UI patch không được quét lại toàn bộ DOM cho mỗi mutation. Chỉ xử lý vùng DOM thay đổi; full scan chỉ dùng ở initial/pageshow hoặc fallback có giới hạn.
- Danh sách My Flight/Daily Roster không được phát sinh hàng loạt Firebase reads không giới hạn. Chỉ đọc field thực sự dùng và phải có concurrency cap cho status leaves.
- Mọi tối ưu hiệu năng phải có regression guard, không được đánh đổi tính đúng của roster, form state, chữ ký, PDF, quyền truy cập hoặc release/PWA consistency.


## Quick input compact contract
- Màn **NHẬP NHANH** phải dùng cùng FIXED UI RULE với giao diện bên ngoài; không có button/icon/time control quá cao hoặc quá lớn.
- Tab khoảng **36px**, nút giờ hiện tại khoảng **34px**, footer action khoảng **38px**; radius 10–12px, navy + border xanh.
- Input giờ giữ kích thước chữ đủ dùng trên mobile nhưng giảm padding/chiều cao; không biến từng field thành card lớn.
- Không thay đổi logic lưu giờ, N/A, xóa giờ, keyboard hoặc thứ tự nghiệp vụ chỉ để đổi giao diện.

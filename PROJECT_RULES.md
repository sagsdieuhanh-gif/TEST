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

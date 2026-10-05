# TEST V6.4.110 — mobile và roster

Build: `V6.4.110-20261004-ROSTER-MOBILE-01`. Chỉ triển khai GitHub Pages TEST; cập nhật tự nguyện.

## Giao diện

- Mobile: MENU/TRANG CHỦ cố định ở đáy, 2 cột đều nhau, nút 44px; vẫn bấm được khi My Flight mở.
- ĐỔI MẬT KHẨU/ĐĂNG XUẤT cùng một hàng, cùng chiều cao và chiều rộng.
- My Flight: bỏ QUAY LẠI/TỰ NHẬN VIỆC, header 54px, form tile 60px, lịch 44px; menu tile 48px.
- Đã kiểm tra 320/360/390/430px và PC 1280px, gồm mở MENU từ My Flight.

## Kiến trúc

`formInstanceId = opDate + stable flightId/turnaround + canonicalForm`. Không chứa người hay leg. Kho dữ liệu dùng chung: `roster_flight_workspaces/{formInstanceId}/envelope`.

Assignment chứa người, ARR/DEP/TURN, COR/LD/BOTH, formInstanceId, thứ tự trách nhiệm, co-assignee, trạng thái và revision. Mailbox/session/flight assignment trỏ về form; mỗi assignment có trạng thái hoàn tất riêng. Local session dùng `form-{formInstanceId}`.

Parser phân COR/LD theo từng leg. Cùng người COR+LD → 42.3; khác người → COR 42.1 + LD 55.1. Dấu phẩy giữ nhóm hỗ trợ; `;`, `|`, xuống dòng giữ nhóm thứ tự. Dấu `/` mơ hồ chặn import. Mapping VZ → TVJ-GOF035 và policy cấu hình hãng được giữ.

Preview tính diff đầy đủ, không cắt 100 dòng, kiểm tra tài khoản trước publish. PARTIAL giữ chuyến ngoài file; FULL là toàn bộ ngày trong preview và có xác nhận. Đổi chế độ đọc lại preview. Publish dùng revision CAS và form transaction locks; stale preview bị chặn, import giống nhau không tăng revision. Import vào form đang có thay đổi chưa lưu bị chặn.

Envelope mới chỉ nhận seed master. Đổi canonical không sao chép input nghiệp vụ khác schema. Envelope cũ và assignment bị thay giữ trong lịch sử/inactive, không hard-delete. Khi migrate legacy cùng canonical, archive từng envelope trước khi chọn bản mới nhất. Đổi người dùng lại form và giữ dữ liệu đã lưu; khóa ghi cũ bị thu hồi.

Bàn giao lưu/flush trước, hoàn tất assignment, giải phóng khóa và cho trách nhiệm sau mở cùng envelope. ARR không phụ thuộc STD/PUSHBACK và không tự hoàn tất DEP hoặc 55.1. Nhóm hỗ trợ được ghi completion basis của assignment đã hoàn tất; không tạo bản sao.

Meaningful edit so với initial/seed: input, check/select, giờ, chữ ký, attachment/upload. Mở/xem/focus/chuyển trang và prefill không tự tính là edit. Một form chỉ có một edit token; người đã bàn giao/thu hồi không được save bằng token cũ.

## Kết quả A–X

Các ca dưới đây chạy code service thật với adapter RTDB in-memory hỗ trợ transaction và multi-location update. Đây là mô phỏng Firebase, không phải xác nhận integration trên Firebase đang chạy.

| Ca | Nội dung | Kết quả |
|---|---|---|
| A | COR=LD gives 42.3 ARR | PASS |
| B | different COR/LD gives 42.1 and 55.1 ARR | PASS |
| C | 42.3 ARR; 42.1+55.1 DEP | PASS |
| D | 42.1+55.1 ARR; 42.3 DEP | PASS |
| E | same user ARR/DEP uses one form and TURN | PASS |
| F | different users continue the same shared form data | PASS |
| G | DEP structure update preserves ARR | PASS |
| H | ARR structure update preserves DEP | PASS |
| I | unedited owner transfers immediately | PASS |
| J | open/focus/prefill is not meaningful edit | PASS |
| K | edited form data is preserved on reassignment | PASS |
| L | handover keeps form identity and exclusive lock | PASS |
| M | partial upload preserves absent flights | PASS |
| N | full snapshot revokes absent assignments without deleting | PASS |
| O | stale AD preview rejected | PASS |
| P | identical re-upload is a no-op | PASS |
| Q | unknown account blocks whole batch | PASS |
| R | one active instance per flight/canonical form | PASS |
| S | duplicate responsibility blocked; ambiguous slash blocked | PASS |
| T | ARR completion does not complete DEP or 55.1 | PASS |
| U | ARR/DEP user A/B share one workspace | PASS |
| V | same user both legs uses same local form ID | PASS |
| W | old mailbox and flight assignment are inactive after DEP replacement | PASS |
| X | form schema change retains old data and audit | PASS |

Ngoài A–X: dirty-lock rejection, co-assignee bàn giao, attachment ngoài state và mapping VZ được kiểm tra.

## Kiểm tra bổ sung

- `build-runtime.cjs --check`, `build-ui-assets.cjs --check`, toàn bộ `npm test`.
- Browser: DOM/click dossier 12 tổ hợp role/viewport; CSV parser → preview → nút publish; login/menu/My Flight/admin mobile và PC.
- Release/index/service worker/manifest đồng nhất. PWA checksum staging giữ release trước khi asset lỗi.
- Giữ startup 48 script/15 stylesheet bằng cách đưa service vào bundle có sẵn.
- Sửa build-runtime để cùng quy tắc minify với UI builder, và `--check` không sửa manifest.
- Sửa regression cũ: biến `dd` chưa khai báo trong test; test readonly/status đọc đúng API status-leaf hiện tại; policy test dùng cấu hình repository hiện tại thay kỳ vọng cấu hình cũ. Không đổi file cấu hình hãng để làm test qua.

## Giới hạn xác minh

Chưa thực hiện publish/handover trên Firebase thật bằng hai tài khoản vận hành và AD; không ghi dữ liệu nghiệp vụ thật trong quá trình QA. Cần xác minh quyền RTDB đối với transaction workspace/revision bằng tài khoản thật ở TEST trước khi dùng roster cho khai thác. Các luồng FINAL và FSAGS208 chuyên biệt giữ handler hiện có; A–X tập trung COR/LD 42.3/42.1/55.1. Khóa phía client không thay thế Firebase Security Rules.

## File chính

- `app/core/app.v503.js`: parser, preview và các entry point roster/nhận/bàn giao/đổi người.
- `app/modules/roster-responsibility.v1.js`: canonical identity, diff, CAS, locks, shared save/handover/audit.
- `app/modules/daily-roster.v502.js`: card/status/form-pointer và chặn sync pushback hoàn tất assignment canonical.
- `app/modules/flight-governance.v1.js`: canonical reassignment đi qua preview/CAS.
- `app/boot/10-v470-hybrid-core.js`: ref tới cùng namespace RTDB hiện có.
- `app/modules/workflow-cleanup.v6444.js`, `self-accept.v502.js`, `app/styles/mobile-navy-v64106.css`: mobile navigation và bỏ nút trùng.
- `tools/build-runtime.cjs`, runtime/generated/UI bundles, `index.html`, `version.json`, `service-worker.js`, `asset-manifest.json`: build/release.
- `tests/roster-responsibility.test.cjs`, `tests/browser/roster-import.cjs`, `tests/browser/mobile-navy.cjs` và workflow CI.

Link TEST: https://sagsdieuhanh-gif.github.io/TEST/?__sags_release=V6.4.110-20261004-ROSTER-MOBILE-01&_expected=V6.4.110-20261004-ROSTER-MOBILE-01

Nếu vẫn thấy V6.4.109: https://sagsdieuhanh-gif.github.io/TEST/repair.html

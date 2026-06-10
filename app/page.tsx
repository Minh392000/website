'use client'

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  Shield, 
  Code, 
  Brain, 
  Trophy, 
  ChevronLeft,
  ChevronRight, 
  Terminal, 
  User, 
  Bell, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Send, 
  Loader2, 
  Sparkles, 
  Download, 
  Award, 
  Copy, 
  Check, 
  HelpCircle,
  Menu,
  X,
  History
} from 'lucide-react';
import { 
  subscribeToGlobalStats, 
  completeModuleOnFirebase, 
  GlobalStats 
} from '@/lib/firebase';

// Question JSON structure for Quiz Engine
interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

const MODULE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    questionText: "Thuật toán RSA hoạt động dựa trên bài toán nghịch đảo hoặc độ khó của lĩnh vực toán học nào sau đây?",
    options: [
      "Bài toán tìm Logarit rời rạc trên trường hữu hạn",
      "Bài toán phân tích một số nguyên cực lớn thành thừa số nguyên tố (Integer Factorization)",
      "Bài toán tìm đường đi ngắn nhất trên đồ thị mật mã",
      "Phép cộng điểm trên bản đồ đường cong Elliptic (ECC)"
    ],
    correctAnswerIndex: 1,
    explanation: "Độ an toàn của mật mã RSA dựa trên độ khó của bài toán phân tích thừa số nguyên tố (Integer Factorization). Việc nhân hai số nguyên tố lớn p và q cực kỳ đơn giản (thuận), nhưng tìm lại p và q khi chỉ biết tích n = p * q là bài toán cực kỳ khó (nghịch)."
  },
  {
    id: 2,
    questionText: "Cặp khóa (Key pair) được tạo ra trong thuật toán mật mã RSA bao gồm những thành phần cụ thể nào?",
    options: [
      "Khóa riêng (d, p) và Khóa phối hợp (e, q)",
      "Khóa công khai (e) và Khóa giải mã (d)",
      "Khóa công khai gồm bộ đôi (e, n) và Khóa bí mật gồm bộ đôi (d, n)",
      "Khóa bí mật mật mã luồng (S-Box) tương thích với p và q"
    ],
    correctAnswerIndex: 2,
    explanation: "Trong RSA, khóa công khai bao gồm số mũ mã hóa e và mô-đun n tức bộ đôi (e, n). Khóa bí mật (riêng tư) bao gồm số mũ giải mã d và mô-đun n tức bộ đôi (d, n). Các số p và q phải được giữ kín hoặc tiêu hủy sau khi sinh khóa."
  },
  {
    id: 3,
    questionText: "Để phòng chống các cuộc đòn tấn công vét cạn hoặc tìm thừa số nguyên tố hiện nay, kích thước khóa (Key Size) tối thiểu được khuyến nghị cho thuật toán RSA là bao nhiêu?",
    options: [
      "256 bit",
      "512 bit",
      "1024-bit",
      "2048-bit hoặc cao hơn"
    ],
    correctAnswerIndex: 3,
    explanation: "Hiện nay hệ thống máy tính có hiệu năng cực cao và các thuật toán phân tích số nguyên tố tiên tiến đã có thể bẻ khóa RSA 1024-bit trong thời gian thực tế. Vì vậy, các tiêu chuẩn bảo mật hiện đại như NIST, OWASP luôn khuyến nghị sử dụng kích thước khóa tối thiểu là 2048-bit (hoặc 4096-bit cho hệ thống tối mật)."
  },
  {
    id: 4,
    questionText: "Kích thước khối (block size) tiêu chuẩn của thuật toán mã hóa đối xứng AES (Advanced Encryption Standard) là bao nhiêu bit?",
    options: [
      "64 bit",
      "128 bit",
      "256 bit",
      "512 bit"
    ],
    correctAnswerIndex: 1,
    explanation: "Khác với người tiền nhiệm DES có block size 64 bit, thuật toán AES mã hóa dữ liệu theo từng khối cố định có kích thước 128 bit, không phụ thuộc vào độ dài của khóa (128, 192 hoặc 256 bit)."
  },
  {
    id: 5,
    questionText: "Điểm khác biệt cốt lõi giữa mã hóa đối xứng (Symmetric Crytography) và mã hóa bất đối xứng (Asymmetric Crytography) là gì?",
    options: [
      "Mã hóa đối xứng nhanh hơn và dùng chung một khóa bí mật cho cả mã hóa và giải mã",
      "Mã hóa bất đối xứng chỉ có thể vận hành trên môi trường mạng nội bộ (LAN)",
      "Mã hóa đối xứng an toàn tuyệt đối trước máy tính lượng tử tương lai",
      "Mã hóa bất đối xứng yêu cầu tất cả người dùng phải chia sẻ chung một khóa giải mã"
    ],
    correctAnswerIndex: 0,
    explanation: "Mã hóa đối xứng sử dụng duy nhất một khóa (Shared Secret Key) cho cả 2 quá trình mã hóa và giải mã nên hiệu năng rất nhanh. Trong khi đó, mã hóa bất đối xứng sử dụng một cặp khóa (Public/Private Key) giải quyết tốt bài toán phân phối khóa."
  },
  {
    id: 6,
    questionText: "Phương pháp nào sau đây được khuyến nghị lựa chọn hàng đầu hiện nay khi lưu trữ mật khẩu người dùng trong cơ sở dữ liệu?",
    options: [
      "Băm mật khẩu trực tiếp sử dụng thuật toán MD5 hoặc SHA-1",
      "Sử dụng thuật toán mã hóa đối xứng AES-256 để dễ dàng giải mã khi cần dùng",
      "Sử dụng thuật toán băm chậm, có cấu trúc lặp kèm Salt/Work Factor như Bcrypt, Argon2 hoặc PBKDF2",
      "Chuyển mật khẩu thành chuỗi Base64 rồi lưu trữ trực tiếp"
    ],
    correctAnswerIndex: 2,
    explanation: "Thuật toán băm nhanh như MD5, SHA-256 rất dễ bị tấn công brute-force bằng GPU siêu tốc. Các chuẩn như Bcrypt, Argon2 tích hợp bộ tham số độ phức tạp (Work Factor, Memory Cost) làm tăng đáng kể thời gian băm, ngăn chặn hiệu quả tấn công vét cạn."
  },
  {
    id: 7,
    questionText: "Mục đích chính của việc thêm chuỗi muối ngẫu nhiên (Salt) vào mật khẩu trước khi băm là gì?",
    options: [
      "Giúp tăng tốc độ xử lý khi người dùng thực hiện xác thực đăng nhập",
      "Chống lại các cuộc tấn công tra cứu bảng băm tính sẵn (Rainbow Table) và ngăn việc hai người dùng trùng mật khẩu có cùng mã băm",
      "Nén mật khẩu gốc thành kích thước nhỏ gọn hơn trước khi lưu",
      "Đảm bảo mật khẩu không thể chứa các ký tự đặc biệt nguy hiểm"
    ],
    correctAnswerIndex: 1,
    explanation: "Salt là một chuỗi ngẫu nhiên được thêm vào mật khẩu trước khi băm. Nó khiến cho việc tạo bảng Rainbow Table (tính sẵn mã băm của hàng triệu mật khẩu phổ biến) trở nên vô dụng, đồng thời đảm bảo hai người dùng có mật khẩu giống nhau vẫn có mã băm khác nhau hoàn toàn."
  },
  {
    id: 8,
    questionText: "Khái niệm Perfect Forward Secrecy (PFS) trong giao thức bảo mật truyền thông TLS mang tính chất đặc trưng nào sau đây?",
    options: [
      "Tự động tăng gấp đôi kích thước khóa công khai sau mỗi 30 ngày sử dụng",
      "Khóa phiên làm việc phụ thuộc hoàn toàn vào khóa bí mật dài hạn của máy chủ",
      "Việc lộ khóa bí mật dài hạn của máy chủ (Private Key) trong tương lai sẽ không làm ảnh hưởng đến tính bảo mật của các phiên làm việc đã diễn ra trước đó",
      "Đảm bảo mọi dữ liệu truyền đi đều được mã hóa bằng thuật toán không thể bẻ khóa"
    ],
    correctAnswerIndex: 2,
    explanation: "Perfect Forward Secrecy (PFS) đảm bảo rằng khóa phiên (Session Key) được thỏa thuận độc lập thông qua giao thức Diffie-Hellman tạm thời (Ephemerial Diffie-Hellman). Nếu khóa riêng dài hạn của máy chủ bị xâm phạm sau này, kẻ tấn công vẫn không thể giải mã các dữ liệu lưu lượng quá khứ đã thu thập được."
  },
  {
    id: 9,
    questionText: "Kẻ tấn công thực hiện kỹ thuật Man-in-the-Middle (MITM) đối với kết nối mã hóa TLS thông qua phương thức phổ biến nào sau đây?",
    options: [
      "Bẻ khóa trực tiếp mật mã AES-256 của lưu lượng trực tuyến",
      "Lừa nạn nhân cài đặt và tin tưởng một chứng chỉ CA giả mạo để ký khống cho tên miền đích",
      "Tăng cường băng thông đường truyền để ép trình duyệt hạ cấp giao thức mã hóa",
      "Gửi mã độc SQL Injection vào luồng dữ liệu bắt gói tin"
    ],
    correctAnswerIndex: 1,
    explanation: "Để giải mã và can thiệp lưu lượng HTTPS của nạn nhân mà không bị trình duyệt cảnh báo đỏ, kẻ tấn công cần lừa nạn nhân chấp nhận một Root Certificate Authority (CA) độc hại. Từ đó, proxy của hacker có thể tự sinh chứng chỉ giả mạo cho các trang web lớn như Google, Facebook."
  },
  {
    id: 10,
    questionText: "Giải pháp hiệu quả nhất để phòng chống triệt để lỗ hổng SQL Injection (SQLi) trong lập trình ứng dụng web là gì?",
    options: [
      "Sử dụng các biểu thức chính quy (Regex) để lọc bỏ toàn bộ ký từ nháy đơn (') của đầu vào",
      "Sử dụng truy vấn có tham số hóa (Parameterized Query / Prepared Statements)",
      "Mã hóa toàn bộ cơ sở dữ liệu với khóa đối xứng AES",
      "Ẩn thông báo lỗi hệ thống để kẻ tấn công không biết cấu trúc bảng"
    ],
    correctAnswerIndex: 1,
    explanation: "Prepared Statements tách biệt rạch ròi giữa phần mã thực thi SQL (Code) và phần dữ liệu đầu vào khách hàng (Data). Cơ sở dữ liệu sẽ phân tích cú pháp truy vấn trước rồi mới lắp ghép tham số, do đó đầu vào của hacker hoàn toàn mất khả năng thay đổi logic cấu trúc câu lệnh."
  },
  {
    id: 11,
    questionText: "Sự khác biệt chính giữa lỗ hổng Cross-Site Scripting (XSS) dạng Lưu trữ (Stored XSS) và dạng Phản chiếu (Reflected XSS) nằm ở điểm nào?",
    options: [
      "Stored XSS mã độc được lưu trực tiếp vào cơ sở dữ liệu máy chủ, trong khi Reflected XSS chỉ nằm tạm trong tham số yêu cầu và phản chiếu lại ngay trong phản hồi",
      "Reflected XSS nguy hiểm hơn vì nó tự động lan truyền qua mạng nội bộ máy chủ",
      "Stored XSS chỉ hoạt động trên trình duyệt cũ, còn Reflected XSS chạy trên mọi trình duyệt",
      "Mã độc của Reflected XSS được lưu trên LocalStorage của trình duyệt nạn nhân vô thời hạn"
    ],
    correctAnswerIndex: 0,
    explanation: "Stored XSS (Persistent XSS) lưu vĩnh viễn payload độc hại vào DB của máy chủ (như trong bình luận, tiểu sử). Mỗi khi có người truy cập trang tin đó, payload tự động thực thi. Còn Reflected XSS yêu cầu nạn nhân phải click vào một liên kết chứa sẵn mã độc để phản hồi hiển thị script."
  },
  {
    id: 12,
    questionText: "Cơ chế bảo mật nào dưới đây giúp bảo vệ hiệu quả ứng dụng khỏi cuộc tấn công giả mạo yêu cầu chéo trang CSRF?",
    options: [
      "Sử dụng CSP header ngăn thực thi inline script",
      "Áp dụng cookie thuộc tính SameSite (Lax/Strict) kết hợp kiểm thử CSRF Token duy nhất cho mỗi phiên làm việc",
      "Sử dụng giao thức HTTPS để truyền nhận cookies",
      "Băm mật khẩu người dùng với muối ngẫu nhiên"
    ],
    correctAnswerIndex: 1,
    explanation: "SameSite Cookie ngăn trình duyệt tự động gửi cookie xác thực khi người dùng định hướng từ trang ngoài. Đồng thời, CSRF Token (chuỗi ngẫu nhiên, bí mật được nhúng vào form yêu cầu phía client và đối sánh tại server) đảm bảo yêu cầu xuất phát từ chính form hợp lệ của hệ thống."
  },
  {
    id: 13,
    questionText: "Lỗ hổng Server-Side Request Forgery (SSRF) xảy ra khi ứng dụng web thực hiện hành vi nguy hiểm nào?",
    options: [
      "Cho phép người dùng tải lên các file thực thi (.exe, .php) vô điều kiện",
      "Ứng dụng nhập URL từ người dùng và thực hiện yêu cầu HTTP đến máy chủ nội bộ hoặc dịch vụ bên thứ ba mà không kiểm duyệt (Validation)",
      "Kẻ tấn công chèn lệnh vào cơ sở dữ liệu làm sập hệ thống dịch vụ",
      "Kẻ trộm phiên làm việc Session hijacking của người quản trị tối cao"
    ],
    correctAnswerIndex: 1,
    explanation: "SSRF cho phép kẻ tấn công lợi dụng chính hệ thống máy chủ của bạn làm bàn đạp đứng ra gửi các request HTTP đến các địa chỉ IP nội bộ, mạng LAN riêng (như localhost, 127.0.0.1, AWS Metadata API) vốn không thể tiếp cận trực tiếp từ Internet."
  },
  {
    id: 14,
    questionText: "Lỗ hổng IDOR (Insecure Direct Object Reference) thường xuất phát từ sự thiếu sót trong lập trình nào sau đây?",
    options: [
      "Không băm khóa bí mật phiên đăng nhập",
      "Chỉ kiểm tra quyền truy cập ở giao diện (Frontend) mà thiếu bước kiểm tra quyền sở hữu đối tượng ở phía máy chủ (Server-side Access Control)",
      "Truyền dữ liệu bằng định dạng JSON thay vì XML cấu trúc",
      "Sử dụng HTTPS phiên bản quá cũ"
    ],
    correctAnswerIndex: 1,
    explanation: "IDOR xảy ra khi kẻ tấn công thay đổi mã định danh của đối tượng (ví dụ: `?invoice_id=1001` thành `1002`) để xem trộm thông tin người khác. Lỗi này do hệ thống thiếu bước phân quyền kiểm tra xem tài khoản đăng nhập hiện tại có thực sự sở hữu hóa đơn số 1002 hay không."
  },
  {
    id: 15,
    questionText: "Tính năng nào sau đây là mục tiêu cốt lõi của tiêu đề bảo mật Content Security Policy (CSP)?",
    options: [
      "Mã hóa toàn bộ các tệp tin hình ảnh tải lên máy chủ",
      "Giới hạn các nguồn tài nguyên (script, style, image, connect) được phép tải và thực thi trên trình duyệt để ngăn chặn tấn công XSS và Clickjacking",
      "Kiểm tra xem người dùng đã thực hiện đa thừa số xác thực MFA chưa",
      "Tự động khóa tài khoản nếu nhập sai mật khẩu quá 5 lần"
    ],
    correctAnswerIndex: 1,
    explanation: "CSP là một HTTP Response Header cực mạnh giúp quản lý tài nguyên chạy trên trình duyệt. Ví dụ, thiết lập `script-src 'self' https://apis.example.com` sẽ chặn hoàn toàn các đoạn mã javascript lạ được tiêm vào trang web của bạn từ các nguồn không được phép."
  },
  {
    id: 16,
    questionText: "Cơ chế CORS (Cross-Origin Resource Sharing) hoạt động nhằm mục đích giải quyết vấn đề bảo mật nào?",
    options: [
      "Ngăn chặn hoàn toàn máy chủ nhận request từ mạng ngoài",
      "Cho phép trình duyệt chia sẻ tài nguyên giữa các nguồn (Origin) khác nhau một cách an toàn có kiểm soát bằng cách sử dụng các tiêu đề HTTP đặc biệt",
      "Bảo mật cấu trúc hệ thống tệp tin trên đĩa cứng máy chủ",
      "Xác minh danh tính của người sử dụng thông qua chữ ký dạng số"
    ],
    correctAnswerIndex: 1,
    explanation: "Mặc định, chính sách đồng nguồn (Same-Origin Policy) cực đoan ngăn chặn JS đọc dữ liệu từ một trang web khác nguồn. CORS giúp máy chủ tuyên bố rõ ràng với trình duyệt rằng: Tôi cho phép trang web A, B được gọi API lấy dữ liệu của tôi qua các header như `Access-Control-Allow-Origin`."
  },
  {
    id: 17,
    questionText: "Sự khác biệt cơ bản giữa Hệ thống phát hiện xâm nhập (IDS) và Hệ thống ngăn ngừa xâm nhập (IPS) là gì?",
    options: [
      "IDS chỉ phân tích lưu lượng mạng cục bộ, IPS phân tích lưu lượng cloud",
      "IDS chỉ giám sát, đưa ra cảnh báo mối đe dọa (Passive), trong khi IPS chủ động chặn đứng (Block/Drop) lưu lượng độc hại khi phát hiện bất thường (Active)",
      "IDS chạy trên máy chủ Windows, IPS chạy độc quyền trên Linux",
      "IPS hoạt động kém chính xác và dễ bị vượt qua hơn IDS"
    ],
    correctAnswerIndex: 1,
    explanation: "IDS (Intrusion Detection System) giống như camera an ninh, phát hiện kẻ đột nhập và phát tín hiệu cảnh báo. IPS (Intrusion Prevention System) giống như bảo vệ trực tiếp, lao ra khống chế kẻ trộm bằng cách đóng cổng kết nối, chặn IP độc hại ngay lập tức."
  },
  {
    id: 18,
    questionText: "Tường lửa trạng thái (Stateful Firewall) ưu việt hơn Tường lửa phi trạng thái (Stateless Firewall) ở điểm cốt lõi nào?",
    options: [
      "Nó có khả năng ghi nhớ trạng thái và lịch sử các kết nối (TCP handshake, session state) để đưa ra phán quyết lọc gói tin thông minh hơn",
      "Nó tiêu tốn ít bộ nhớ RAM và băng thông xử lý mạng hơn",
      "Nó không cần cấu hình luật lệ lọc gói tin thủ công",
      "Nó hoạt động ở tầng vật lý (Physical Layer) của mô hình OSI"
    ],
    correctAnswerIndex: 0,
    explanation: "Stateful Firewall duy trì một bảng trạng thái (State Table) theo dõi các kết nối TCP đang mở. Nếu một gói tin phản hồi thuộc về một kết nối hợp lệ đã thiết lập trước đó, nó sẽ tự động cho qua mà không cần duyệt lại các luật lọc phức tạp từ đầu, phòng ngừa IP Spoofing."
  },
  {
    id: 19,
    questionText: "Giao thức TLS 1.3 loại bỏ hoàn toàn các thuật toán thiết lập khóa tĩnh (Static RSA) nhằm mục đích củng cố điều gì?",
    options: [
      "Tốc độ mã hóa các tệp tin đa phương tiện dung lượng lớn",
      "Bắt buộc ứng dụng cấu hình Perfect Forward Secrecy thông qua trao đổi khóa Diffie-Hellman",
      "Khả năng mở rộng băng thông hệ thống máy chủ đám mây",
      "Tính tương thích với các thiết bị di động cấu hình yếu"
    ],
    correctAnswerIndex: 1,
    explanation: "In TLS 1.2 trở về trước, việc dùng static RSA cho phép kẻ trộm giải mã toàn bộ lưu lượng trong quá khứ nếu chúng lấy được Private Key máy chủ sau đó. TLS 1.3 buộc phải sử dụng các thuật toán DH tạm thời, củng cố Forward Secrecy tuyệt đối."
  },
  {
    id: 20,
    questionText: "Mục đích chính của cơ chế bảo mật DNSSEC (Domain Name System Security Extensions) là đề phòng nguy cơ nào?",
    options: [
      "Ngăn chặn kẻ tấn công thực hiện kỹ thuật làm nghẽn mạng phân tán DDoS",
      "Cung cấp tính năng mã hóa toàn vẹn lưu lượng truy cập web HTTPS",
      "Chống lại các cuộc tấn công đầu độc bộ nhớ đệm DNS (DNS Cache Poisoning / Spoofing) bằng chữ ký số xác thực nguồn gốc bản ghi",
      "Tăng tốc độ phân giải tên miền toàn cầu"
    ],
    correctAnswerIndex: 2,
    explanation: "Hệ thống DNS gốc thiếu xác thực khiến hacker dễ dàng gửi bản ghi giả mạo trỏ domain ngân hàng về IP của chung. DNSSEC sử dụng chữ ký số mã hóa bất đối xứng để xác thực tính toàn vẹn và nguồn gốc chính thống của các bản ghi DNS được trả về."
  },
  {
    id: 21,
    questionText: "Lỗ hổng tràn bộ đệm (Buffer Overflow) trong các ứng dụng viết bằng ngôn ngữ C/C++ thường dẫn đến hệ quả bảo mật cực nghiêm trọng nào?",
    options: [
      "Cơ sở dữ liệu bị lộ thông tin mật khẩu ngay lập tức",
      "Kẻ tấn công ghi đè lên bộ nhớ ngăn xếp (Stack/Heap), thay đổi con trỏ chỉ lệnh (Instruction Pointer) để thực thi mã độc tùy ý (RCE)",
      "Mã nguồn của ứng dụng tự động bị xóa sạch khỏi ổ cứng",
      "Trình duyệt web của khách hàng bị đóng đột ngột"
    ],
    correctAnswerIndex: 1,
    explanation: "Ngôn ngữ C/C++ cho phép lập trình viên tự quản lý bộ nhớ trực tiếp mà không có bộ gom rác an toàn. Hàm như `strcpy` không kiểm soát kích thước mảng đầu vào có thể ghi đè dữ liệu ra ngoài phạm vi bộ đệm, làm hỏng địa chỉ trả về (Return Address) để chèn shellcode thực thi."
  },
  {
    id: 22,
    questionText: "Nguyên tắc Đặc quyền tối thiểu (Principle of Least Privilege - PoLP) quy định hướng tiếp cận phân quyền nào?",
    options: [
      "Cấp mọi quyền hạn mở rộng (Administrator) cho toàn bộ nhân viên để tiện phản ứng lúc khẩn cấp",
      "Chỉ cấp cho người dùng, chương trình hay tiến trình những quyền hạn tối thiểu tuyệt đối cần thiết để hoàn thành công việc được chỉ định",
      "Thay đổi mật khẩu hệ thống sau mỗi ca trực làm việc",
      "Không bao giờ cấp quyền truy cập hệ thống cho các dịch vụ bên thứ ba"
    ],
    correctAnswerIndex: 1,
    explanation: "Nguyên tắc Đặc quyền tối thiểu (PoLP) giới hạn phạm vi thiệt hại khi hệ thống bị xâm nhập. Ví dụ, một Web Server chỉ nên có quyền Đọc (Read) mã nguồn chứ không được phép có quyền Ghi (Write) để ngăn hacker sửa file hệ thống khi dính SQLi."
  },
  {
    id: 23,
    questionText: "Sự khác biệt căn bản giữa phân tích mã độc tĩnh (Static Analysis) và phân tích mã độc động (Dynamic Analysis) là gì?",
    options: [
      "Phân tích tĩnh kiểm tra mã nguồn hoặc cấu trúc file mà không chạy chương trình, còn phân tích động chạy tệp tin độc hại trong môi trường an toàn (Sandbox) để theo dõi hành vi trực tiếp",
      "Phân tích tĩnh yêu cầu phải rút phích cắm mạng máy tính trước tiên",
      "Phân tích động chỉ sử dụng phần mềm quét virus thương mại",
      "Phân tích tĩnh chính xác 100% đối với mọi loại ransomware hiện đại"
    ],
    correctAnswerIndex: 0,
    explanation: "Phân tích tĩnh (Static Analysis) an toàn hơn vì chỉ đọc mã bytecode, cấu trúc PE, chuỗi string mà không kích hoạt file độc. Phân tích động (Dynamic Analysis) chấp nhận rủi ro cho chạy file độc trong Sandbox để ghi nhận lệnh gọi hệ thống (system call), hành vi chỉnh sửa Registry."
  },
  {
    id: 24,
    questionText: "Trong hệ điều hành Windows, định dạng tệp tin thực thi tiêu chuẩn nào mà các kỹ sư đảo ngược và nhà phân tích phần mềm độc hại thường nghiên cứu sâu nhất?",
    options: [
      "ELF (Executable and Linkable Format)",
      "PE (Portable Executable)",
      "DMG (Apple Disk Image)",
      "APK (Android Package)"
    ],
    correctAnswerIndex: 1,
    explanation: "PE (Portable Executable) là định dạng chuẩn cho các file *.exe, *.dll, *.sys trên hệ điều hành Windows. Đầu tệp tin PE chứa các bảng Import/Export Address Table cực kỳ có giá trị để đoán các hàm API hệ thống mà mã độc sẽ sử dụng."
  },
  {
    id: 25,
    questionText: "Công nghệ phát hiện mã độc dựa trên phân tích hành vi đặc trưng (Heuristic-based) ưu việt hơn dựa trên chữ ký mẫu phân tích sẵn (Signature-based) ở điểm nào?",
    options: [
      "Nó quét hệ thống nhanh gấp hàng trăm lần so với quét truyền thống",
      "Nó có khả năng phát hiện các biến thể mã độc chưa từng ghi nhận trong lịch sử (Zero-day malware) nhờ phân tích logic dòng lệnh đáng ngờ",
      "Nó hoàn toàn không bao giờ xảy ra lỗi nhận diện nhầm tập tin vô hại (False Positive)",
      "Nó hoạt động độc lập mà không tiêu thụ bộ nhớ RAM máy tính"
    ],
    correctAnswerIndex: 1,
    explanation: "Phát hiện dựa trên chữ ký (Signature) sẽ thất bại hoàn toàn trước mã độc mới được tinh chỉnh một ký tự làm thay đổi mã hash MD5/SHA256. Phân tích Heuristic theo dõi cách ứng dụng gọi API (ví dụ: tự nhúng vào tiến trình explorer, đọc shadow copies) để phát hiện hành vi độc hại bất kể biến thể nào."
  },
  {
    id: 26,
    questionText: "Mã độc tống tiền (Ransomware) thường cố ý triệt hạ tính năng sao lưu nào sau đây của hệ điều hành Windows để ngăn cản việc khôi phục dữ liệu miễn phí?",
    options: [
      "Tự động tắt cửa sổ bảo mật Windows Defender",
      "Xóa sạch tệp tin sao lưu tạm thời Shadow Copies bằng lệnh 'vssadmin delete shadows /all /quiet'",
      "Khai tử kết nối Bluetooth với thiết bị lưu trữ ngoại vi",
      "Tải mã độc lén lút vào card đồ họa GPU"
    ],
    correctAnswerIndex: 1,
    explanation: "Volume Shadow Copy Service (VSS) tự động lưu trữ các phiên bản tệp tin cũ trên Windows. Ransomware luôn tìm kiếm và xóa bỏ toàn bộ các tệp shadow shadow copy này ngay từ đầu để ép buộc nạn nhân chỉ còn một cách duy nhất là trả tiền chuộc khóa giải mã."
  },
  {
    id: 27,
    questionText: "Kỹ thuật làm mờ mã nguồn (Code Obfuscation) được các tác giả viết mã độc (hoặc nhà bảo vệ bản quyền phần mềm) ứng dụng nhằm mục đích gì?",
    options: [
      "Nén dung lượng file thực thi để phân phối dễ dàng qua email",
      "Chuyển đổi logic mã nguồn thành dạng cực kỳ rối rắm, khó đọc và khó phân tích ngược bằng các công cụ dịch ngược (Decompiler), cản trở chuyên gia phân tích",
      "Tăng hiệu năng chạy chương trình trên các dòng CPU đa nhân",
      "Tự động chuyển mã nguồn C++ sang mã nguồn Python an toàn"
    ],
    correctAnswerIndex: 1,
    explanation: "Obfuscation áp dụng các thuật toán như mã hóa chuỗi chữ, đảo lộn luồng kiểm soát (control flow flattening), chèn mã rác (dead code). Nó khiến cho các chương trình dịch ngược sinh ra những khối mã lộn xộn, vô nghĩa đối với con người nhưng máy tính vẫn hiểu và chạy bình thường."
  },
  {
    id: 28,
    questionText: "Sự phân biệt chức năng biểu thị chuẩn xác nhất giữa phần mềm dịch ngược (Decompiler) và phần mềm gỡ lỗi (Debugger) là gì?",
    options: [
      "Decompiler dùng để tải file từ môi trường Internet, Debugger dùng để tải lên máy chủ bảo mật",
      "Decompiler chuyển đổi mã máy nhị phân ngược lại thành ngôn ngữ bậc cao (như C, Java) để đọc hiểu logic tĩnh, còn Debugger cho phép vận hành ứng dụng từng dòng lệnh (Step-by-step), kiểm soát thanh ghi và bộ nhớ thời gian thực để phân tích động",
      "Debugger hoạt động mà không cần file thực thi nạp sẵn",
      "Decompiler chỉ vẽ sơ đồ lớp thiết kế của ứng dụng"
    ],
    correctAnswerIndex: 1,
    explanation: "Decompiler (như Ghidra, IDA Pro decompiler) dịch ngược mã máy thành mã C giả để đọc hiểu logic cấu trúc thuận lợi. Debugger (như x64dbg, OllyDbg) là công cụ cho phép bạn đặt điểm dừng (breakpoint), xem biến chuyển của RAM tại mỗi giây chạy thực tế của tiến trình độc hại."
  },
  {
    id: 29,
    questionText: "Khi lưu trữ cookie chứa thông tin nhạy cảm của người dùng (như Session ID), bộ cờ bổ sung bảo vệ nghiêm ngặt tối ưu nào sau đây cần được đặt kèm?",
    options: [
      "HttpOnly, Secure, SameSite=Strict (hoặc Lax)",
      "Domain=.com, Expire=Never, Path=/",
      "NoScript, NoReferrer, Sandbox",
      "Cache-Control, Keep-Alive, Accept-Encoding"
    ],
    correctAnswerIndex: 0,
    explanation: "HttpOnly ngăn không cho Javascript truy cập cookie (chống Stored/Reflected XSS đánh cắp Session ID). Secure đảm bảo cookie chỉ truyền qua kết nối mã hóa HTTPS. SameSite ngăn cookie tự động gửi đi trong các request chéo trang (ngăn chặn đứng CSRF)."
  },
  {
    id: 30,
    questionText: "Lỗ hổng nghiêm trọng thường gặp khi xác thực JSON Web Token (JWT) không an sau khi nhận tại máy chủ là gì?",
    options: [
      "Sử dụng định dạng lưu trữ chuỗi văn bản không mã hóa Base64",
      "Server chấp nhận thuật toán băm rỗng 'alg': 'none' trong Header hoặc sử dụng khóa ký đối xứng yếu (HMAC với secret ngắn) dễ bị giải bẻ khóa offline",
      "Token vượt quá dung lượng tối đa cho phép của gói tin cookie",
      "Jwt tự động hết hạn khiến trải nghiệm người dùng bị gián đoạn"
    ],
    correctAnswerIndex: 1,
    explanation: "Nhiều thư viện JWT cũ hoặc cấu hình cẩu thả cho phép kẻ tấn công sửa đổi payload rồi đổi header thành `'alg': 'none'`, máy chủ bỏ qua bước xác minh chữ ký và thông qua tài khoản khống. Khóa ký ngắn cũng dễ bị tấn công brute-force để tìm ra Signature chính thống."
  },
  {
    id: 31,
    questionText: "Hình thức tấn công kỹ thuật xã hội 'Spear Phishing' sở hữu đặc tính phân biệt nào sau đây?",
    options: [
      "Gửi email lừa đảo hàng loạt cho mọi địa chỉ email có thể thu thập được trên mạng",
      "Cuộc tấn công nhắm mục tiêu chính xác vào một cá nhân, tổ chức cụ thể dựa trên việc nghiên cứu kỹ lưỡng thông tin cá nhân của nạn nhân trước đó",
      "Tấn công can thiệp vật lý vào trực tiếp hệ thống hạ tầng mạng ngoại vi",
      "Sử dụng máy quét cổng dịch vụ để tìm lỗ hổng phần cứng"
    ],
    correctAnswerIndex: 1,
    explanation: "Spear Phishing (Lừa đảo có mũi nhọn) cực kỳ tinh vi vì nó không gửi rác đại trà. Hacker thu thập chức vụ, tên đồng nghiệp, dự án nạn nhân đang làm qua LinkedIn/Facebook, rồi soạn email giả mạo sếp yêu cầu chuyển mật khẩu hoặc click link tài liệu dự án giả, độ thành công rất cao."
  },
  {
    id: 32,
    questionText: "Triết lý cốt lõi của Mô hình Bảo mật Không tin cậy (Zero Trust Security Model) được tóm gọn qua khẩu hiệu hành động nào?",
    options: [
      "Tin tưởng toàn bộ thiết bị nằm phía trong biên giới mạng LAN nội bộ máy chủ",
      "Không bao giờ tin tưởng, luôn luôn xác thực bắt buộc (Never Trust, Always Verify)",
      "Chỉ sử dụng mật khẩu một lần OTP cho tất cả các giao thức truyền nhận dữ liệu",
      "Tuyệt đối không cấp quyền quản trị tối cao cho bất kỳ ai"
    ],
    correctAnswerIndex: 1,
    explanation: "Zero Trust loại bỏ quan điểm truyền thống 'vành đai an toàn' (tin tưởng tuyệt đối người dùng bên trong văn phòng). Dưới mô hình này, mọi thiết bị, mọi người dùng, ở bất cứ vị trí địa lý nào, đều phải được xác minh danh tính liên tục và kiểm soát truy cập phân đoạn nghiêm ngặt trước khi cấp quyền."
  },
  {
    id: 33,
    questionText: "Ba yếu tố cốt lõi (MFA Categories) để cấu thành nên hệ thống Xác thực đa nhân tố là gì?",
    options: [
      "Họ tên, Số điện thoại và Địa chỉ email chính xác",
      "Thứ bạn biết (Knowledge), Thứ bạn sở hữu (Possession), và Thứ thuộc về con người bạn (Inherence)",
      "Mã PIN thẻ, Khóa vật lý đồng bộ và Chữ ký viết tay kỹ thuật số",
      "Địa chỉ IP thiết bị, Vị trí định vị GPS toàn cầu và Thời gian đăng nhập trực tuyến"
    ],
    correctAnswerIndex: 1,
    explanation: "MFA an toàn bắt buộc phải kết hợp ít nhất 2 trong 3 danh mục khác nhau: 1. Việc bạn biết (mật khẩu, mã PIN); 2. Việc bạn có (điện thoại nhận OTP, USB Security Key); 3. Sự hiện hữu vật lý của bạn (vân tay, quét khuôn mặt FaceID). Dùng 2 mật khẩu khác nhau không gọi là MFA."
  },
  {
    id: 34,
    questionText: "Lỗ hổng Heartbleed (CVE-2014-0160) nổi tiếng trong thư viện mã hóa OpenSSL xảy ra do nguyên nhân thiếu kiểm soát dữ liệu nào?",
    options: [
      "Tràn bộ nhớ đệm ghi (Buffer Overflow Write) làm hỏng các biến chạy hệ thống",
      "Lỗi tràn đọc bộ đệm (Buffer Over-read) cho phép kẻ tấn công đọc trái phép dữ liệu nhạy cảm trong bộ nhớ RAM máy chủ",
      "Tự động giải mã khóa riêng tư Private Key do thuật toán mã hóa lỗi thời",
      "SQL Injection can thiệp vào tiến trình bắt tay TLS"
    ],
    correctAnswerIndex: 1,
    explanation: "Heartbleed do việc OpenSSL không kiểm chứng độ dài thực tế của payload yêu cầu giữ kết nối (Heartbeat Request). Kẻ tấn công gửi yêu cầu khai báo payload dài 64KB nhưng thực tế chỉ gửi 1 byte. Máy chủ OpenSSL sao chép ngây thơ 64KB từ bộ nhớ đệm RAM trả về cho hacker, làm rò rỉ khóa riêng, mật khẩu đang nằm trong bộ nhớ RAM."
  },
  {
    id: 35,
    questionText: "Trong kỹ thuật quét cổng (Port Scanning), quá trình quét 'SYN Scan' (hay còn gọi là Half-Open Scan) hoạt động ra sao?",
    options: [
      "Thiết lập kết nối đầy đủ bằng cách hoàn thành bắt tay 3 bước TCP (SYN, SYN-ACK, ACK)",
      "Chỉ gửi gói tin SYN rồi đóng kết nối ngay phát khi nhận lại SYN-ACK mà không gửi lại ACK cuối cùng, tránh bị ghi nhận nhật ký của dịch vụ đích",
      "Chỉ sử dụng giao thức UDP không có cơ chế bắt tay",
      "Gửi liên tục hàng triệu gói tin chứa virus vào cổng để phá cấu trúc bảo mật"
    ],
    correctAnswerIndex: 1,
    explanation: "SYN Scan gửi gói SYN đầu tiên. Nếu nhận lại SYN-ACK, cổng đó đang mở; nếu nhận RST, cổng đóng. Quét này kết thúc nửa chừng (không gửi ACK cuối) nên kết nối không bao giờ được thiết lập hoàn chỉnh, giúp trình quét ẩn mình khỏi nhiều log ứng dụng truyền thống."
  },
  {
    id: 36,
    questionText: "Điểm khác biệt căn bản giữa muối mật khẩu (Salt) và tiêu mật khẩu (Pepper) trong mật mã học là gì?",
    options: [
      "Salt chỉ băm mật khẩu, Pepper dùng để giải mã mật khẩu sau đó",
      "Salt được lưu trữ công khai trực tiếp ngay trong cơ sở dữ liệu cùng với mã băm mật khẩu, còn Pepper là chuỗi bí mật hệ thống được lưu ngoài cơ sở dữ liệu (như trong biến môi trường hoặc HSM)",
      "Salt được lưu độc quyền trên máy tính khách, còn Pepper lưu trữ trên máy chủ",
      "Pepper có kích thước khóa gấp đôi so với Salt"
    ],
    correctAnswerIndex: 1,
    explanation: "Cả hai đều tăng cường tính duy nhất cho mã băm. Tuy nhiên, Salt lưu ngay trong DB bên cạnh mật khẩu băm, phòng thủ Rainbow Table. Pepper lưu giữ bí mật ở môi trường máy chủ độc lập (hoặc trong key vault). Nếu hacker tải trộm được file DB, chúng vẫn không thể nứt khóa vì thiếu Pepper bí mật."
  },
  {
    id: 37,
    questionText: "Hiện tượng trùng đầu băm (Hash Collision) xảy ra khi nào?",
    options: [
      "Một dữ liệu đầu vào sinh ra hai kết quả mã băm khác nhau",
      "Hai dữ liệu đầu vào khác nhau hoàn toàn nhưng lại tạo ra cùng một kết quả băm đầu ra",
      "Mã băm bị biến dạng do lỗi kết nối mạng",
      "Thuật toán băm chạy quá thời gian giới hạn của luồng xử lý"
    ],
    correctAnswerIndex: 1,
    explanation: "Vì tập hợp các đầu vào là vô hạn trong khi chiều dài của mã băm đầu ra là hữu hạn (ví dụ MD5 luôn là 128 bit), về mặt toán học chắc chắn sẽ có lúc hai chuỗi khác nhau có cùng mã băm. Thuật toán tốt như SHA-256 hay SHA-3 làm giảm xác suất này xuống cực kỳ nhỏ (gần như bằng 0 trong suốt vòng đời vũ trụ)."
  },
  {
    id: 38,
    questionText: "Chuỗi ủy thác tin cậy (Chain of Trust) của chứng chỉ bảo mật số hoạt động dựa trên cơ chế phân tầng nào dưới đây?",
    options: [
      "Bắt buộc người truy cập mạng phải ký số trực tiếp vào trang web",
      "Các chứng chỉ máy chủ (End-Entity) được ký nhận và xác thực bởi các CA trung gian (Intermediate CA), và các CA trung gian này cuối cùng được xác thực bởi một chứng chỉ gốc (Root CA) cực kỳ uy tín được cài đặt sẵn trong hệ điều hành",
      "Tự động gia hạn chứng chỉ miễn phí thông qua giao thức DNS",
      "Hệ thống tường lửa phân tầng lọc bỏ các yêu cầu không ký khóa"
    ],
    correctAnswerIndex: 1,
    explanation: "Hệ điều hành và trình duyệt của bạn tích hợp sẵn một danh sách các Root CA đáng tin cậy. Khi bạn vào một web HTTPS, trình duyệt sẽ kiểm tra xem ai ký chứng chỉ của trang web đó (ví dụ Let's Encrypt). Vì Let's Encrypt được chứng thực bởi Root CA đáng tin cậy, nên trình duyệt sẽ tin cậy trang web."
  },
  {
    id: 39,
    questionText: "Trong giao thức mật mã bảo mật, vai trò chính của chuỗi NONCE (Number Used Once) là để làm gì?",
    options: [
      "Dùng làm khóa bí mật phân phối cho toàn mạng",
      "Chống lại các cuộc tấn công phát lại (Replay Attacks) bằng cách sinh ra một chuỗi số dùng duy nhất một lần để đảm bảo tính tươi mới (Freshness) của thông điệp",
      "Gia tăng kích thước của gói tin truyền qua mạng",
      "Mã hóa các thông điệp phản hồi từ máy chủ"
    ],
    correctAnswerIndex: 1,
    explanation: "NONCE (Number used Once) ngăn kẻ tấn công chặn bắt gói tin xác thực hợp lệ của bạn rồi gửi lại nguyên trạng sau đó để đăng nhập khống (Replay Attack). Do máy chủ yêu cầu mỗi gói tin phải chứa một NONCE mới tinh chưa từng xuất hiện, gói tin gửi lại của hacker sẽ bị từ chối thẳng thừng do trùng lặp NONCE."
  },
  {
    id: 40,
    questionText: "Giao thức VPN hiện đại WireGuard sở hữu ưu điểm vượt bậc nào so với giao thức OpenVPN truyền thống?",
    options: [
      "Chỉ hỗ trợ hệ điều hành Windows cũ",
      "Mã nguồn cực kỳ tinh giản, tối giản (khoảng 4000 dòng so với hàng trăm ngàn dòng của OpenVPN), cho tốc độ kết nối siêu tốc, tiết kiệm pin tối đa và có bề mặt tấn công cực hẹp giúp hạn chế lỗ hổng phần mềm",
      "Hệ thống không sử dụng bất kỳ thuật toán mã hóa nào để tăng tốc dữ liệu",
      "Tự động vượt qua mọi cơ chế kiểm duyệt tường lửa vật lý của nhà mạng bằng AI"
    ],
    correctAnswerIndex: 1,
    explanation: "WireGuard là bước đột phá lớn trong VPN dải hẹp. Thay vì gánh vác hàng tá thuật toán cũ lỗi thời phức tạp của OpenVPN/IPsec, nó chỉ chọn lọc những kỹ thuật mật mã tiên tiến nhất (như ChaCha20, Curve25519) viết trong vỏn vẹn dưới 4000 dòng mã nguồn của nhân Linux, giúp hiệu năng truyền cực cao và dễ dàng kiểm toán bảo mật bảo vệ toàn vẹn thông tin."
  },
  {
    id: 41,
    questionText: "Trong hệ mật mã khóa công khai, quá trình dùng khóa bí mật để ký số (Digital Signature) và khóa công khai để xác thực chữ ký nhằm mục đích tối cao nào?",
    options: [
      "Đảm bảo tính bí mật tuyệt đối của nội dung thông điệp",
      "Đảm bảo tính xác thực nguồn gốc (Authenticity) và tính chống thoái thác (Non-repudiation) của thông điệp",
      "Tăng tốc độ truyền tải gói tin qua kênh truyền không tin cậy",
      "Tự động mã hóa thư mục chứa tệp tin lưu trữ"
    ],
    correctAnswerIndex: 1,
    explanation: "Chữ ký số sử dụng khóa bí mật (chỉ người chủ sở hữu biết) để ký, tạo ra một bằng chứng không thể giả mạo. Khóa công khai của họ được dùng để kiểm tra chữ ký. Bản chất này đáp ứng hoàn hảo tính xác thực nguồn gốc gửi và tính chống thoái thác (không thể chối bỏ hành vi ký)."
  },
  {
    id: 42,
    questionText: "Thuật toán băm (Hash Function) nào dưới đây đang bị coi là mất an toàn nghiêm trọng trước tấn công xung đột (Collision Attack) và không nên dùng?",
    options: [
      "SHA-256",
      "SHA-3",
      "MD5",
      "BLAKE3"
    ],
    correctAnswerIndex: 2,
    explanation: "Thuật toán MD5 (Message Digest 5) đã bị chứng minh là yếu trước các cuộc tấn công xung đột, nơi hai thông điệp khác nhau có thể tạo ra cùng một mã băm trong thời gian rất ngắn. Do đó, MD5 không còn được khuyến nghị cho các mục đích bảo mật."
  },
  {
    id: 43,
    questionText: "Phương thức tấn công dồn dập vào băng thông làm tràn ngập tài nguyên mạng của máy chủ nhằm mục đích từ chối dịch vụ được gọi là gì?",
    options: [
      "SQL Injection",
      "Distributed Denial of Service (DDoS)",
      "Cross-Site Scripting (XSS)",
      "Man-in-the-middle"
    ],
    correctAnswerIndex: 1,
    explanation: "Tấn công từ chối dịch vụ phân tán (DDoS) sử dụng một mạng lưới lớn các thiết bị nhiễm mã độc (Botnet) để gửi lưu lượng rác ồ ạt, làm nghẽn băng thông hệ thống hoặc cạn kiệt tài nguyên máy chủ, khiến người dùng hợp lệ không thể truy cập."
  },
  {
    id: 44,
    questionText: "Kỹ thuật phòng vệ mạng nào hoạt động bằng cách che giấu cấu trúc mạng nội bộ, chuyển đổi địa chỉ IP Private thành IP Public khi ra ngoài Internet?",
    options: [
      "Network Address Translation (NAT)",
      "Virtual Local Area Network (VLAN)",
      "Domain Name System (DNS)",
      "Address Resolution Protocol (ARP)"
    ],
    correctAnswerIndex: 0,
    explanation: "NAT (Network Address Translation) giúp ánh xạ dải IP nội bộ (không thể định tuyến trên Internet) sang một hoặc nhiều IP công cộng hợp lệ, giúp bảo mật cấu trúc mạng nội bộ trước các ánh mắt dò quét bên ngoài."
  },
  {
    id: 45,
    questionText: "Cơ thức tấn công lừa đảo trực tuyến bằng cách giả mạo Email, Landing Page của cơ quan, tổ chức uy tín để dụ người dùng nhập tài khoản được gọi là:",
    options: [
      "Phishing",
      "Spoofing",
      "Eavesdropping",
      "Sniffing"
    ],
    correctAnswerIndex: 0,
    explanation: "Phishing (tấn công giả mạo) là hình thức tấn công kỹ thuật xã hội (Social Engineering) cực kỳ phổ biến, lợi dụng tâm lý nhẹ dạ cả tin để đánh cắp các dữ liệu nhạy cảm như thông tin tài khoản, mật khẩu hoặc thẻ tín dụng."
  },
  {
    id: 46,
    questionText: "Mục đích chính của cơ chế phòng thủ 'Defense in Depth' trong kiến trúc an toàn thông tin là gì?",
    options: [
      "Chỉ sử dụng một bức tường lửa cực mạnh ở cổng vào duy nhất",
      "Áp dụng nhiều lớp kiểm soát bảo mật khác nhau trên toàn hệ thống để nếu một lớp bị phá vỡ, các lớp khác vẫn kiểm soát được thiệt hại",
      "Mã hóa toàn bộ máy chủ bằng hệ điều hành Windows độc quyền",
      "Tự động tắt máy chủ khi phát hiện bất kỳ cảnh báo lạ nào"
    ],
    correctAnswerIndex: 1,
    explanation: "Defense in Depth (Phòng thủ chiều sâu) xây dựng nhiều rào cản từ lớp mạng, ứng dụng, dữ liệu đến con người. Nguyên lý cốt lõi là không phụ thuộc vào bất kỳ cơ chế kiểm soát bảo mật đơn lẻ nào."
  },
  {
    id: 47,
    questionText: "Mã hóa bảo mật thông điệp trong giao thức HTTPS sử dụng cơ chế lai (Hybrid Cryptography). Giải thuật này kết hợp các thành phần nào?",
    options: [
      "Kết hợp ưu thế của RSA/ECC (để trao đổi khóa an toàn) và mật mã đối xứng AES (để mã hóa nhanh dữ liệu phiên truyền)",
      "Mã hóa đồng thời bằng cả MD5 kết hợp cùng Base64 bảo mật",
      "Sử dụng VPN chuyên dụng kết hợp tường lửa phần cứng thế hệ mới",
      "Gửi dữ liệu trực tiếp qua mạng không dây nội bộ đã được mã hóa sẵn"
    ],
    correctAnswerIndex: 0,
    explanation: "Hybrid Cryptography (Mã hóa lai) tận dụng tối đa tốc độ của mã hóa đối xứng (AES) để truyền dữ liệu khối lượng lớn, đồng thời dùng mã hóa bất đối xứng tinh vi (RSA hoặc ECC) để giải quyết bài toán cốt lõi: thỏa thuận khóa phiên an toàn."
  },
  {
    id: 48,
    questionText: "Khái niệm 'Zero Trust' trong kiến trúc bảo mật hiện đại được xây dựng dựa trên nguyên tắc hành xử cốt lõi nào?",
    options: [
      "Tin tưởng tuyệt đối vào người dùng bên trong mạng nội bộ",
      "Chỉ tin tưởng các thiết bị sử dụng hệ điều hành di động",
      "Không bao giờ tin tưởng, luôn luôn xác thực bắt buộc (Never Trust, Always Verify)",
      "Chỉ xác thực người dùng một lần duy nhất lúc đăng ký"
    ],
    correctAnswerIndex: 2,
    explanation: "Mô hình Zero Trust loại bỏ hoàn toàn khái niệm 'vùng mạng nội bộ tin cậy'. Bất kể người dùng hay thiết bị ở đâu (bên trong hay ngoài tường lửa), mọi yêu cầu truy cập tài nguyên đều phải được định danh, xác thực và phân quyền liên tục."
  },
  {
    id: 49,
    questionText: "Đâu là nguy cơ bảo mật lớn nhất khi lập trình viên nhúng trực tiếp API Key bí mật vào mã nguồn Frontend (như HTML/JS chạy trên trình duyệt)?",
    options: [
      "Làm cho tốc độ phản hồi của trang web bị chậm đi đáng kể",
      "Kẻ tấn công có thể dễ dàng xem nguồn trang (F12 / View Source) để đánh cắp khóa bí mật và lạm dụng tài nguyên",
      "Gây xung đột với các thư viện CSS được nạp từ CDN ngoại mạng",
      "Trình duyệt sẽ chặn không cho hiển thị trang web đó lên màn hình"
    ],
    correctAnswerIndex: 1,
    explanation: "Mã nguồn Frontend hoàn toàn chạy trên máy khách, nghĩa là người dùng đầu cuối hay hacker đều có quyền tải về đầy đủ. Việc lưu trữ API Key/Secret Key ở client luôn là sai lầm bảo mật nghiêm trọng."
  },
  {
    id: 50,
    questionText: "Lỗ hổng bảo mật 'Log4Shell' khét tiếng trong thư viện Log4j (Java) thuộc phân loại lỗ hổng nghiêm trọng nào dưới đây?",
    options: [
      "SQL Injection",
      "Remote Code Execution (RCE) - Thực thi mã từ xa",
      "Cross-Site Scripting (XSS)",
      "Insecure Direct Object Reference (IDOR)"
    ],
    correctAnswerIndex: 1,
    explanation: "Log4Shell (CVE-2021-44228) cho phép kẻ tấn công thực thi mã Java tùy ý từ xa bằng cách gửi một chuỗi định dạng Log tùy chỉnh chứa truy vấn LDAP độc hại, kích hoạt việc tải xuống và thực thi mã tùy ý từ máy chủ lạ."
  },
  {
    id: 51,
    questionText: "Giao thức bảo mật không dây WPA3 ra đời nhằm khắc phục lỗ hổng đe dọa trực tiếp nào của phiên bản WPA2 tiền nhiệm?",
    options: [
      "Tấn công giải mã phần cứng router vật lý",
      "Tấn công vét cạn mật khẩu ngoại tuyến dựa trên việc bắt tay 4 bước (4-way handshake) nhờ tích hợp cơ thức bắt tay mã hóa SAE",
      "Tấn công làm nhiễu sóng vô tuyến trong phòng kín riêng tư",
      "Tấn công giả danh nhà cung cấp dịch vụ mạng viễn thông toàn cầu"
    ],
    correctAnswerIndex: 1,
    explanation: "WPA3 thay thế cơ chế bắt tay 4 bước dễ bị nạp từ điển giải mã offline của WPA2 bằng giao thức SAE (Simultaneous Authentication of Equals). SAE chống lại các cuộc tấn công đoán mật khẩu ngay cả khi người dùng đặt mật khẩu đơn giản."
  },
  {
    id: 52,
    questionText: "Kỹ thuật 'Salted Hashing' không thể giải quyết triệt để vấn đề gì cho việc quản lý mật khẩu người dùng?",
    options: [
      "Chống lại tấn công Rainbow Tables dùng bảng băm dựng sẵn",
      "Chăn dắt việc phân biệt các mã băm giống nhau của cùng một mật khẩu",
      "Ngăn chặn người dùng đặt các mật khẩu siêu ngắn hoặc quá dễ đoán (như '123456')",
      "Gia tăng độ khó khi hacker nỗ lực bẻ khóa mật khẩu hàng loạt"
    ],
    correctAnswerIndex: 2,
    explanation: "Muối (Salt) chỉ giúp quá trình băm độc nhất và chống tra cứu nhanh. Nó không thể ép người dùng tạo ra mật khẩu có độ dài hay độ phức tạp cao, do đó hacker vẫn có thể đoán mò bằng phương pháp brute-force cục bộ trực tiếp."
  },
  {
    id: 53,
    questionText: "Một cuộc tấn công 'Replay Attack' xảy ra khi kẻ tấn công thực hiện hành vi cụ thể nào?",
    options: [
      "Gửi đi gửi lại mã SQL injection cực kỳ liên tục để phá hoại DB",
      "Chặn bắt một gói tin dữ liệu hợp lệ (như token hoặc session) và gửi lại y nguyên cho máy chủ để mạo danh phiên người dùng hợp lệ",
      "Tải lên tệp virus Ransomware định kỳ để hủy hoại ổ đĩa",
      "Gửi hàng triệu tin nhắn rác lặp lại khắp hệ thống để dọa dẫm người dùng"
    ],
    correctAnswerIndex: 1,
    explanation: "Replay Attack (tấn công phát lại) là hình thức tấn công mạng, trong đó một truyền tải dữ liệu hợp lệ bị chặn lại độc hại và được gửi lại sau đó để đạt được lợi ích xác thực trái phép."
  },
  {
    id: 54,
    questionText: "Trong xác thực đa nhân tố (MFA), loại hình xác thực nào dưới đây thường được đánh giá là an toàn và chống lừa đảo (Phishing-resistant) cao nhất hiện nay?",
    options: [
      "Nhận mã OTP qua tin nhắn điện thoại (SMS)",
      "Ứng dụng xác thực sinh mã OTP thời gian thực (như Google Authenticator)",
      "Sử dụng khóa bảo mật vật lý chuẩn FIDO2 (như YubiKey) giao tiếp qua cổng USB hoặc NFC",
      "Xác thực qua địa chỉ hòm thư điện tử cá nhân thứ hai"
    ],
    correctAnswerIndex: 2,
    explanation: "Các hình thức OTP dựa trên SMS hoặc ứng dụng phần mềm đều có thể bị lừa vượt qua thông qua các trang web giả mạo (Proxy-based Phishing). Khóa FIDO2 liên kết chặt chẽ chữ ký mật mã với nguồn gốc tên miền gốc của trang web, ngăn chặn tấn công giả mạo hiệu quả."
  },
  {
    id: 55,
    questionText: "Đâu là điểm yếu cốt lõi trong thuật toán trao đổi khóa Diffie-Hellman trực tiếp nếu không áp dụng cơ chế xác thực đi kèm?",
    options: [
      "Không thể thống nhất được khóa phiên chung",
      "Dễ bị tấn công giả mạo trung gian Man-in-the-Middle (MITM) do hai bên không xác thực được danh tính thực của nhau",
      "Tốn quá nhiều dung lượng băng thông khi tính toán số mũ lớn",
      "Không thể chạy trên hệ điều hành máy khách di động"
    ],
    correctAnswerIndex: 1,
    explanation: "Diffie-Hellman cho phép 2 bên thiết lập khóa bí mật chung qua kênh truyền không an toàn mà không cần biết trước nhau. Tuy nhiên, nếu không có chữ ký số hoặc chứng chỉ để xác thực danh tính, kẻ đứng giữa có thể thiết lập 2 kết nối Diffie-Hellman độc lập với cả hai bên."
  },
  {
    id: 56,
    questionText: "Mối đe dọa lớn của 'Lỗ thủng ngày không tròn' (Zero-day Vulnerability) nằm ở thực tế nghiêm trọng nào?",
    options: [
      "Lỗ hổng bảo mật chưa từng có công cụ vá lỗi hoặc giải pháp phòng vệ chính thức nào được công bố từ nhà phát triển",
      "Lỗ hổng chỉ xảy ra tại múi giờ không xác định",
      "Sự cố phần mềm làm đóng băng hệ quản trị cơ sở dữ liệu đúng lúc chuyển ngày",
      "Kẻ tấn công không đạt được mục đích khi triển khai mã độc"
    ],
    correctAnswerIndex: 0,
    explanation: "Lỗ hổng Zero-day là lỗ hổng phần mềm chưa được biết tới rộng rãi hoặc chưa có bản vá chính thức từ nhà sản xuất, khiến hệ thống hoàn toàn dễ bị tổn thương và không có lá chắn phòng vệ trực tiếp."
  },
  {
    id: 57,
    questionText: "Tại sao thuật toán mã hóa khóa công khai RSA lại không phù hợp để trực tiếp mã hóa những file dữ liệu có dung lượng rất lớn (như file phim 4GB)?",
    options: [
      "Thuật toán RSA bị giới hạn dung lượng file mã hóa tối đa không quá 1MB",
      "Các phép toán số mũ mô-đun trên số siêu lớn của RSA cực kỳ tốn CPU và chậm chạp so với tốc độ xử lý nhanh của thuật toán mã hóa đối xứng",
      "RSA chỉ hoạt động tốt nếu không có dữ liệu hình ảnh, âm thanh",
      "Nhà phát triển buộc phải đăng ký bản quyền trả phí mới mở khóa dung lượng mã hóa lớn"
    ],
    correctAnswerIndex: 1,
    explanation: "RSA đòi hỏi thực hiện các phép tính nhân mô-đun phức tạp trên các số có kích thước hàng nghìn bit. Do tính toán rất tốn tài nguyên và chậm chạp, trong thực tế, RSA chỉ dùng để mã hóa khóa phiên (Session Key - vốn rất nhỏ), sau đó khóa phiên này được AES dùng để mã hóa tệp dữ liệu chính."
  },
  {
    id: 58,
    questionText: "Trong kiểm thử xâm nhập bảo mật, khái niệm 'Black Box Testing' biểu thị cho hình thức giả lập kiểm tra nào?",
    options: [
      "Kiểm thử khi chuyên gia đã được cung cấp tài liệu chi tiết cùng toàn bộ mã nguồn chương trình",
      "Kiểm thử mà chuyên gia hoàn toàn không có bất kỳ thông tin hay mã nguồn nào về cấu trúc bên trong ứng dụng trước khi bắt đầu",
      "Kiểm thử hệ thống phần cứng trong phòng thí nghiệm khép kín riêng biệt",
      "Bảo mật hệ điều hành trước các mối đe dọa từ mạng mây công cộng"
    ],
    correctAnswerIndex: 1,
    explanation: "Kiểm thử hộp đen (Black Box) giả lập góc nhìn chân thực của kẻ tấn công bên ngoài: không có quyền xem code hay sơ đồ hạ tầng bên trong, hoàn toàn phải tự dò quét tự động để khám phá lỗ hổng."
  },
  {
    id: 59,
    questionText: "Bề mặt tấn công (Attack Surface) của một doanh nghiệp hay hệ thống tổ chức được định nghĩa cụ thể là:",
    options: [
      "Tổng số máy chủ vật lý đang được lắp đặt trực tiếp tại văn phòng",
      "Tất cả các điểm tiếp xúc công khai, lỗ hổng tiềm năng, nguồn dữ liệu đầu vào hoặc dịch vụ mà kẻ tấn công có thể lợi dụng để thâm nhập hệ thống",
      "Màn hình giao diện quản trị của quản trị viên hệ thống thông tin",
      "Dung lượng băng thông tối đa mà hệ thống tường lửa phần cứng có thể chịu tải"
    ],
    correctAnswerIndex: 1,
    explanation: "Bề mặt tấn công bao gồm mọi cổng mạng mở, API, form nhập liệu, nhân viên dễ bị xã hội kỹ thuật lừa đảo, hoặc các thư viện dùng chung chưa được vá lỗi. Giảm thiểu bề mặt tấn công là nguyên tắc căn bản của bảo mật."
  },
  {
    id: 60,
    questionText: "Chứng chỉ số bảo mật SSL/TLS được sử dụng để xác thực danh tính trang web do cơ quan tin cậy nào phê duyệt và ban hành?",
    options: [
      "Tổ chức Tiêu chuẩn hóa Quốc tế ISO",
      "Các nhà mạng cung cấp dịch vụ Internet viễn thông",
      "Cơ quan Quản lý Chứng thực (Certificate Authority - CA)",
      "Hiệp hội An toàn thông tin trực thuộc chính phủ quốc gia"
    ],
    correctAnswerIndex: 2,
    explanation: "Các CA (Certificate Authority) là những tổ chức được tin cậy toàn cầu, có trách nhiệm xác thực quyền sở hữu tên miền của cá nhân/doanh nghiệp trước khi ký số công khai phát hành chứng chỉ bảo mật số SSL/TLS giúp đảm bảo niềm tin trực tuyến."
  },
  {
    id: 61,
    questionText: "Trong kiến trúc cụm Kubernetes (K8s), thành phần lưu trữ phân tán nào giữ toàn bộ thông tin trạng thái cấu hình và dữ liệu hệ thống cần được bảo mật hàng đầu?",
    options: [
      "kube-apiserver",
      "Kube-scheduler",
      "etcd (Distributed Key-Value Store)",
      "kubelet-agent"
    ],
    correctAnswerIndex: 2,
    explanation: "etcd là cơ sở dữ liệu khóa-giá trị phân tán lưu trữ toàn bộ trạng thái cấu hình và thông tin nhạy cảm (như Secrets, mã token) của Kubernetes cluster. Việc mã hóa etcd khi lưu trữ (at rest) và phân quyền chặt chẽ thông qua RBAC là tối quan trọng."
  },
  {
    id: 62,
    questionText: "Hai nguyên tắc cốt lõi làm nền tảng cho kiến trúc bảo mật không tin cậy 'Zero Trust' là gì?",
    options: [
      "Tin tưởng tuyệt đối mạng nội bộ và kích hoạt hệ thống tường lửa lớp 7",
      "Luôn luôn xác thực kiểm chứng (Never Trust, Always Verify) và Giả định nguy cơ bị xâm nhập (Assume Breach)",
      "Chỉ sử dụng mã hóa SSH khóa đơn và giới hạn cổng IP tĩnh toàn phần",
      "Sử dụng giao thức mã hóa luồng mật không có điểm cuối"
    ],
    correctAnswerIndex: 1,
    explanation: "Bản chất của Zero Trust là không tin tưởng bất kỳ ai hay thiết bị nào (kể cả trong mạng nội bộ) mà luôn yêu cầu xác thực liên tục, áp dụng đặc quyền tối thiểu và luôn chuẩn bị tinh thần hệ thống đã hoặc đang bị thâm nhập để áp dụng phòng thủ chiều sâu."
  },
  {
    id: 63,
    questionText: "Kẻ tấn công có thể lợi dụng sơ hở nào sau đây để thực hiện tấn công giả mạo token ký số JWT (JSON Web Token) bằng cách sửa đổi header?",
    options: [
      "Thay đổi thuật toán ký trong header thành 'none' và loại bỏ chữ ký số ở đuôi của token cấu trúc chuẩn",
      "Thay đổi thời gian hết hạn 'exp' thành số nguyên cực nhỏ",
      "Mã hóa Base64URL lớp thứ hai cho phần chữ ký số",
      "Mở rộng kích thước khối padding của thuật toán AES-CBC"
    ],
    correctAnswerIndex: 0,
    explanation: "Nếu thư viện kiểm tra JWT của server cấu hình không bảo mật và chấp nhận giá trị thuật toán `'alg': 'none'` trong header của JWT nhầm mục đích debug, kẻ tấn công có thể chỉnh sửa payload thoải mái rồi bỏ chữ ký số ở cuối để bypass hoàn toàn cơ chế xác thực."
  },
  {
    id: 64,
    questionText: "Cấu hình tiêu đề CORS (Cross-Origin Resource Sharing) nào sau đây trên máy chủ web được coi là cực kỳ nguy hiểm, dễ bị khai thác rò rỉ dữ liệu nhạy cảm?",
    options: [
      "Access-Control-Allow-Origin: https://secure.domain.com",
      "Access-Control-Allow-Origin: * kết hợp Access-Control-Allow-Credentials: true",
      "Access-Control-Allow-Methods: GET, POST",
      "Access-Control-Max-Age: 86400"
    ],
    correctAnswerIndex: 1,
    explanation: "Sử dụng dấu đại diện '*' kết hợp cho phép thông tin xác thực (Credentials: true) có nghĩa là trang web độc hại bất kỳ ở origin khác có thể thực hiện gọi API đọc thông thông tin của người dùng đang đăng nhập thông qua cookie mà không bị cản lại."
  },
  {
    id: 65,
    questionText: "Thuật ngữ 'Mã hóa đồng cấu' (Homomorphic Encryption) định nghĩa tính năng mật mã học tiên tiến vượt bậc nào dưới đây?",
    options: [
      "Khả năng tạo ra cặp khóa công khai-bí mật chỉ bằng một số nguyên tố duy nhất",
      "Cho phép tính toán trực tiếp trên dữ liệu đã được mã hóa để thu được bản dịch mã hóa mới tương thích với bản rõ mà không cần giải mật",
      "Cơ chế bẻ khóa an toàn trước mọi siêu máy tính lượng tử",
      "Sự đồng nhất tuyệt đối về tốc độ mã hóa và giải mã của AES"
    ],
    correctAnswerIndex: 1,
    explanation: "Mã hóa đồng cấu cho phép xử lý, phân tích toán học trên dữ liệu đang ở dạng mã hóa mà không cần phải thực hiện giải mã trước đó. Đây là bước đột phá bảo vệ quyền riêng tư tuyệt đối cho điện toán đám mây."
  },
  {
    id: 66,
    questionText: "Nguyên lý 'Shift Left' (Dịch chuyển trái) trong quy trình bảo mật phần mềm DevSecOps nhấn mạnh điều gì?",
    options: [
      "Dịch chuyển cơ sở hạ tầng lưu trữ sang các máy chủ khu vực phía Tây",
      "Đưa bảo mật vào càng sớm càng tốt, ngay từ những giai đoạn đầu tiên của thiết kế, viết code và tích hợp CI/CD",
      "Bắt buộc kiểm tra mã nguồn tự động thủ công sau khi ứng dụng đã vận hành thực tế 1 năm",
      "Dịch chuyển các quy trình kiểm thử từ chuyên gia sang cho người dùng cuối tự kiểm chứng"
    ],
    correctAnswerIndex: 1,
    explanation: "Dịch chuyển trái nghĩa là tích hợp phân tích mã nguồn đóng tĩnh (SAST), quản lý phụ thuộc (SCA) ngay khi lập trình viên bắt đầu đẩy code lên, giúp phát hiện và vá lỗi bảo mật với chi phí rẻ hơn hàng chục lần so với khi phần mềm đã chạy production."
  },
  {
    id: 67,
    questionText: "Biện pháp phòng ngừa triệt để nhất đối với lỗi hổng SSRF (Server-Side Request Forgery) khiến máy chủ web bị lợi dụng đi quét cổng nội bộ là gì?",
    options: [
      "Chỉ mã hóa mật khẩu kết nối cơ sở dữ liệu bằng thuật toán SHA3-512",
      "Triển khai danh sách trắng (Allowlist) nghiêm ngặt cho các URL/IP đầu ra và chặn truy cập từ máy chủ tới dải mạng local nội trú (như 127.0.0.1, 169.254.169.254)",
      "Thay đổi cổng dịch vụ của website từ 443 về 8443",
      "Chặn tất cả các lượt truy cập HTTP GET từ bên ngoài Internet gửi tới"
    ],
    correctAnswerIndex: 1,
    explanation: "SSRF xảy ra khi máy chủ nhận URL từ người dùng và truy cập nó mà không kiểm tra độ tin cậy. Phòng chống SSRF bằng cách sử dụng danh sách trắng dải IP đích an toàn và cấu hình firewall cấm máy chủ web thực hiện gọi nội bộ tới các dải IP nhạy cảm của hạ tầng đám mây."
  },
  {
    id: 68,
    questionText: "Mục đích tối ưu của cơ chế bảo mật hệ điều hành ASLR (Address Space Layout Randomization) là chống lại hành vi khai thác nào?",
    options: [
      "Tấn công từ chối dịch vụ phân tán làm tràn băng thông mạng",
      "Giả mạo phản hồi DNS để dẫn dụ người dùng sang trang lừa đảo",
      "Khai thác lỗi tràn bộ đệm (Buffer Overflow) bằng cách xáo trộn ngẫu nhiên vị trí các vùng nhớ quan trọng (Stack, Heap, Thư viện liên kết)",
      "Giải mã khóa RSA bằng cách đếm lượng điện năng hao phí"
    ],
    correctAnswerIndex: 2,
    explanation: "ASLR xáo trộn ngẫu nhiên địa chỉ nạp trong bộ nhớ của các tiến trình hệ thống, khiến kẻ tấn công không thể đoán được chính xác địa chỉ hàm đích hay địa chỉ shellcode để thực thi lệnh trái phép trong các kịch bản tràn bộ đệm."
  },
  {
    id: 69,
    questionText: "Trong giao thức truyền tin bảo mật trên web, tiêu đề HSTS (HTTP Strict Transport Security) đóng vai trò ngăn ngừa cuộc tấn công nào?",
    options: [
      "Tấn công vét cạn mật khẩu người dùng admin qua cổng API",
      "Tấn công hạ cấp giao thức từ HTTPS xuống HTTP không bảo mật và chặn nghe lén gói tin truyền đi (SSL/TLS Stripping)",
      "Thâm nhập cơ sở dữ liệu MySQL thông qua SQL Injection",
      "Mã độc dính mã tự nhân bản trong ổ cứng mạng chia sẻ"
    ],
    correctAnswerIndex: 1,
    explanation: "HSTS là một tiêu đề phản hồi gửi từ phía máy chủ thông báo cho trình duyệt của người dùng biết rằng nó bắt buộc chỉ được kết nối qua HTTPS tương lai, ngăn ngừa hacker can thiệp hạ cấp website từ https xuống http thường."
  },
  {
    id: 70,
    questionText: "Tại sao kỹ thuật sử dụng 'Prepared Statements' (Tham số hóa truy vấn) lại ngăn ngừa được hoàn toàn lỗ hổng SQL Injection nhức nhối hiện nay?",
    options: [
      "Nó mã hóa toàn bộ dữ liệu lưu trữ trong cơ sở dữ liệu thành hệ nhị phân",
      "Nó phân rã hoàn toàn câu lệnh SQL gốc và cấu trúc dữ liệu người dùng nhập thành hai phần tách biệt, khiến hệ quản trị CSDL coi input thuần là giá trị tham số chứ không bao giờ thực thi dưới dạng lệnh",
      "Nó giúp website chạy nhanh hơn và tăng băng thông cho database",
      "Nó tự động phát hiện và gửi thông báo cảnh báo IP của hacker lên Firebase Cloud"
    ],
    correctAnswerIndex: 1,
    explanation: "Prepared Statements hoạt động bằng cách biên dịch câu lệnh mẫu SQL trước, sau đó mới lồng giá trị tham số vào. Dù kẻ tấn công có nhập các ký từ đặc biệt như `' OR '1'='1`, hệ thống cũng chỉ coi đó là một chuỗi ký tự thường để đối chiếu chứ không biên dịch thành lệnh logic."
  },
  {
    id: 71,
    questionText: "Khi triển khai xác thực OAuth 2.0 trên ứng dụng di động hoặc ứng dụng đơn trang dạng SPA, tại sao giao thức PKCE (Proof Key for Code Exchange) lại cực kỳ quan trọng?",
    options: [
      "Nó thay thế hoàn toàn chữ ký số của chứng chỉ máy chủ",
      "Nó loại bỏ nhu cầu lưu trữ bí mật (client_secret) ở phía client bằng cách sử dụng mã thách thức động ngẫu nhiên ngăn chặn tấn công đánh cắp mã Authorization Code trên thiết bị",
      "Nó tăng tốc độ tải file đa phương tiện của ứng dụng di động",
      "Nó mã hóa lưu lượng mạng bằng giao thức WireGuard riêng"
    ],
    correctAnswerIndex: 1,
    explanation: "Các ứng dụng client-side như di động hay SPA được coi là các client không bảo mật (public client) vì không thể giữ an toàn khóa bí mật client_secret. PKCE sử dụng mãverifier ngẫu nhiên sinh ra động trên mỗi lượt login để đảm bảo Authorize Code không thể bị nghe lén lợi dụng."
  },
  {
    id: 72,
    questionText: "Phương pháp tạo mô hình mối đe dọa bảo mật có tên STRIDE do Microsoft khởi xướng gồm những thành phần đại diện nào?",
    options: [
      "Scanning, Treason, Integrity, Division, Egress",
      "Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege",
      "Symmetric, Trojan, Ransomware, Intrusion, DMZ, Encryption",
      "Service, Trust, Risk, Identity, Verification, Exploit"
    ],
    correctAnswerIndex: 1,
    explanation: "STRIDE là mô hình giúp đánh giá các nguy cơ gồm: Giả mạo danh tính (Spoofing), Sửa đổi dữ liệu (Tampering), Chối bỏ trách nhiệm (Repudiation), Rò rỉ thông tin (Information Disclosure), Từ chối dịch vụ (Denial of Service) và Thăng tiến đặc quyền trái phép (Elevation of Privilege)."
  },
  {
    id: 73,
    questionText: "Sự khác biệt cốt lõi giữa phân tích mã độc tĩnh (Static Analysis) và phân tích mã độc động (Dynamic Analysis) là gì?",
    options: [
      "Phân tích tĩnh yêu cầu sử dụng máy tính chạy Windows cũ, phân tích động chạy trên Linux tiên tiến",
      "Phân tích tĩnh là kiểm tra cấu trúc mã nguồn, header của file nhị phân mà không khởi chạy; trong khi phân tích động là trực tiếp thực thi mã độc trong môi trường hộp cát cách ly an toàn (Sandbox) để theo dõi hành vi trực quan",
      "Phân tích động chỉ quét chữ ký hash MD5 của file tải lên",
      "Phân tích tĩnh nhanh hơn và cho biết chính xác hành vi ghi đè Registry của Ransomware khi hoạt động thực tế"
    ],
    correctAnswerIndex: 1,
    explanation: "Phân tích tĩnh tập trung đọc hiểu cấu trúc file, giải mã chuỗi ký tự, đọc code Assembly. Phân tích động chạy trực tiếp file độc hại để ghi nhận các hành vi gọi mạng, can thiệp file hệ thống, chỉnh sửa khóa Registry, giúp bắt bài mã độc đa hình."
  },
  {
    id: 74,
    questionText: "Thuật toán mã hóa AES với chế độ hoạt động GCM (Galois/Counter Mode) cung cấp tính năng vượt trội nào so với chế độ CBC (Cipher Block Chaining)?",
    options: [
      "Nó tự động tạo khóa bí mật cho các thiết bị mà không cần phân phối",
      "Nó là mật mã luồng bất đối xứng không dùng mô-đun toán học",
      "Nó cung cấp cơ chế Authenticated Encryption (AEAD) - vừa mã hóa bảo mật vừa tạo mã xác thực thông điệp đi kèm ngăn chặn việc sửa đổi bản mã",
      "Nó giới hạn số lượng byte dữ liệu mã hóa tối đa là 1 Megabyte"
    ],
    correctAnswerIndex: 2,
    explanation: "AES-GCM là chế độ mã hóa xác thực tích hợp (AEAD). Ở chế độ CBC, kẻ tấn công có thể sửa đổi một phần bản mã (Bit-flipping) gây sai lệch dữ liệu khi giải mã mà server không hề hay biết. AES-GCM tạo thẻ xác thực (Auth Tag) đi kèm đảm bảo tính toàn vẹn tuyệt đối."
  },
  {
    id: 75,
    questionText: "Chính sách bảo mật CSP (Content Security Policy) cấu hình trong tiêu đề HTTP hoạt động ra sao để chặn đứng các cuộc tấn công lồng mã độc XSS?",
    options: [
      "Nó mã hóa dữ liệu người dùng nhập bằng cơ chế RSA",
      "Nó cho phép máy chủ định nghĩa danh sách trắng các origin/nguồn tin cậy được phép thực thi JavaScript, cấm chạy mã inline script bừa bãi và chặn tải tài nguyên lạ ngoài luồng",
      "Nó tự động quét sạch virus trên máy tính của người dùng truy cập",
      "Nó chuyển hướng toàn bộ các link JavaScript độc hại sang một trang trống"
    ],
    correctAnswerIndex: 1,
    explanation: "CSP hoạt động ở phía trình duyệt người dùng. Bằng cách định cấu hình chặt chẽ chỉ cho phép chạy js từ domain hiện tại hoặc từ các máy chủ CDN tin cậy, CSP ngăn chặn hacker tiêm mã độc inline script từ bên ngoài thực thi đánh cắp token hay cookie."
  },
  {
    id: 76,
    questionText: "Khi kết nối máy chủ qua giao thức SSH, thuật toán tạo cặp khóa xác thực hiện đại Ed25519 sở hữu ưu điểm gì nổi bật so với thuật toán RSA kế thừa?",
    options: [
      "Ed25519 chậm hơn nhưng cho dung lượng khóa lớn hơn 1 Megabyte",
      "Ed25519 hoạt động trên bài toán mật mã đường cong Elliptic (Curve25519), cho hiệu năng xử lý cực nhanh, kích thước khóa siêu nhỏ gọn (256-bit) nhưng tương đương sức mạnh bảo mật của khóa RSA 3072-bit trở lên",
      "Nó không dùng khóa bí mật mà tự sinh mã qua cảm biến phần cứng",
      "Ed25519 bắt buộc người dùng nhập mật khẩu gốc sau mỗi dải IP"
    ],
    correctAnswerIndex: 1,
    explanation: "Ed25519 là tiêu chuẩn SSH hiện đại khuyên dùng, dựa trên phép tính nhóm điểm trên đường cong Elliptic Edwards, cung cấp tốc độ sinh khóa và ký số siêu tốc cùng độ dài khóa ngắn, tránh các lỗ hổng toán học tiềm tàng trong RSA cổ điển."
  },
  {
    id: 77,
    questionText: "Phương thức tấn công lừa đảo 'Spear Phishing' (Tấn công lừa đảo có mục tiêu) khác biệt thế nào với hoạt động 'Phishing' thông thường?",
    options: [
      "Spear Phishing chỉ quét các cổng dịch vụ HTTPS trên tường lửa",
      "Phishing thông thường gửi email rác hàng loạt không nhắm cụ thể ai; còn Spear Phishing được đầu tư nghiên cứu kỹ lưỡng, nhắm trực diện vào một cá nhân, tổ chức cụ thể dựa trên thông tin thu thập riêng",
      "Nó chỉ tấn công bằng tin nhắn thoại thông qua hệ thống tổng đài ảo",
      "Spear Phishing là hình thức sử dụng mã độc tống tiền khóa file dữ liệu"
    ],
    correctAnswerIndex: 1,
    explanation: "Spear Phishing mang tính chất nhắm mục tiêu cao độ (Tailored attack). Kẻ tấn công có thể nghiên cứu mạng xã hội, tên bạn bè, cấp trên của nạn nhân để viết một bức thư lừa đảo vô cùng chân thực, khiến tỷ lệ nhấp vào link mã độc cực cao."
  },
  {
    id: 78,
    questionText: "Hình thức tấn công Multi-Factor Authentication (MFA) Fatigue (hay còn gọi là MFA Spamming) hoạt động dựa trên nguyên lý lạm dụng nào?",
    options: [
      "Bẻ khóa thuật toán phát sinh mã OTP dạng TOTP theo thời gian thực",
      "Spam hàng loạt yêu cầu phê duyệt đăng nhập (Push Notification) liên tục tới điện thoại của nạn nhân vào đêm muộn cho đến khi họ mất kiên nhẫn hoặc bấm nhầm nút 'Phê duyệt' (Chấp thuận) để chấm dứt sự phiền toái",
      "Xâm nhập vật lý trực tiếp tráo SIM điện thoại di động mạng",
      "Mạo danh tổng đài viên viễn thông phát sinh mã khôi phục"
    ],
    correctAnswerIndex: 1,
    explanation: "MFA Fatigue không tập trung vào đánh sập thuật toán, mà đánh vào yếu tố tâm lý con người. Hacker gửi hàng trăm cảnh báo xác thực liên tiếp của Microsoft Authenticator hay Okta cho đến khi nạn nhân mệt mỏi chấp nhận đại để tắt tiếng điện thoại, cho phép hacker đăng nhập."
  },
  {
    id: 79,
    questionText: "Ba nhân tố cấu thành bánh xe bảo mật thông tin tiêu chuẩn của tam giác bảo mật 'CIA Triad' bao gồm những gì?",
    options: [
      "Coding, Intrusion, Authentication",
      "Confidentiality (Tính bảo mật), Integrity (Tính toàn vẹn), Availability (Tính sẵn sàng)",
      "Cryptography, Internet, Authorization",
      "Computer, IP, Address"
    ],
    correctAnswerIndex: 1,
    explanation: "CIA Triad đại diện cho: Bảo mật (đảm bảo thông tin chỉ người được cấp quyền mới tiếp cận), Toàn vẹn (đảm bảo dữ liệu không bị tự ý sửa đổi trái phép) và Sẵn sàng (đảm bảo hệ thống đáp ứng dịch vụ trôi chảy khi người dùng cần)."
  },
  {
    id: 80,
    questionText: "Lỗ hổng an ninh OpenSSL cực kỳ nghiêm trọng 'Heartbleed' (CVE-2014-0160) khét tiếng trước đây thuộc loại lỗi lập trình bộ nhớ cụ thể nào?",
    options: [
      "Tràn Stack làm hỏng cấu trúc phân phối chương trình",
      "Lỗi tràn đọc bộ đệm (Buffer Over-read) do thiếu kiểm định độ dài chuỗi ký tự gửi lên trong gói tin rải nhịp Heartbeat, khiến server rò rỉ dung lượng RAM chứa mật khóa chính chủ",
      "Tấn công lừa đảo chuyển tiền tự động thông qua giao thức API",
      "Đầu độc luồng thực thi hàm ngẫu nhiên của OpenSSL"
    ],
    correctAnswerIndex: 1,
    explanation: "Heartbleed do thiếu kiểm tra biên trong hàm xử lý gói tin TLS Heartbeat. Khách hàng gửi gói tin nói độ dài là 64KB nhưng data thực chỉ có 1 byte, khiến OpenSSL chép lấn vùng nhớ RAM liền kề gửi trả lại, làm rò rỉ mật khẩu, Private Key."
  },
  {
    id: 81,
    questionText: "Trong mạng nội bộ doanh nghiệp chạy Microsoft Active Directory, cuộc tấn công 'Golden Ticket' biểu thị hành vi nguy hiểm nào của tin tặc?",
    options: [
      "Đăng ký tên miền giả mạo khớp hoàn toàn với cấu trúc Active Directory",
      "Giả tạo chứng chỉ Kerberos Ticket-Granting Ticket (TGT) tự cấp quyền Quản trị viên tối cao (Domain Admin) vô thời hạn bằng cách sở hữu mã khóa hash của tài khoản đặc biệt KRBTGT",
      "Chặn băng thông kết nối từ máy client tới domain controller bằng kỹ thuật DDoS",
      "Sử dụng công cụ rà quét cổng mạng tự động tìm cổng AD"
    ],
    correctAnswerIndex: 1,
    explanation: "Khi hacker kiểm soát được Domain Controller và chiết xuất thành công mật khóa krbtgt, chúng có thể tự ký cấp mã Kerberos Ticket (Golden Ticket), cho phép chúng truy cập không giới hạn mọi tài nguyên mạng AD mà không bị hệ thống kiểm soát."
  },
  {
    id: 82,
    questionText: "Tại sao trong quy trình build Docker Image phục vụ môi trường Cloud Production, các kỹ sư bảo mật luôn khuyến cáo không được chạy ứng dụng dưới quyền 'user root'?",
    options: [
      "Để tiết kiệm dung lượng lưu trữ của Docker Image",
      "Để giảm thiểu thiệt hại nếu container bị dính lỗi thoát quyền (Container Escape) - khi đó kẻ tấn công sẽ có đặc quyền root tương đương trực tiếp trên hệ điều hành vật lý chủ quản (Host)",
      "Vì Docker không hỗ trợ quyền root trên các tiến trình dịch vụ Node.js",
      "Do quyền root làm giảm tốc độ khởi chạy container xuống mức tối đa"
    ],
    correctAnswerIndex: 1,
    explanation: "Mặc định Docker chạy tiến trình trong container bằng root. Nếu container dính lỗ hổng bảo mật và hacker thoát được container sang Host OS, quyền root này cho phép chúng kiểm soát toàn bộ server vật lý. Sử dụng USER non-root là bài toán cơ bản."
  },
  {
    id: 83,
    questionText: "Chức năng bảo vệ của đại lượng 'Stack Canary' (Phần tử chim yến Stack) trong cơ chế biên dịch phần mềm an toàn là gì?",
    options: [
      "Dự báo chất lượng băng thông kết nối máy chủ",
      "Một chuỗi bit ngẫu nhiên đặt ngay trước địa chỉ trả về (Return Address) của ngăn xếp Stack, dùng để kiểm tra tính toàn vẹn tuyệt đối: nếu bị ghi đè sẽ lập tức hủy tiến trình tránh bẻ luồng thực thi lệnh nguy hiểm",
      "Mã hóa toàn bộ các biến cục bộ cục bộ bằng thuật toán băm SHA256",
      "Một chương trình chạy ngầm phát hiện virus trong thư mục gốc"
    ],
    correctAnswerIndex: 1,
    explanation: "Canary là một cơ chế dò tìm lỗi tràn bộ đệm. Chim yến mỏ than chết báo hiệu khí độc. Khi hacker cố tình tràn biến đệm để chèn ghi đè địa chỉ trả về, chúng buộc phải ghi đè lên Canary. Thấy Canary biến đổi, hệ thống hủy luôn tiến trình."
  },
  {
    id: 84,
    questionText: "Kỹ thuật bảo mật ứng dụng di động 'SSL/TLS Certificate Pinning' có mục tiêu cụ thể là ngăn chặn nguy cơ nào?",
    options: [
      "Nạn crack game, sửa đổi file dữ liệu offline trên bộ nhớ máy di động",
      "Mọi cuộc tấn công chặn bắt giải mã lưu lượng mạng (Man-in-the-Middle) - nó cấu hình app chỉ chấp nhận một chữ ký số hoặc khóa công khai của đúng máy chủ chỉ định chứ không tin tưởng mù quáng vào CA của hệ điều hành di động",
      "Khai thác lỗi SQL Injection trong hệ điều hành Android SQLite",
      "Chống lại kỹ thuật đầu độc dữ liệu thuật toán học máy AI"
    ],
    correctAnswerIndex: 1,
    explanation: "Khi người dùng di động cài đặt các công cụ chặn bắt hay CA giả (như Charles Proxy, Fiddler), thiết bị có thể bị chặn và giải mã HTTPS. App dùng Cert Pinning kiểm tra cứng vân tay của cert thực, từ chối kết nối nếu phát hiện cert mạo."
  },
  {
    id: 85,
    questionText: "Thuật ngữ 'Honeypot' (Hũ mật bảo mật) chỉ loại hệ thống giám sát an ninh mạng đặc biệt nào dưới đây?",
    options: [
      "Hệ thống lưu trữ mật khẩu người dùng toàn hệ thống có độ dài tối đa",
      "Hệ thống mồi nhử giả lập rò rỉ dịch vụ, lỗ hổng giả tạo, dùng để dụ hacker thâm nhập, từ đó thu thập thông tin về kỹ thuật, mục tiêu và cảnh báo sớm về cuộc tấn công",
      "Hệ thống máy chủ lưu trữ bản sao lưu dữ liệu tuyệt mật phòng chống Ransomware",
      "Mô hình tường lửa doanh nghiệp ngăn cấm tải file .exe từ trình duyệt"
    ],
    correctAnswerIndex: 1,
    explanation: "Honeypot giống hũ mật dụ kiến. Website giả, dường như có lỗ hổng dễ hack nhưng thực chất tất cả tương tác đều bị ghi lại 100% để phân tích hành vi hacker. Giúp doanh nghiệp lường trước các vụ tấn công thông minh."
  },
  {
    id: 86,
    questionText: "Trong dải các lớp bảo mật, một hệ thống tường lửa WAF (Web Application Firewall) không có chức năng nào sau đây?",
    options: [
      "Phân tích ngăn chặn các cú pháp tấn công SQL Injection và Cross-Site Scripting gửi lên web",
      "Quét sâu và tiêu diệt hoàn toàn virus, mã độc Ransomware dính trên ổ đĩa vật lý của máy chủ web",
      "Giới hạn tần suất gọi API (Rate limiting) ngăn chặn tấn công vét cạn",
      "Nhận diện bot tự động cào quét thông tin tự diễn dịch"
    ],
    correctAnswerIndex: 1,
    explanation: "WAF hoạt động ở lớp ứng dụng (layer 7), kiểm duyệt lưu lượng HTTP/HTTPS đi vào web để cản lọc payload độc hại. WAF hoàn toàn không phải phần mềm diệt virus máy chủ hoạt động cục bộ trên hệ thống lưu trữ đĩa cứng."
  },
  {
    id: 87,
    questionText: "Mô hình bảo mật đám mây 'Shared Responsibility Model' (Trách nhiệm chung giữa nhà cung cấp dịch vụ AWS/GCP và Khách hàng) phân định điều gì?",
    options: [
      "Khách hàng phải trả toàn bộ chi phí sửa lỗi hạ tầng phần cứng đám mây",
      "Nhà cung cấp đám mây chịu trách nhiệm bảo mật cho chính cơ sở hạ tầng nền tảng (Bảo mật của mây); còn Khách hàng chịu trách nhiệm bảo mật cho những gì họ đặt trong mây như cấu hình, mã nguồn, dữ liệu, hệ điều hành VM (Bảo mật trong mây)",
      "Mọi vấn đề về mã lỗi ứng dụng web sẽ do Google chịu trách nhiệm đền bù",
      "Khách hàng chịu trách nhiệm về vật lý phòng máy chủ đặt tại datacenter"
    ],
    correctAnswerIndex: 1,
    explanation: "Đây là nguyên tác vàng của Cloud Security. Nhà cung cấp lo điện, điều hòa, ảo hóa, bảo vệ máy chủ vật lý. Khách hàng lo phần quyền IAM, bảo mật database, chống SQL Injection trong code của họ."
  },
  {
    id: 88,
    questionText: "Hệ thống SIEM (Security Information and Event Management) trong các trung tâm giám sát an ninh SOC đóng vai trò chủ chốt là gì?",
    options: [
      "Tự động biên dịch mã nguồn của website sang định dạng nhị phân đối xứng",
      "Thu thập logs tập trung từ toàn mạng, máy chủ ảo, chuẩn hóa dữ liệu, tương quan các sự kiện an ninh theo thời gian thực để đưa ra cảnh báo về mối đe dọa đang diễn ra",
      "Quét bẻ khóa mật mã RSA 2048-bit bằng phương pháp song song",
      "Sao lưu định kỳ dự án lập trình lên nền tảng đám mây an toàn"
    ],
    correctAnswerIndex: 1,
    explanation: "SIEM là bộ não thu nhập log khổng lồ của SOC. Nó liên kết sự kiện: nhận thấy IP lạ quét port máy chủ A, và 5 phút sau IP đó đăng nhập thành công vào cơ sở dữ liệu trên máy chủ B, để phân tích đây là vụ thâm nhập tinh vi."
  },
  {
    id: 89,
    questionText: "Cuộc tấn công 'Adversarial Machine Learning' dưới dạng 'Data Poisoning' (Đầu độc dữ liệu) nhắm vào trí tuệ nhân tạo hoạt động thế nào?",
    options: [
      "Hack trực tiếp cơ sở dữ liệu lưu trữ để xóa sạch các bảng định dạng logs",
      "Cố tình tiêm các mẫu dữ liệu huấn luyện độc hại, sai lệch vào tập dataset của mô hình AI, khiến AI dự báo sai lệch hoàn toàn hoặc chứa lỗ hổng bẫy cửa sau (backdoor) khi suy luận thực tế",
      "Làm hỏng bộ xử lý đồ họa GPU của máy chủ AI bằng ddos phần mềm",
      "Dùng AI tự sinh mã tự động đi bẻ khóa MD5"
    ],
    correctAnswerIndex: 1,
    explanation: "Đầu độc dữ liệu huấn luyện khiến mô hình AI nhận diện nhầm. Ví dụ, hacker tiêm các hình ảnh biển báo giao thông có nhãn sai lệch vào tập dữ liệu học của xe tự lái, khiến xe nhận lầm biển báo DỪNG thành biển báo ĐI TIẾP."
  },
  {
    id: 90,
    questionText: "Giao thức wifi hiện đại WPA3 mang lại cải tiến bảo mật đáng giá nào so với WPA2 trước những kẻ bẻ khóa mật khẩu?",
    options: [
      "Yêu cầu tất cả điện thoại di động phải kết nối thông qua dây mạng LAN ảo",
      "Sử dụng giao thức bắt tay SAE (Simultaneous Authentication of Equals) chống các cuộc tấn công vét cạn mật khẩu ngoại tuyến (Offline dictionary attack) phổ biến trên WPA2",
      "Hạn chế số lượng thiết bị truy cập wifi tối đa là 5 máy chủ cùng lúc",
      "Mã hóa toàn bộ sóng wifi thành dải tia hồng ngoại siêu bảo mật"
    ],
    correctAnswerIndex: 1,
    explanation: "WPA2 sử dụng bắt tay 4 bước chứa điểm yếu dễ bị bắt gói tin chứa handshake đem về bẻ khóa bằng GPU (WPA2 Handshake audit). Giao thức bắt tay SAE của WPA3 chống bẻ khóa ngoại tuyến dù người dùng đặt mật khẩu dễ đoán mức trung bình."
  },
  {
    id: 91,
    questionText: "Thuật từ 'Shodan' nổi tiếng trong ngành an ninh thông tin biểu thị cho công cụ hay hệ thống cụ thể nào?",
    options: [
      "Phần mềm mã nguồn mở để triển khai chữ ký mù mã hóa",
      "Một công cụ quét tìm kiếm trực tuyến thu thập dữ liệu về các thiết bị kết nối Internet (IoT, Router, Webcams, ICS/SCADA) công khai, phát hiện sơ hở rò rỉ cổng mở",
      "Ngôn ngữ lập trình chuyên biệt để xây dựng hệ thống tường lửa doanh nghiệp",
      "Hệ quản trị cơ sở dữ liệu phân tán không SQL"
    ],
    correctAnswerIndex: 1,
    explanation: "Shodan là công cụ tìm kiếm các thiết bị kết nối mạng IoT trên thế giới. Nó rà quét các dải IP liên tục, thu giữ thông tin banner cổng dịch vụ, giúp chuyên gia (hoặc hacker) định vị những plc, router để mật khẩu mặc định rò rỉ công khai."
  },
  {
    id: 92,
    questionText: "Trong lỗi hổng OWASP Top 10, sai sót 'Broken Access Control' (Lỗi phân quyền bị hỏng) xảy ra khi nào?",
    options: [
      "Hệ thống tường lửa từ chối mọi lưu lượng mạng đi vào website",
      "Người dùng bình thường có thể truy cập, sửa đổi, xóa các tài nguyên nhạy cảm của người dùng khác hoặc sử dụng chức năng quản trị đặc quyền dành riêng cho admin do thiếu đối chiếu xác minh quyền",
      "Mã khóa bí mật của cặp khóa RSA bị hao mòn dung lượng",
      "Mật khẩu học viên không được bảo mật bằng phương pháp băm"
    ],
    correctAnswerIndex: 1,
    explanation: "Đây là lỗi đứng đầu OWASP. Lập trình viên chỉ kiểm tra người dùng đã đăng nhập chưa, nhưng quên so khớp xem người dùng A có được phép xem hóa đơn của người dùng B hay không (lỗi IDOR), cho phép truy cập trái phép dữ liệu ngoài quyền."
  },
  {
    id: 93,
    questionText: "Tại sao lý thuyết an toàn thông tin bắt buộc phải trộn thêm 'Salt' (Muối) ngẫu nhiên vào mật khẩu trước khi băm mật khẩu để lưu trữ?",
    options: [
      "Để tăng dung lượng file cơ sở dữ liệu lên gấp đôi",
      "Nhằm vô hiệu hóa hoàn toàn các bảng băm tính trước bảng cầu vồng (Rainbow Tables) - đảm bảo cùng một mật khẩu giống nhau của các người học khác nhau cũng cho ra chuỗi hash hoàn toàn khác biệt nhau khi lưu",
      "Salt giúp giải mã mật khẩu nhanh hơn khi người dùng quên tài khoản",
      "Để nén mật khẩu về độ lớn cố định là 8 byte mật mã"
    ],
    correctAnswerIndex: 1,
    explanation: "Nếu không dùng Salt, hai người dùng cùng đặt mật khẩu là `123456` sẽ có cùng kết quả băm MD5 hay SHA256 trong database. Việc thêm Salt ngẫu nhiên riêng cho từng tài khoản buộc kẻ trộm phải vét cạn riêng biệt từng chuỗi mật khẩu, phá vỡ hiệu năng Rainbow Tables."
  },
  {
    id: 94,
    questionText: "Sự khác biệt cốt lõi giữa kỹ thuật kiểm thử bảo mật kiểm mã nguồn tĩnh (SAST) và hộp đen động (DAST) là gì?",
    options: [
      "SAST chỉ chạy được trên Window, DAST chạy được trên MacOS di động",
      "SAST phân tích, kiểm duyệt cấu trúc mã nguồn thô từ bên trong mà không cần chạy ứng dụng; còn DAST thực hiện giả lập tấn công bên ngoài vào ứng dụng đang khởi chạy thực tế để phát hiện runtime vulnerability",
      "DAST quét nhanh hơn SAST vì không cần rà soát thư mục code thô",
      "SAST phát hiện được lỗi cấu hình tường lửa lớp 7 thực tế tốt hơn DAST"
    ],
    correctAnswerIndex: 1,
    explanation: "SAST (Static Application Security Testing) đọc hiểu từng dòng code để bắt lỗi logic sớm. DAST (Dynamic Application Security Testing) gửi payload thực vào web đang chạy để xem web phản ứng ra sao. Kết hợp hai công cụ là quy trình chuẩn hóa của DevSecOps."
  },
  {
    id: 95,
    questionText: "Khái niệm 'Zero-Day Vulnerability' (Lỗ hổng ngày Không / Zero-Day) biểu thị loại lỗ hổng phần mềm bảo mật ra sao?",
    options: [
      "Lỗ hổng phần mềm được nhà sản xuất vá xong trong vòng chưa đầy 1 ngày",
      "Một lỗ hổng bảo mật chưa từng được công bố công khai, hiện tại chưa được vá bởi nhà sản xuất phần mềm, khiến mọi cơ chế phòng vệ dựa trên chữ ký số cổ điển bất lực",
      "Lỗi hệ thống lập trình khiến website bị quay vòng ngày mốc lịch",
      "Lỗ hổng chỉ xuất hiện vào những ngày đầu tiên của năm lịch"
    ],
    correctAnswerIndex: 1,
    explanation: "Zero-Day biểu đạt rằng nhà phát triển có '0 ngày' để chuẩn bị hay phát hành bản vá chống lại nó trước khi hacker bắt đầu khai thác. Đây là loại lỗi đắt giá nhất thị trường chợ đen vì khả năng xâm nhập thành công gần như hoàn hảo."
  },
  {
    id: 96,
    questionText: "Trong mạng truyền thông bảo mật ảo, gói giao thức VPN IPsec sở hữu thành phần ESP (Encapsulating Security Payload) đảm nhiệm chức năng bảo vệ cốt lõi nào?",
    options: [
      "Ngăn chặn hoàn toàn hiện tượng nghẽn mạng do ddos lưu lượng truy cập",
      "Cung cấp tính năng bảo mật bảo mật (Mã hóa gói tin dữ liệu) lẫn tính năng toàn vẹn và xác thực nguồn gốc nguồn tin",
      "Tự động đặt lại địa chỉ IP máy của người học sau mỗi 10 giây",
      "Thực hiện quét virus trực tiếp bộ nhớ đệm RAM của card mạng"
    ],
    correctAnswerIndex: 1,
    explanation: "IPsec có 2 thành phần chính: AH (Authentication Header) chỉ xác thực toàn vẹn không mã hóa. Còn ESP cung cấp cả mã hóa bảo mật toàn bộ dữ liệu gói tin IP, đảm bảo dữ liệu truyền an toàn và không bị nghe lén trên đường truyền mạng."
  },
  {
    id: 97,
    questionText: "Hành vi kỹ thuật nào sau đây mô tả rõ nét nhất thuật ngữ 'Privilege Escalation' (Thăng tiến đặc quyền / Leo thang đặc quyền)?",
    options: [
      "Mua thêm tài nguyên dung lượng băng thông mạng của nhà cung cấp dịch vụ",
      "Tận dụng lỗ hổng bảo mật hoặc lỗi cấu hình hệ thống để mở rộng quyền hạn truy cập của tài khoản hiện tại từ mức người dùng phổ thông lên dải đặc quyền quản trị gốc (root/system)",
      "Đổi tên tài khoản đăng nhập từ thường sang chữ viết hoa đặc biệt",
      "Hệ thống tự động tăng cấp độ XP cho người dùng khi hoàn thành bài thi"
    ],
    correctAnswerIndex: 1,
    explanation: "Leo thang đặc quyền chia làm bảo mật dọc (gã dùng thường biến thành admin hệ thống) và bảo mật ngang (gã dùng A truy cập dữ liệu cá nhân của gã dùng B có cùng vai vế). Đây là mục tiêu quan trọng hàng đầu của hacker trong mạng nội bộ."
  },
  {
    id: 98,
    questionText: "Vụ tấn công 'BGP Hijacking' (Bẻ hướng định tuyến cổng biên) gây hậu quả an ninh quy mô lớn nào đối với luồng lưu lượng mạng Internet toàn cầu?",
    options: [
      "Hệ thống tự động phá hủy toàn bộ card mạng của máy chủ dịch vụ",
      "Tuyên truyền bảng định tuyến giả mạo từ router biên khiến lưu lượng dữ liệu khổng lồ hướng về IP chỉ định bị định hướng sai đường dẫn, bị gián đoạn hoàn toàn hoặc đi vòng qua hạ tầng hacker nghe lén",
      "Xóa sạch toàn bộ bản ghi chứng chỉ số SSL của các Certificate Authority",
      "Làm giảm điện năng vận hành của cáp quang biển viễn thông kỹ thuật"
    ],
    correctAnswerIndex: 1,
    explanation: "BGP (Border Gateway Protocol) là giao thức định tuyến liên mạng cốt lõi của Internet toàn cầu. Nếu Router đăng thông tin định tuyến sai, dữ liệu thiết bị gửi đáng ra tới Google lại đi lệch sang một nhà mạng bên nước khác do hacker tráo bảng định tuyến biên."
  },
  {
    id: 99,
    questionText: "Thế nào là cuộc tấn công ném bẫy thông tin 'SSTI' (Server-Side Template Injection) nhắm tới ứng dụng xử lý khuôn mẫu phía máy chủ?",
    options: [
      "Hacker lấy trộm các file thiết kế định dạng .psd từ hosting của web",
      "Kẻ tấn công tiêm mã lệnh lập trình vào bên trong bộ biên dịch giao diện (như Jinja2, Twig) trên máy chủ, dẫn tới việc hệ thống thực thi trực tiếp mã lệnh hệ thống trái phép (RCE) vô cùng nghiêm hại",
      "Giả mạo phản hồi của các máy chủ proxy ngược nginx",
      "Xóa nhầm các tệp tin lưu trữ cơ sở dữ liệu cục bộ trong ổ cứng"
    ],
    correctAnswerIndex: 1,
    explanation: "SSTI xảy ra khi input người dùng được trực tiếp nối ghép vào chuỗi cấu hình template thay vì truyền dưới dạng biến đối chiếu. Hệ cơ chế template như Jinja hay Twig biên dịch chuỗi này và vô tình thực hiện luôn lệnh máy chủ thâm nhập sâu."
  },
  {
    id: 100,
    questionText: "Mục đích chính của kỹ thuật rà quét 'DNS Tunneling' mà các nhóm hacker APT sử dụng là gì?",
    options: [
      "Làm tắc nghẽn hoàn toàn máy chủ DNS của nhà cung cấp dịch vụ",
      "Sử dụng giao thức DNS (cổng 53 vốn mở thoáng trên firewall) để đóng gói dữ liệu đánh cắp, hoặc truyền lệnh điều khiển (C2) đi vòng qua hệ thống giám sát an ninh mạng một cách âm thầm",
      "Mã hóa toàn bộ các bản ghi loại A thành bản ghi MX lật ngược",
      "Đăng ký hàng loạt tên miền lừa đảo để quảng cáo mạng"
    ],
    correctAnswerIndex: 1,
    explanation: "DNS Tunneling lạm dụng đặc tính của DNS: hầu hết các firewall trong doanh nghiệp luôn mở thông suốt cổng 53 DNS để kiểm tra phân giải tên miền. Hacker đóng gói lệnh, dữ liệu lấy trộm vào các truy vấn DNS gửi ra ngoài, qua mắt IPS/Firewall truyền thống."
  }
];

// Predefined AI Chat Responses based on Security Keywords
const generateAIBotResponse = (userInput: string): string => {
  const norm = userInput.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (norm.includes("rsa")) {
    return "Thuật toán RSA (Rivest–Shamir–Adleman) là nền tảng của mật mã học bất đối xứng. Nó sử dụng một khóa công khai để mã hóa dữ liệu và một khóa bí mật (hoàn toàn khác biệt) để giải mã. Điểm mấu chốt là kẻ tấn công biết khóa công khai (e, n) nhưng bài toán tìm d dựa trên n là bất khả thi nếu khóa có kích thước đủ lớn (từ 2048 bít trở lên). Bạn muốn biết sâu về toán học của nó hay cách tạo private/public key?";
  }
  if (norm.includes("khoa") || norm.includes("key")) {
    return "Trong bảo mật, hệ mã hóa đối xứng dùng chung một khóa để mã và giải mã (như AES). Còn hệ mã hóa bất đối xứng (như RSA, ECC) dùng một cặp khóa: Khóa Công Khai (Public Key - phân phối thoải mái cho ai cũng dùng được để mã hóa dữ liệu gửi đến bạn) và Khóa Bản Thân nắm giữ (Private Key - bí mật tuyệt đối dùng để giải mã). Đừng bao giờ làm lộ Private Key của mình nhé!";
  }
  if (norm.includes("nguyen to") || norm.includes("p va q")) {
    return "Số nguyên tố p và q là quả tim của thuật toán RSA. Chúng ta chọn ngẫu nhiên hai số nguyên tố cực lớn (khoảng 1024 bit mỗi số) rồi nhân chúng lại để được n = p * q. Từ n, ta tính hàm phi Euler φ(n) = (p-1)(q-1) để sinh khóa bí mật d. Nếu ai đó biết thuật toán thừa số hóa và khám phá ra p và q từ n, toàn bộ khóa RSA đó sẽ bị sập!";
  }
  if (norm.includes("tan cong") || norm.includes("hack") || norm.includes("be khoa")) {
    return "Có một số phương pháp tấn công vào khóa RSA: \n1. Tấn công thừa số hóa toán học cấu trúc n (Brute-force/GNFS)\n2. Tấn công kênh kề bên (Side-channel attack) đo lượng điện tiêu thụ hoặc thời gian xử lý khi máy tính giải mã\n3. Tấn công lỗi phần cứng (Fault injection).\nĐể hạn chế, luôn luôn sử dụng các kỹ thuật padding chuẩn hóa như OAEP trong khi thực hiện mã hóa RSA.";
  }
  if (norm.includes("chung chi") || norm.includes("cert") || norm.includes("verify")) {
    return "Tại Học viện An toàn VWA, bạn sẽ nhận được Chứng chỉ Số Tương Thích (Verified Digital Badges) cho mỗi mô-đun vượt qua bài kiểm tra lý thuyết (đạt từ 48/60 câu hỏi đúng). Dấu mốc ấn tượng này sẽ ghi nhận chuỗi thành tựu vàng của bạn để nộp hồ sơ xin việc hoặc nâng cao lộ trình nghề nghiệp!";
  }
  if (norm.includes("tai sao") || norm.includes("tai sao can")) {
    return "RSA cần số nguyên tố siêu lớn vì nếu dùng số nhỏ, các phần mềm bẻ khóa đơn giản trên máy tính cá nhân chỉ mất vài giây để tìm ra phần tử bí mật d. Khi p và q là các số 1024 bít, số n thu được có chiều dài 2048 bít. Kể cả siêu máy tính nhanh nhất thế giới ghép lại cũng tốn hàng tỷ năm mới phân tích nổi!";
  }
  if (norm.includes("lap trinh") || norm.includes("python") || norm.includes("code")) {
    return "Để triển khai RSA trong lập trình thực tế, các lập trình viên tránh tự code phần toán học vì dễ dính lỗ hổng bảo mật. Thay vào đó, chúng ta hay dùng thư viện chuẩn đã được kiểm chứng như PyCryptodome (Python), OpenSSL (C/C++), hoặc Web Crypto API (JavaScript). Bạn có thể xem mã nguồn minh họa Python ở bên trái của bài học!";
  }

  return "Chào bạn! Tôi là Thầy giáo Trợ lý học tập InfoSec hỗ trợ 24/7. Tôi có thể giải thích chi tiết về thuật toán mã hóa RSA, cách sinh số nguyên tố, tính phi Euler hoặc giải đáp thắc mắc liên quan tới bài trắc nghiệm của bạn. Hãy đưa ra câu hỏi hoặc sử dụng các phím học tập nhanh nhé!";
};

const renderFormattedMessage = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  let inCodeBlock = false;
  let codeLines: string[] = [];
  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeText = codeLines.join('\n');
        codeLines = [];
        renderedElements.push(
          <pre key={`code-${lineIdx}`} className="bg-[#051424] text-[#4edea3] font-mono text-xs p-3 rounded border border-[#273647] overflow-x-auto my-2 select-text whitespace-pre-wrap">
            <code>{codeText}</code>
          </pre>
        );
      } else {
        inCodeBlock = true;
      }
      return;
    }
    
    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    // Check for bullet list item
    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('• ');
    let content = line;
    if (isBullet) {
      content = line.trim().replace(/^[-*•]\s+/, '');
    }

    // Parse inline coding like `code` and bolding **bold**
    const parts: React.ReactNode[] = [];
    let currentText = content;
    let keyIdx = 0;

    // Simple regex parser for **text** and `code`
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const splitParts = currentText.split(regex);

    splitParts.forEach((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        parts.push(
          <strong key={keyIdx++} className="font-extrabold text-[#00f0ff]">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        parts.push(
          <code key={keyIdx++} className="bg-[#051424]/80 text-[#ffb4ab] border border-[#ffb4ab]/20 px-1 py-0.5 rounded font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      } else {
        parts.push(part);
      }
    });

    if (isBullet) {
      renderedElements.push(
        <li key={lineIdx} className="list-none flex items-start gap-2 text-left pl-1 my-1.5 text-xs text-[#b9cacb]">
          <span className="text-[#00f0ff] mt-1 shrink-0">•</span>
          <span className="leading-relaxed">{parts}</span>
        </li>
      );
    } else {
      renderedElements.push(
        <p key={lineIdx} className="leading-relaxed min-h-[1.2em] my-1 text-xs text-white selection:bg-[#00f0ff]/20">
          {parts}
        </p>
      );
    }
  });

  return renderedElements;
};

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const shuffleQuestionOptions = (question: QuizQuestion): QuizQuestion => {
  const correctOptionText = question.options[question.correctAnswerIndex];
  const shuffledOptions = shuffleArray(question.options);
  const newCorrectAnswerIndex = shuffledOptions.indexOf(correctOptionText);
  return {
    ...question,
    options: shuffledOptions,
    correctAnswerIndex: newCorrectAnswerIndex
  };
};

const get20QuestionsForModule = (moduleId: number): QuizQuestion[] => {
  let coreQuestions: QuizQuestion[] = [];
  let otherQuestions: QuizQuestion[] = [];

  if (moduleId === 6) {
    const pool = MODULE_QUESTIONS.slice(0, 60);
    const shuffledPool = shuffleArray(pool);
    return shuffledPool.slice(0, 20).map(shuffleQuestionOptions);
  } else if (moduleId === 5) {
    const pool = MODULE_QUESTIONS.slice(0, 40);
    const shuffledPool = shuffleArray(pool);
    return shuffledPool.slice(0, 20).map(shuffleQuestionOptions);
  } else {
    const startIndex = (moduleId - 1) * 12;
    coreQuestions = MODULE_QUESTIONS.slice(startIndex, startIndex + 12);
    otherQuestions = MODULE_QUESTIONS.filter((_, idx) => idx < startIndex || idx >= startIndex + 12);

    const shuffledOthers = shuffleArray(otherQuestions);
    const needed = 20 - coreQuestions.length;
    const combined = [...coreQuestions, ...shuffledOthers.slice(0, needed)];
    
    return shuffleArray(combined).map(shuffleQuestionOptions);
  }
};

export default function SecurityLearningPlatform() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'modules' | 'chat'>('dashboard');
  const [readingModuleId, setReadingModuleId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchPrompt, setSearchPrompt] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Real-time synchronization state via Firebase/Local Fallback
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    module1CompletedCount: 0,
    module2CompletedCount: 0,
    module3CompletedCount: 0,
    module4CompletedCount: 0,
    module5CompletedCount: 0,
    module6CompletedCount: 0,
    updatedAt: ''
  });

  useEffect(() => {
    const unsubscribe = subscribeToGlobalStats((stats) => {
      setGlobalStats(stats);
    });
    return () => unsubscribe();
  }, []);

  // Gamification tracking states inside localStorage
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [module1Progress, setModule1Progress] = useState(0);
  const [module2Progress, setModule2Progress] = useState(0);
  const [module3Progress, setModule3Progress] = useState(0);
  const [module4Progress, setModule4Progress] = useState(0);
  const [module5Progress, setModule5Progress] = useState(0);
  const [module6Progress, setModule6Progress] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState<{ [key: number]: boolean }>({});
  const [quizHistory, setQuizHistory] = useState<any[]>([]);

  const modulesConfig = useMemo(() => [
    {
      id: 1,
      title: "Mô-đun 1: Nhập môn Mã hóa & Mật mã đối xứng",
      desc: "Học phần cơ bản về mật mã đối xứng, mã dòng và mã giải bằng thuật toán AES VWA standard.",
      difficulty: "Dễ",
      difficultyClass: "text-[#4edea3] bg-[#003824]",
      timing: "10 Bài học • 12 Giờ",
      progress: module1Progress,
      completedCount: globalStats.module1CompletedCount,
      icon: <Shield className="w-5 h-5 text-[#4edea3]" />
    },
    {
      id: 2,
      title: "Mô-đun 2: Bảo mật ứng dụng Web",
      desc: "Hiểm họa mạng OWASP Top 10, cấu trúc lỗi SQL Injection, bảo mật cookie và xác thực.",
      difficulty: "Trung bình",
      difficultyClass: "text-[#fed639] bg-[#3b2f00]",
      timing: "12 Bài học • 15 Giờ",
      progress: module2Progress,
      completedCount: globalStats.module2CompletedCount,
      icon: <Terminal className="w-5 h-5 text-[#fed639]" />
    },
    {
      id: 3,
      title: "Mô-đun 3: An ninh hạ tầng mạng",
      desc: "Giám sát luồng an ninh với Snort, triển khai IDS/IPS chủ động và phân tách DMZ.",
      difficulty: "Trung bình",
      difficultyClass: "text-[#fed639] bg-[#3b2f00]",
      timing: "14 Bài học • 18 Giờ",
      progress: module3Progress,
      completedCount: globalStats.module3CompletedCount,
      icon: <History className="w-5 h-5 text-[#00f0ff]" />
    },
    {
      id: 4,
      title: "Mô-đun 4: Mật mã học nâng cao & RSA",
      desc: "Chi tiết toán học của số nguyên tố p, q, phi Euler và giải thuật RSA, cách sinh Private/Public Key.",
      difficulty: "Khó",
      difficultyClass: "text-[#ffb4ab] bg-[#690005]/40",
      timing: "15 Bài học • 25 Giờ",
      progress: module4Progress,
      completedCount: globalStats.module4CompletedCount,
      icon: <Brain className="w-5 h-5 text-[#ffb4ab]" />
    },
    {
      id: 5,
      title: "Mô-đun 5: Trắc nghiệm Chuyên sâu Chuyên gia",
      desc: "Đại học Syllabus - Bộ 20 câu trắc nghiệm chuyên sâu ngẫu nhiên giúp đánh giá toàn diện năng lực lý thuyết an toàn và thực nghiệm.",
      difficulty: "Rất khó",
      difficultyClass: "text-[#ffb4ab] bg-[#690005]/40",
      timing: "20 Câu hỏi ngẫu nhiên",
      progress: module5Progress,
      completedCount: globalStats.module5CompletedCount,
      icon: <Award className="w-5 h-5 text-[#fcd34d]" />
    },
    {
      id: 6,
      title: "Mô-đun 6: Mật mã học Toàn diện",
      desc: "Bộ 20 câu hỏi trắc nghiệm chuyên biệt chọn lọc ngẫu nhiên giúp củng cố kiến thức giải thuật mật mã học.",
      difficulty: "Khó",
      difficultyClass: "text-[#ffb4ab] bg-[#690005]/40",
      timing: "20 Câu hỏi ngẫu nhiên",
      progress: module6Progress,
      completedCount: globalStats.module6CompletedCount,
      icon: <Award className="w-5 h-5 text-[#00f0ff]" />
    }
  ], [module1Progress, module2Progress, module3Progress, module4Progress, module5Progress, module6Progress, globalStats]);

  const MODULE_LECTURES: Record<number, { tag: string; title: string; completedCount: number; text: React.ReactNode; codeTitle: string; codeFilename: string; code: string }> = useMemo(() => ({
    1: {
      tag: "Mô-đun 01: Nhập môn Mã hóa & Đối xứng",
      title: "Mật mã học đối xứng & Tiêu chuẩn AES",
      completedCount: globalStats.module1CompletedCount,
      text: (
        <>
          <p>
            <strong>Cryptography (Mật mã đối xứng)</strong> là nền tảng đầu tiên nhất trong an toàn thông tin, nơi khóa dùng mã hóa cũng chính là khóa giải mã. AES (Advanced Encryption Standard) và DES là các đại diện tiêu chuẩn vàng của mật mã khóa bí mật này.
          </p>
          <div className="bg-[#0d1c2d] border border-[#1c2b3c] p-4 rounded-lg space-y-3">
            <h4 className="text-white font-bold text-xs md:text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#00f0ff]" />
              Cơ chế hoán vị và thay thế của AES
            </h4>
            <p className="text-xs text-[#b9cacb]">
              AES xử lý khối dữ liệu 128-bit sử dụng ba kích thước khóa khác nhau: 128, 192, và 256-bit qua nhiều vòng lặp toán học khắt khe:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#b9cacb]">
              <li><strong>SubBytes:</strong> Thay thế phi tuyến từng byte qua bảng tra S-box cố định.</li>
              <li><strong>ShiftRows:</strong> Dịch chuyển tuần hoàn các hàng trong ma trận trạng thái (State layout).</li>
              <li><strong>MixColumns:</strong> Nhân ma trận State với một đa thức cố định nhầm khuếch tán triệt để thông tin gốc.</li>
              <li><strong>AddRoundKey:</strong> Thực hiện phép toán logic XOR ma trận với các khóa vòng con sinh ra từ khóa chính.</li>
            </ul>
          </div>
        </>
      ),
      codeTitle: "Mã hóa AES-CBC minh họa (Python)",
      codeFilename: "aes_cbc_demo.py",
      code: `from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

# 1. Tạo khóa bí mật 256-bit ngẫu nhiên
key = get_random_bytes(32)
data = b"Du lieu mat can truyen di an toan"

# 2. Khởi tạo AES chế độ CBC
cipher = AES.new(key, AES.MODE_CBC)
iv = cipher.iv
ciphertext = cipher.encrypt(data + b" " * (16 - len(data) % 16)) # PKCS7 padding

print(f"IV: {iv.hex()}")
print(f"Bản mã hóa: {ciphertext.hex()[:50]}...")`
    },
    2: {
      tag: "Mô-đun 02: Bảo mật ứng dụng Web",
      title: "Hiểm họa OWASP Top 10 & SQL Injection",
      completedCount: globalStats.module2CompletedCount,
      text: (
        <>
          <p>
            <strong>OWASP (Open Web Application Security Project)</strong> liên tục đánh giá và xếp hạng các rủi ro bảo mật ứng dụng web nghiêm trọng nhất. Trong đó lỗi injection, cấu hình sai TLS, và tấn công XSS luôn trực chờ đe dọa cơ sở dữ liệu.
          </p>
          <div className="bg-[#0d1c2d] border border-[#1c2b3c] p-4 rounded-lg space-y-3">
            <h4 className="text-white font-bold text-xs md:text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#10b981]" />
              Bản chất của lỗi SQL Injection (SQLi)
            </h4>
            <p className="text-xs text-[#b9cacb]">
              SQLi xảy ra khi dữ liệu người dùng gửi lên bị thông dịch nhầm thành các lệnh điều khiển SQL thực thi trực tiếp trên hệ thống cơ sở dữ liệu:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#b9cacb]">
              <li><strong>Lọc đầu vào hời hợt:</strong> Ứng dụng nối chuỗi trực tiếp mà không dùng Prepared Statements.</li>
              <li><strong>Vượt mặt xác thực:</strong> Kẻ tấn công nhập chuỗi <code className="text-[#00f0ff] font-mono">{"' OR '1'='1"}</code> để biến truy vấn đăng nhập luôn đúng.</li>
              <li><strong>Phòng chống hiệu quả:</strong> Sử dụng ràng buộc <code className="text-emerald-400 font-mono">Parameterized Queries</code>, thiết lập phân quyền database tối giản hành vi (principle of least privilege).</li>
            </ul>
          </div>
        </>
      ),
      codeTitle: "Phòng chống SQL Injection với Prepared SQL Statement (NodeJS)",
      codeFilename: "secure_query.js",
      code: `// Sử dụng Parameterized Queries an toàn tuyệt đối
const userId = req.body.userId;
const query = 'SELECT username, email FROM users WHERE id = ?';

db.query(query, [userId], (err, results) => {
  if (err) throw err;
  res.json(results);
});`
    },
    3: {
      tag: "Mô-đun 03: An ninh hạ tầng mạng",
      title: "IDS/IPS và Kỹ thuật Phân tách vùng mạng",
      completedCount: globalStats.module3CompletedCount,
      text: (
        <>
          <p>
            <strong>An ninh hạ tầng mạng</strong> bao gồm các chính sách định tuyến lưu lượng an toàn, thiết lập tường lửa thế hệ mới (NGFW), hệ thống giám sát IDS (Intrusion Detection System) và IPS (Intrusion Prevention System) để ngăn chặn truy cập trái phép.
          </p>
          <div className="bg-[#0d1c2d] border border-[#1c2b3c] p-4 rounded-lg space-y-3">
            <h4 className="text-white font-bold text-xs md:text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#fed639]" />
              IDS so với IPS: Khác biệt và Triển khai
            </h4>
            <p className="text-xs text-[#b9cacb]">
              Hiểu rõ cơ chế hoạt động giúp ngăn lọt lưới kẻ xấu mà không ảnh hưởng tới chất lượng băng thông đường truyền:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#b9cacb]">
              <li><strong>IDS (Bị động):</strong> Lắng nghe trên port mirror (SPAN Port), gửi cảnh báo (Alert) khi khớp chữ ký mã độc hoặc bất thường.</li>
              <li><strong>IPS (Chủ động):</strong> Đứng trung gian trực tiếp trên luồng mạng (In-line), có khả năng drop packet nguy hại kịp thời để tự vệ.</li>
              <li><strong>Phân tách vùng DMZ (DeMilitarized Zone):</strong> Đặt máy chủ công khai tách rời với mạng nội bộ nhạy cảm.</li>
            </ul>
          </div>
        </>
      ),
      codeTitle: "Cấu hình Luật Snort kiểm tra giao thức TCP (Config)",
      codeFilename: "snort_rules.conf",
      code: `# Cảnh báo khi có nỗ lực quét cổng TCP nguy ngờ 
alert tcp $EXTERNAL_NET any -> $HOME_NET 22 (msg:"Nghi van scan SSH thong qua Snort"; flags:S; threshold:type limit, track by_src, count 1, seconds 60; sid:1000001; rev:1;)`
    },
    4: {
      tag: "Mô-đun 04: Mật mã học nâng cao & RSA",
      title: "Thuật toán Mã hóa Bất đối xứng RSA",
      completedCount: globalStats.module4CompletedCount,
      text: (
        <>
          <p>
            <strong>RSA (Rivest–Shamir–Adleman)</strong> là một trong các hệ thống mã hóa công khai (mật mã bất đối xứng) đầu tiên và được sử dụng rộng rãi hàng đầu thế giới ngày nay để truyền dữ liệu an toàn. Nó liên quan chặt chẽ tới độ phức tạp rất lớn của bài toán phân tích thừa số nguyên tố cho tích hai số nguyên gốc lớn.
          </p>
          <div className="bg-[#0d1c2d] border border-[#1c2b3c] p-4 rounded-lg space-y-3" id="math_principle_block">
            <h4 className="text-white font-bold text-xs md:text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#00f0ff]" />
              Nguyên lý toán học của RSA
            </h4>
            <p className="text-xs text-[#b9cacb]">
              Quy trình thiết lập cặp khóa RSA bao gồm 4 bước đơn giản:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#b9cacb]">
              <li><strong>Tạo khóa (Key generation):</strong> Chọn 2 số nguyên tố siêu lớn bí mật là <code className="text-[#00f0ff] font-mono">p</code> và <code className="text-[#00f0ff] font-mono">q</code>. Tính mô-đun <code className="text-white font-mono">n = p * q</code> và hàm phi Euler <code className="text-white font-mono">φ(n) = (p-1)*(q-1)</code>. Tìm e và d sao cho <code className="text-white font-mono">d * e ≡ 1 (mod φ(n))</code>.</li>
              <li><strong>Phân phối khóa (Key distribution):</strong> Khóa công khai gồm đại lượng <code className="font-mono text-[#00f0ff]">(e, n)</code> được chia sẻ rộng rãi. Khóa bí mật <code className="font-mono text-[#ffb4ab]">(d, n)</code> giữ kín tuyệt đối.</li>
              <li><strong>Mã hóa (Encryption):</strong> Bản rõ M được chuyển thành bản mã C nhờ công thức: <code className="text-[#4edea3] font-mono block py-1 bg-[#051424] text-center my-1">C ≡ M^e (mod n)</code></li>
              <li><strong>Giải mã (Decryption):</strong> Có được bản mã C, chủ quản dùng khóa bí mật d để khôi phục lại M: <code className="text-[#4edea3] font-mono block py-1 bg-[#051424] text-center my-1">M ≡ C^d (mod n)</code></li>
            </ul>
          </div>
        </>
      ),
      codeTitle: "Script minh hoa ma hoa RSA khoa sinh ngau nhien (Python)",
      codeFilename: "rsa_demo.py",
      code: `from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

# 1. Tạo cặp khóa RSA 2048-bit
key = RSA.generate(2048)
private_key = key.export_key()
public_key = key.publickey().export_key()

# 2. Mã hóa dữ liệu với Khóa Công Khai
message = b"Thong tin tuyet mat ve InfosecAI"
cipher = PKCS1_OAEP.new(RSA.import_key(public_key))
ciphertext = cipher.encrypt(message)

print(f"Dữ liệu đã mã hóa: {ciphertext.hex()[:50]}...")`
    },
    5: {
      tag: "Mô-đun 05: Trắc nghiệm Chuyên sâu Chuyên gia",
      title: "Chứng nhận Chuyên gia An toàn mạng & Mật mã học",
      completedCount: globalStats.module5CompletedCount,
      text: (
        <>
          <p>
            Chào mừng bạn đến với <strong>Module Đánh giá Năng lực Toàn diện Chuyên gia</strong> của VWA. Bài thi trắc nghiệm này tổng hợp và nâng tầm nâng cao tất cả các kiến thức bảo mật, tấn công, phòng thủ, mật mã hóa và chính sách an ninh mạng.
          </p>
          <div className="bg-[#0d1c2d] border border-[#1c2b3c] p-4 rounded-lg space-y-3">
            <h4 className="text-white font-bold text-xs md:text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-[#fcd34d]" />
              Tiêu chuẩn Tốt Nghiệp Chuyên Gia
            </h4>
            <p className="text-xs text-[#b9cacb]">
              Thử thách an ninh mạng đa chiều tích hợp tri thức:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#b9cacb]">
              <li><strong>Cryptography:</strong> So sánh ECC, RSA, Symmetric stream, block ciphers thực tế.</li>
              <li><strong>Network & Appsec:</strong> Phân tích lỗi zero-day, rủi ro bảo mật API và thiết lập phân mảnh phòng vệ mạng.</li>
              <li><strong>AI Security:</strong> Quản trị dữ liệu lớn LLMs khi kết hợp mô hình bảo mật Zero Trust.</li>
            </ul>
          </div>
        </>
      ),
      codeTitle: "Script phát hiện xâm nhập AI Security Logs Analyzer (Python)",
      codeFilename: "ai_incident_response.py",
      code: `import json

def analyze_logs(log_file):
    with open(log_file, "r") as f:
        for idx, line in enumerate(f):
            log = json.loads(line)
            if "prompt_injection" in log.get("labels", []):
                print(f"[CẢNH BÁO] Phát hiện Prompt Injection tại dòng #{idx}: {log['payload']}")

analyze_logs("security_events.jsonl")`
    },
    6: {
      tag: "Mô-đun 06: Mật mã học Toàn diện",
      title: "Mật mã học toàn diện & Thực hành Chuyên sâu",
      completedCount: globalStats.module6CompletedCount,
      text: (
        <>
          <p>
            <strong>Mô-đun 6 (Mật mã học Toàn diện)</strong> là chương trình tập trung học tập sâu rộng và kiểm nghiệm thực tế các giải thuật mật mã cổ điển, mật mã học đối xứng (AES, DES) cho tới các hệ thống mật mã công khai hiện đại (RSA, ECC), mật mã song song và trao đổi khóa (Diffie-Hellman).
          </p>
          <div className="bg-[#0d1c2d] border border-[#1c2b3c] p-4 rounded-lg space-y-3">
            <h4 className="text-white font-bold text-xs md:text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00f0ff]" />
              Tiêu chuẩn Đo lường Năng lực Toàn diện
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#b9cacb]">
              <li><strong>Phân tích hệ thống:</strong> Đánh giá mức độ an toàn phi tuyến tính, cấu xạ S-Box, thuật toán mã dòng và mã tự vệ chống tấn công thám mã.</li>
              <li><strong>Mật mã khóa công khai:</strong> Chứng minh tính đúng đắn toán học của bài toán căn nguyên tố, thặng dư Trung Hoa (CRT) và giải thuật RSA.</li>
              <li><strong>Ứng dụng thực tế:</strong> Tích hợp giao tiếp HTTPS TLS 1.3, trao đổi khóa mật bảo mật và ký số chữ ký điện tử tin cậy.</li>
            </ul>
          </div>
        </>
      ),
      codeTitle: "Mã hóa & Giải mã Vigenère Chuyên sâu (Python)",
      codeFilename: "vigenere_crypto.py",
      code: `def vigenere_encrypt(plaintext, key):
    key = key.upper()
    ciphertext = []
    for i, char in enumerate(plaintext.upper()):
        if char.isalpha():
            shift = ord(key[i % len(key)]) - 65
            cipher_char = chr((ord(char) - 65 + shift) % 26 + 65)
            ciphertext.append(cipher_char)
        else:
            ciphertext.append(char)
    return "".join(ciphertext)

msg = "VWA CRYPTO DEEP DIVE"
secret_key = "SECURITY"
encrypted = vigenere_encrypt(msg, secret_key)
print(f"Bản mã hóa Vigenere: {encrypted}")`
    }
  }), [globalStats]);

  // Load metrics back on mounting
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('vwa_quiz_history');
      if (savedHistory) {
        try { setQuizHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
      }
      const savedXP = localStorage.getItem('vwa_user_xp');
      if (savedXP) setUserXP(Number(savedXP));
      const savedLevel = localStorage.getItem('vwa_user_level');
      if (savedLevel) setUserLevel(Number(savedLevel));
      
      const p1 = localStorage.getItem('vwa_progress_1'); if (p1) setModule1Progress(Number(p1));
      const p2 = localStorage.getItem('vwa_progress_2'); if (p2) setModule2Progress(Number(p2));
      const p3 = localStorage.getItem('vwa_progress_3'); if (p3) setModule3Progress(Number(p3));
      const p4 = localStorage.getItem('vwa_progress_4'); if (p4) setModule4Progress(Number(p4));
      const p5 = localStorage.getItem('vwa_progress_5'); if (p5) setModule5Progress(Number(p5));
      const p6 = localStorage.getItem('vwa_progress_6'); if (p6) setModule6Progress(Number(p6));
      
      const savedCompleted = localStorage.getItem('vwa_completed_quizzes');
      if (savedCompleted) {
        try { setCompletedQuizzes(JSON.parse(savedCompleted)); } catch (e) { console.error(e); }
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const getSuggestionChipsForModule = (moduleId: number | null) => {
    switch (moduleId) {
      case 1:
        return [
          { text: "🔍 So sánh AES và DES", prompt: "Hãy so sánh sự khác nhau về độ an toàn và tốc độ giữa AES và DES một cách ngắn gọn súc tích." },
          { text: "💡 Ví dụ AES thực tế", prompt: "Hãy cho tôi một ví dụ thực tế cực kỳ dễ hiểu về cách hoạt động của mã hóa đối xứng AES." },
          { text: "⚡ Thử thách AES", prompt: "Hãy đặt một câu đố vui trắc nghiệm nhỏ kiểm tra hiểu biết của tôi về cách hoạt động và các bước vòng của AES!" }
        ];
      case 2:
        return [
          { text: "🔍 Ngăn chặn SQLi", prompt: "Giải thích phương pháp dùng Parameterized Query để phòng chống SQL Injection (SQLi) một cách đơn giản, ngắn gọn." },
          { text: "💡 Tấn công XSS", prompt: "Tấn công XSS hoạt động như thế nào và làm thế nào để lập trình viên phòng chống lỗi này ở phía Frontend?" },
          { text: "⚡ Ôn tập OWASP", prompt: "Hãy đặt một câu hỏi nhỏ để kiểm tra tôi về các lỗ hổng phổ biến thuộc danh sách OWASP Top 10!" }
        ];
      case 3:
        return [
          { text: "🔍 Snort & IPS/IDS", prompt: "Hệ thống IDS và IPS khác nhau điểm gì cốt lõi? Giải thích ý nghĩa một dòng luật (rule) cơ bản trong hệ thống Snort." },
          { text: "💡 Phân tách DMZ", prompt: "Tại sao doanh nghiệp cần phân tách luồng mạng thành các vùng DMZ để bảo vệ máy chủ cơ sở dữ liệu nội bộ?" },
          { text: "⚡ Test Snort rule", prompt: "Hãy ra một đề thi trắc nghiệm ngắn về thiết lập tường lửa phân tầng mạng và thiết lập Snort rule để tôi luyện tập!" }
        ];
      case 4:
        return [
          { text: "🔍 Số nguyên tố p, q", prompt: "Tại sao RSA cần các số nguyên tố p và q cực kỳ lớn và hàm phi Euler có vai trò như thế nào trong tạo khóa?" },
          { text: "💡 Ví dụ RSA", prompt: "Hãy cho tôi một ví dụ thực tế cực kỳ dễ hiểu về cách hoạt động của mã hóa RSA." },
          { text: "⚡ Thử thách RSA", prompt: "Hãy đặt một câu đố nhỏ để kiểm tra tôi về thuật toán RSA!" }
        ];
      case 5:
        return [
          { text: "🔍 Luyện thi chuyên gia", prompt: "Hãy tóm tắt cho tôi các điểm trọng tâm cần đặc biệt lưu ý khi làm bài trắc nghiệm chuyên sâu chuyên gia bảo mật." },
          { text: "💡 Kỹ năng thực nghiệm", prompt: "Làm thế nào để áp dụng lý thuyết mật mã và an ninh mạng để tăng cường hệ thống phòng thủ thực tế?" },
          { text: "⚡ Câu hỏi hóc búa", prompt: "Hãy sinh một câu hỏi trắc nghiệm hóc búa ở mức độ chuyên gia kèm giải thích chi tiết đáp án để tôi thử sức!" }
        ];
      case 6:
        return [
          { text: "🔍 Mật mã học toàn diện", prompt: "Hãy tóm tắt súc tích các phương pháp thám mã cổ điển như Vigenère và cách thức các thuật toán hiện đại khắc phục nó." },
          { text: "💡 Ký số TLS 1.3", prompt: "Ký số băm SHA và trao đổi khóa hoàn hảo bí mật diễn ra như thế nào trong giao tiếp HTTPS/TLS 1.3?" },
          { text: "⚡ Đố vui mật mã", prompt: "Hãy thách đấu tôi bằng một bài tập giải mật mã hoặc câu đố trắc nghiệm logic hóc búa nhất về mật mã học song song!" }
        ];
      default:
        return [
          { text: "💡 Ví dụ thực tế", prompt: "Hãy cho tôi một ví dụ thực tế cực kỳ dễ hiểu về cách hoạt động của mã hóa RSA." },
          { text: "✏️ Đơn giản hóa", prompt: "Giải thích RSA như thể tôi là học sinh cấp 2." },
          { text: "⚡ Kiểm tra tôi", prompt: "Hãy đặt một câu đố nhỏ để kiểm tra tôi về thuật toán RSA!" }
        ];
    }
  };

  // AI Chat Sandbox environment active properties
  const [chatMessages, setChatMessages] = useState<{ sender: 'bot' | 'user'; text: string; time: string }[]>([
    { 
      sender: 'bot', 
      text: 'Chào mừng bạn đến với Sân chơi Học tập Trợ lý AI! Tôi là Trợ lý InfoSec VWA luôn trực chiến hỗ trợ giải mã thuật toán, OWASP, và an ninh hệ thống 24/7. Hãy nhập câu hỏi của bạn hoặc chọn các gợi ý học tập nhanh nhé!', 
      time: 'Vừa xong' 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Submits question to remote AI Gateway or Predefined Local fallback sandbox
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setAiTyping(true);
    
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const apiMessages = chatMessages.map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      }));
      apiMessages.push({
        role: 'user' as const,
        parts: [{ text: textToSend }]
      });

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: apiMessages,
          systemInstruction: "Bạn là Trợ lý AI học tập An ninh mạng (VWA InfoSec Assistant) xuất sắc. Nhiệm vụ của bạn là giải đáp tất cả thắc mắc của học viên mà không bị giới hạn chủ đề. Hãy viết câu trả lời thật ngắn gọn, súc tích, dễ hiểu, đi thẳng vào câu hỏi cốt lõi, sử dụng các gạch đầu dòng rõ ràng để người dùng dễ theo dõi. Tuyệt đối không trả lời dông dài hoặc máy móc."
        })
      });

      const data = await res.json();
      if (data.text) {
        setChatMessages(prev => [...prev, {
          sender: 'bot',
          text: data.text,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.warn("Dịch vụ AI bảo mật trực tuyến bận, đang đưa ra giải pháp băm từ bồ đề cục bộ:", err);
      const fallbackText = generateAIBotResponse(textToSend);
      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: fallbackText,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setAiTyping(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSuggestionClick = (text: string) => {
    handleSendMessage(text);
  };

  const handleAIPromptSplit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPrompt.trim()) return;
    handleSendMessage(searchPrompt);
    setSearchPrompt('');
    setActiveTab('chat');
  };

  // Interactive Quiz Engine State Properties
  const [selectedQuizModule, setSelectedQuizModule] = useState<number>(4);
  const [quizState, setQuizState] = useState<'splash' | 'playing' | 'result' | 'review'>('splash');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [incorrectQuestionIndices, setIncorrectQuestionIndices] = useState<number[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' });

  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  const isSplash = quizState === 'splash';
  useEffect(() => {
    if (selectedQuizModule) {
      setActiveQuestions(get20QuestionsForModule(selectedQuizModule));
    }
  }, [selectedQuizModule, isSplash]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const startQuiz = () => {
    setQuizState('playing');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizScore(0);
    setIncorrectQuestionIndices([]);
  };

  const resetQuiz = () => {
    setQuizState('splash');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizScore(0);
  };

  const handleSelectOption = (idx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: idx }));
  };

  const handleNextQuestion = () => {
    setShowExplanation(true);
  };

  const handleProceedNext = async () => {
    const isCorrect = selectedAnswers[currentQuestionIndex] === activeQuestions[currentQuestionIndex]?.correctAnswerIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    } else {
      setIncorrectQuestionIndices(prev => [...prev, currentQuestionIndex]);
    }
    
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      const finalScore = quizScore + (isCorrect ? 1 : 0);
      setQuizScore(finalScore);
      
      const isPassed = finalScore >= Math.ceil(activeQuestions.length * 0.8);
      
      const newAttempt = {
        timestamp: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        score: finalScore,
        totalQuestions: activeQuestions.length,
        incorrectQuestions: [
          ...incorrectQuestionIndices,
          ...(!isCorrect ? [currentQuestionIndex] : [])
        ].map(idx => {
          const q = activeQuestions[idx];
          return {
            id: q.id,
            questionText: q?.questionText || '',
            selectedAnswerText: q?.options[selectedAnswers[idx]] || 'Không chọn',
            correctAnswerText: q?.options[q?.correctAnswerIndex] || '',
            explanation: q?.explanation || ''
          };
        })
      };
      
      const updatedHistory = [newAttempt, ...quizHistory];
      setQuizHistory(updatedHistory);
      localStorage.setItem('vwa_quiz_history', JSON.stringify(updatedHistory));
      
      if (isPassed) {
        const xpEarned = 150 + (activeQuestions.length * 10);
        const newXP = userXP + xpEarned;
        setUserXP(newXP);
        localStorage.setItem('vwa_user_xp', String(newXP));
        
        const newLevel = Math.floor(newXP / 500) + 1;
        if (newLevel > userLevel) {
          setUserLevel(newLevel);
          localStorage.setItem('vwa_user_level', String(newLevel));
          setToast({
            show: true,
            title: "Thăng cấp thành công! 🎉",
            message: `Bạn đã đạt cấp độ ${newLevel} nhờ hoàn thiện xuất sắc bài kiểm tra!`
          });
        } else {
          setToast({
            show: true,
            title: "Vượt qua bài thi! 🎖️",
            message: `Bạn nhận được +${xpEarned} XP và một chứng nhận điện tử cho mô-đun này!`
          });
        }
        
        const newCompleted = { ...completedQuizzes, [selectedQuizModule]: true };
        setCompletedQuizzes(newCompleted);
        localStorage.setItem('vwa_completed_quizzes', JSON.stringify(newCompleted));
        
        const p1 = selectedQuizModule === 1 ? 100 : module1Progress;
        const p2 = selectedQuizModule === 2 ? 100 : module2Progress;
        const p3 = selectedQuizModule === 3 ? 100 : module3Progress;
        const p4 = selectedQuizModule === 4 ? 100 : module4Progress;
        const p5 = selectedQuizModule === 5 ? 100 : module5Progress;
        const p6 = selectedQuizModule === 6 ? 100 : module6Progress;

        if (selectedQuizModule === 1) setModule1Progress(100);
        if (selectedQuizModule === 2) setModule2Progress(100);
        if (selectedQuizModule === 3) setModule3Progress(100);
        if (selectedQuizModule === 4) setModule4Progress(100);
        if (selectedQuizModule === 5) setModule5Progress(100);
        if (selectedQuizModule === 6) setModule6Progress(100);
        
        localStorage.setItem('vwa_progress_1', String(p1));
        localStorage.setItem('vwa_progress_2', String(p2));
        localStorage.setItem('vwa_progress_3', String(p3));
        localStorage.setItem('vwa_progress_4', String(p4));
        localStorage.setItem('vwa_progress_5', String(p5));
        localStorage.setItem('vwa_progress_6', String(p6));
        
        await completeModuleOnFirebase(selectedQuizModule);
      }
      
      setQuizState('result');
    }
  };

  const copyPythonCode = () => {
    const code = MODULE_LECTURES[readingModuleId || 4]?.code || '';
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const quizAttemptsCount = quizHistory.length;

  return (
    <div className="min-h-screen bg-[#051424] text-white flex flex-col font-sans" id="vwa_classroom_body">
      
      {/* GLOBAL BANNER HEADER COMPONENT */}
      <header className="bg-[#051424] border-b border-[#1c2b3c] sticky top-0 z-50 px-4 md:px-6 py-3 shrink-0" id="vwa_global_header">
        <div className="max-w-7xl mx-auto flex items-center justify-between" id="header_wrap">
          
          {/* Interactive Logo Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none group" 
            onClick={() => { setActiveTab('dashboard'); setReadingModuleId(null); }}
            id="logo_brand_anchor"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-[0_0_15px_rgba(0,186,198,0.2)] group-hover:scale-105 transition-all duration-300">
              <img src="/vwa_logo.png" alt="VWA Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white hover:text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5 transition-all">
                HỌC VIỆN AN TOÀN VWA
              </h1>
              <span className="text-[10px] text-[#4edea3] font-mono leading-none tracking-tight block">AN NINH MẠNG TOÀN DIỆN</span>
            </div>
          </div>

          {/* Interactive Navigation links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0b1622] p-1.5 rounded-lg border border-[#1c2b3c]" id="desktop_tabs">
            <button 
              onClick={() => { setActiveTab('dashboard'); setReadingModuleId(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'dashboard' ? 'text-[#00f0ff] bg-[#122131] border-b-2 border-[#00f0ff] rounded-b-none' : 'text-[#b9cacb] hover:text-white hover:bg-[#122131]/50'}`}
              id="tab_btn_dashboard"
            >
              Bảng điều khiển
            </button>
            <button 
              onClick={() => { setActiveTab('modules'); setReadingModuleId(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'modules' ? 'text-[#00f0ff] bg-[#122131] border-b-2 border-[#00f0ff] rounded-b-none' : 'text-[#b9cacb] hover:text-white hover:bg-[#122131]/50'}`}
              id="tab_btn_modules"
            >
              Mô-đun học tập
            </button>
            <button 
              onClick={() => { setActiveTab('chat'); setReadingModuleId(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'chat' ? 'text-[#00f0ff] bg-[#122131] border-b-2 border-[#00f0ff] rounded-b-none' : 'text-[#b9cacb] hover:text-white hover:bg-[#122131]/50'}`}
              id="tab_btn_chat"
            >
              Sân chơi AI
            </button>
          </nav>

          {/* User badge and AI Helper CTA */}
          <div className="hidden md:flex items-center gap-4" id="header_user_wrap">
            <button 
              onClick={() => { setActiveTab('chat'); setReadingModuleId(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00dbe9] to-[#00a572] hover:from-[#00f0ff] hover:to-[#4edea3] text-[#051424] font-bold text-xs uppercase tracking-wider rounded-md transition-all duration-300 shadow-[0_0_15px_rgba(0,219,233,0.2)]"
              id="btn_ask_ai_header"
            >
              <Brain className="w-4 h-4 animate-pulse" />
              Hỏi AI
            </button>
          </div>

          {/* Mobile Hamburguer button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-[#b9cacb] hover:text-white focus:outline-none"
            id="mobile_menu_trigger"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-3 border-t border-[#1c2b3c] flex flex-col gap-2" id="mobile_nav_menu">
            <button 
              onClick={() => { setActiveTab('dashboard'); setReadingModuleId(null); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-md text-sm transition-all ${activeTab === 'dashboard' ? 'bg-[#122131] text-[#00f0ff] font-bold' : 'text-[#b9cacb]'}`}
            >
              Bảng điều khiển
            </button>
            <button 
              onClick={() => { setActiveTab('modules'); setReadingModuleId(null); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-md text-sm transition-all ${activeTab === 'modules' ? 'bg-[#122131] text-[#00f0ff] font-bold' : 'text-[#b9cacb]'}`}
            >
              Mô-đun học tập
            </button>
            <button 
              onClick={() => { setActiveTab('chat'); setReadingModuleId(null); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-md text-sm transition-all ${activeTab === 'chat' ? 'bg-[#122131] text-[#00f0ff] font-bold' : 'text-[#b9cacb]'}`}
            >
              Sân chơi AI
            </button>
          </div>
        )}
      </header>

      {/* CORE VIEWPORT SPA ROUTER BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6" id="vwa_main_viewport">

        {/* 1. HOME/DASHBOARD VIEW */}
        {activeTab === 'dashboard' && readingModuleId === null && (() => {
          const dashboardModules = [
            {
              id: 1,
              title: "Mô-đun 1: Nhập môn Mã hóa & Mật mã đối xứng",
              desc: "Học phần cơ bản về mật mã đối xứng, mã dòng và mã giải bằng thuật toán AES tại VWA.",
              difficulty: "Dễ",
              difficultyClass: "text-[#4edea3] bg-[#003824]",
              progress: module1Progress,
              completedCount: globalStats.module1CompletedCount,
            },
            {
              id: 2,
              title: "Mô-đun 2: Bảo mật Web (OWASP Top 10)",
              desc: "Nghiên cứu tấn công SQL Injection và phòng ngừa lỗ hổng ứng dụng web.",
              difficulty: "Trung bình",
              difficultyClass: "text-[#fed639] bg-[#3b2f00]",
              progress: module2Progress,
              completedCount: globalStats.module2CompletedCount,
            },
            {
              id: 4,
              title: "Mô-đun 4: Mật mã học nâng cao & RSA",
              desc: "Học thuyết mật mã học bất đối xứng hiện đại, hệ mã khóa công khai RSA.",
              difficulty: "Khó",
              difficultyClass: "text-[#ffb4ab] bg-[#690005]/40",
              progress: module4Progress,
              completedCount: globalStats.module4CompletedCount,
            }
          ];

          return (
            <div className="space-y-8 animate-fade-in" id="dashboard_view">
              
              {/* Hero Interactive Header */}
              <section className="relative overflow-hidden bg-gradient-to-br from-[#0d1c2d] to-[#051424] border border-[#1c2b3c] rounded-xl p-8 shadow-[0_10px_30px_rgba(1,15,31,0.5)]" id="dashboard_hero">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00f0ff]/5 rounded-full filter blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#10b981]/5 rounded-full filter blur-3xl pointer-events-none" />
                
                <div className="max-w-2xl relative z-10 space-y-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00363a] text-[#00f0ff] text-xs font-semibold uppercase tracking-wider rounded-full">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                    Trợ lý học thuật thế hệ mới
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    Làm chủ nền tảng An toàn thông tin với sự trợ giúp của AI
                  </h2>
                  <p className="text-sm text-[#b9cacb] leading-relaxed">
                    Khám phá lộ trình học tập được cá nhân hóa, từ mật mã học cơ bản đến kiểm thử xâm nhập & phân tích mã độc tiên tiến. Trợ lý AI Assistant luôn trực chiến hỗ trợ bạn giải thuật 24/7.
                  </p>

                  {/* Instant search input */}
                  <form onSubmit={handleAIPromptSplit} className="mt-6 flex flex-col sm:flex-row gap-2" id="hero_search_ai">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#849495]" />
                      <input 
                        type="text" 
                        value={searchPrompt}
                        onChange={(e) => setSearchPrompt(e.target.value)}
                        placeholder="Hỏi AI bất kỳ điều gì (VD: Thuật toán mã hóa RSA hoạt động ra sao?)"
                        className="w-full pl-11 pr-4 py-3 bg-[#051424] border border-[#273647] rounded-md focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] text-white placeholder-[#849495] text-sm font-medium transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="px-6 py-3 bg-[#00f0ff] hover:bg-[#7df4ff] text-[#051424] font-bold text-sm rounded-md transition-all duration-200 shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"
                    >
                      Hỏi AI
                    </button>
                  </form>
                </div>
              </section>

              {/* Modules Grid - Active / Registered courses */}
              <section className="space-y-4" id="dashboard_active_courses">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#00f0ff]" />
                    Mô-đun học tập của bạn
                  </h3>
                  <button onClick={() => setActiveTab('modules')} className="text-xs font-bold text-[#00f0ff] hover:underline flex items-center gap-1">
                    Xem tất cả
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="active-modules-grid">
                  {dashboardModules.map((course) => (
                    <div key={course.id} className="bg-[#0d1c2d] border border-[#1c2b3c] rounded-lg overflow-hidden flex flex-col justify-between group hover:border-[#00f0ff]/40 transition-all duration-300">
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${course.difficultyClass}`}>{course.difficulty}</span>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white group-hover:text-[#00f0ff] transition-all">{course.title}</h4>
                          <p className="text-xs text-[#849495] mt-1">{course.desc}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono text-[#849495]">
                            <span>Tiến độ học tập</span>
                            <span className="text-[#00dbe9]">{course.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#051424] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#00dbe9] to-[#00f0ff] rounded-full" style={{ width: `${course.progress}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-[#1c2b3c] p-4 bg-[#051424]/40 flex gap-2">
                        <button 
                          onClick={() => {
                            setActiveTab('modules');
                            setReadingModuleId(course.id);
                            setSelectedQuizModule(course.id);
                            setQuizState('splash');
                          }}
                          className="flex-1 py-1.5 bg-transparent hover:bg-[#122131] border border-[#273647] hover:border-[#00f0ff]/50 rounded text-center text-xs text-[#b9cacb] hover:text-white transition-all font-semibold"
                        >
                          Học bài lý thuyết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Special AI Path Banner Option */}
              <section className="bg-gradient-to-r from-[#00363a] to-[#010f1f] border border-[#00f0ff]/30 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6" id="ai_path_banner_wrap">
                <div className="space-y-2">
                  <span className="text-[10px] text-[#051424] bg-[#00f0ff] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Mới cập nhật</span>
                  <h4 className="text-lg font-bold text-white leading-tight">Lộ trình Chuyên gia AI Security (University Syllabus)</h4>
                  <p className="text-sm text-[#b9cacb]">Tìm hiểu cách ứng dụng AI hỗ trợ phòng thủ trước tấn công Prompt Injection, bẻ khóa mô hình lớn LLM.</p>
                </div>
                <button 
                  onClick={() => { setActiveTab('chat'); handleSendMessage("Hướng dẫn tôi lộ trình Chuyên gia AI Security cụ thể với!"); }}
                  className="whitespace-nowrap px-5 py-2.5 bg-[#00f0ff] hover:bg-[#7df4ff] text-[#051424] font-bold text-xs uppercase tracking-wider rounded transition-all duration-200"
                >
                  Khám phá lộ trình chuyên gia
                </button>
              </section>

              {/* Lịch sử ôn tập & đánh giá cá nhân */}
              <section className="bg-[#0d1c2d] border border-[#1c2b3c] rounded-xl p-6 space-y-4" id="personal_quiz_history_card">
                <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-3" id="history_card_header">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-[#fed639]" />
                    <h4 className="text-base font-bold text-white uppercase tracking-wider font-sans">Lịch sử Ôn tập & Bài thi</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#849495] font-mono" id="history_attempts_stat">
                    <span>Số lần thử lại:</span>
                    <span className="px-2 py-0.5 bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 rounded font-bold">{quizAttemptsCount}</span>
                  </div>
                </div>

                {quizHistory.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#849495]" id="history_empty_state">
                    Bạn chưa thực hiện lượt kiểm tra đánh giá nào. Kết quả chi tiết và các câu hỏi sai sẽ được lưu giữ tại đây sau mỗi lượt làm bài.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar" id="history_list_container">
                    {quizHistory.map((attempt, index) => {
                      const isPassed = attempt.score >= 32; // Over 80% of 40 questions is 32 marks
                      return (
                        <div key={index} className="p-4 bg-[#051424]/60 border border-[#273647]/50 hover:border-[#1c2b3c] rounded-lg p-4 space-y-3 transition-all" id={`attempt_row_${index}`}>
                        <div className="flex items-center justify-between flex-wrap gap-2" id={`attempt_meta_${index}`}>
                          <div className="flex items-center gap-2" id={`attempt_status_wrap_${index}`}>
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
                              isPassed 
                                ? 'bg-[#003824] text-[#10b981] border border-[#10b981]/30' 
                                : 'bg-[#690005]/40 text-[#ffb4ab] border border-[#ffb4ab]/20'
                            }`}>
                              {isPassed ? 'ĐẠT CHUẨN ✔️' : 'CHƯA ĐẠT ❌'}
                            </span>
                            <span className="text-xs text-[#b9cacb] font-medium">{attempt.timestamp}</span>
                          </div>
                          <div className="text-sm font-bold text-white" id={`attempt_score_${index}`}>
                            Điểm số: <span className={isPassed ? 'text-[#4edea3]' : 'text-[#ffb4ab]'}>{attempt.score}</span> / {attempt.totalQuestions}
                          </div>
                        </div>

                        {attempt.incorrectQuestions.length > 0 ? (
                          <details className="group" id={`details_incorrect_${index}`}>
                            <summary className="text-xs text-[#00f0ff] hover:underline cursor-pointer select-none font-medium flex items-center gap-1">
                              Xem danh sách câu sai ({attempt.incorrectQuestions.length})
                            </summary>
                            <div className="mt-2.5 pl-3 border-l-2 border-[#ffb4ab]/30 space-y-3 pt-1" id={`incorrect_questions_list_${index}`}>
                              {attempt.incorrectQuestions.map((iq: any, qIdx: number) => (
                                <div key={qIdx} className="space-y-1.5 text-xs" id={`iq_${index}_${qIdx}`}>
                                  <p className="font-semibold text-white/95">
                                    Q: {iq.questionText}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-mono mt-1">
                                    <div className="text-[#ffb4ab] bg-[#690005]/20 p-1.5 rounded border border-[#ffb4ab]/10">
                                      Bạn đã chọn: <strong className="underline">{iq.selectedAnswerText}</strong>
                                    </div>
                                    <div className="text-[#4edea3] bg-[#003824]/40 p-1.5 rounded border border-[#10b981]/15">
                                      Đáp án đúng: <strong>{iq.correctAnswerText}</strong>
                                    </div>
                                  </div>
                                  <p className="text-[11px] text-[#849495] italic mt-1 bg-[#122131]/40 p-1.5 rounded border border-[#1c2b3c]/50">
                                    Giải thích: {iq.explanation}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </details>
                        ) : (
                          <span className="text-xs text-[#10b981] font-mono leading-none flex items-center gap-1 select-none">
                            <CheckCircle className="w-3.5 h-3.5" /> Điểm tuyệt đối, không có câu trả lời sai!
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
          );
        })()}

        {/* 2. COURSE CATALOG LAYOUT & DETAILED READING TAB */}
        {activeTab === 'modules' && (
          <div className="space-y-6 animate-fade-in" id="modules_view_root">
            
            {/* Catalog Grid View is expanded by default, unless user clicks a module to read */}
            {readingModuleId === null ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Thư viện Mô-đun học tập</h2>
                  <p className="text-sm text-[#b9cacb] mt-1">Khám phá lộ trình từ cơ bản tới nâng cao. Học tập vững vàng lý thuyết bảo mật tích hợp câu hỏi kiểm tra có thật để nhận chứng chỉ.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="catalogs-grid">
                  {modulesConfig.map((module) => (
                    <div key={module.id} className="bg-[#0d1c2d] border border-[#1c2b3c] rounded-xl p-6 hover:border-[#00f0ff]/30 transition-all flex flex-col justify-between group">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="w-10 h-10 rounded bg-[#2c3a4c] flex items-center justify-center">
                            {module.icon}
                          </span>
                          <div className="flex gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${module.difficultyClass}`}>{module.difficulty}</span>
                            <span className="text-xs text-[#849495] font-mono">{module.timing}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-[#00f0ff] transition-all">{module.title}</h3>
                          <p className="text-sm text-[#b9cacb] mt-2 leading-relaxed min-h-[60px] line-clamp-3">{module.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#4edea3] font-mono bg-[#003824]/30 px-3 py-1.5 rounded w-fit">
                          <CheckCircle className="w-4 h-4" />
                          Tiến độ: {module.progress}%
                        </div>
                      </div>
                      <div className="border-t border-[#1c2b3c] mt-6 pt-4 flex items-center justify-end">
                        <button 
                          onClick={() => {
                            setSelectedQuizModule(module.id);
                            setReadingModuleId(module.id);
                            setQuizState('splash');
                          }}
                          className="px-3.5 py-2 bg-[#00f0ff] hover:bg-[#7df4ff] text-[#051424] text-xs font-bold rounded flex items-center gap-1 transition-all whitespace-nowrap"
                        >
                          Học ngay
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="reading_view">
                <div className="lg:col-span-7 space-y-6">
                <div>
                  <button 
                    onClick={() => setReadingModuleId(null)}
                    className="mb-4 text-xs font-bold text-[#00f0ff] hover:underline flex items-center gap-1 text-left"
                    id="btn_back_to_catalog"
                  >
                    <ChevronLeft className="w-4 h-4" /> Quay lại thư viện
                  </button>
                  <h2 className="text-2xl font-extrabold text-[#fff] tracking-tight">{MODULE_LECTURES[readingModuleId || 4]?.title}</h2>
                  </div>

                  {/* Core Lesson text */}
                  <article className="prose prose-invert prose-sm max-w-none text-xs md:text-sm text-[#b9cacb] leading-relaxed space-y-4" id="lesson_html_content">
                    {MODULE_LECTURES[readingModuleId || 4]?.text}

                    {/* Code Section */}
                    {MODULE_LECTURES[readingModuleId || 4]?.code && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between" id="code_block_header">
                          <span className="font-mono text-xs text-[#849495] flex items-center gap-1.5">
                            <Code className="w-4 h-4 text-[#4edea3]" />
                            {MODULE_LECTURES[readingModuleId || 4]?.codeTitle || "Script minh họa (Python)"}
                          </span>
                          <span className="text-[11px] font-mono text-[#849495] bg-[#122131] px-2 py-0.5 rounded">
                            {MODULE_LECTURES[readingModuleId || 4]?.codeFilename || "rsa_demo.py"}
                          </span>
                        </div>

                        <div className="relative bg-[#051424] border border-[#273647] rounded p-4 font-mono text-xs overflow-x-auto space-y-1 block" id="code_area">
                          <button 
                            onClick={copyPythonCode}
                            className="absolute right-3 top-3 p-1.5 rounded bg-[#122131] hover:bg-[#1c2b3c] text-white transition-all shadow border border-[#273647]"
                            title="Sao chép mã nguồn"
                            id="btn_copy_code"
                          >
                            {copiedCode ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5 text-[#00f0ff]" />}
                          </button>

                          <pre className="text-left text-[#b9cacb] leading-relaxed select-text font-mono text-xs whitespace-pre-wrap">
                            {MODULE_LECTURES[readingModuleId || 4]?.code}
                          </pre>
                        </div>
                      </div>
                    )}
                  </article>

                  {/* CRUCIAL QUIZ ENGINE UI CARD */}
                  <div className="bg-[#0d1c2d] border border-[#00f0ff]/30 rounded-lg overflow-hidden shadow-[0_5px_15px_rgba(0,240,255,0.1)]" id="quiz_engine_wrapper">
                    
                    {/* Header bar */}
                    <div className="bg-gradient-to-r from-[#122131] to-[#1c2b3c] border-b border-[#1c2b3c] px-5 py-4 flex items-center justify-between" id="quiz_header">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-[#fed639]" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hệ thống Trắc nghiệm Đánh giá (VWA Quiz Engine)</h4>
                      </div>
                      <span className="text-xs font-mono text-[#00f0ff] bg-[#051424] px-2 py-1 rounded">Mô-đun {selectedQuizModule}</span>
                    </div>

                    <div className="p-5" id="quiz_body_content">
                      
                      {/* SPLASH INITIAL SCREEN */}
                      {quizState === 'splash' && (
                        <div className="text-center py-6 space-y-4" id="quiz_splash">
                          <Award className="w-16 h-16 text-[#fed639] mx-auto animate-bounce" />
                          <div className="space-y-2">
                            <h5 className="text-base font-bold text-white">Xác minh Chứng nhận Mô-đun 0{selectedQuizModule}</h5>
                            <p className="text-xs text-[#b9cacb] max-w-md mx-auto leading-relaxed">
                              Vượt qua {activeQuestions.length} câu hỏi trắc nghiệm chuyên sâu để nhận ngay <strong>+{150 + (activeQuestions.length * 10)} XP</strong>, tích lũy điểm thực tế học tập và đồng bộ lên cơ sở dữ liệu.
                            </p>
                          </div>

                          {/* Beautiful Interactive Module Dropdown Selector */}
                          <div className="max-w-xs mx-auto space-y-1.5 text-left bg-[#051424] border border-[#1c2b3c] p-3 rounded-lg">
                            <label className="text-[10px] font-mono uppercase text-[#849495] tracking-wider block">Chọn Mô-đun Cần Kiểm Tra:</label>
                            <select 
                              value={selectedQuizModule}
                              onChange={(e) => {
                                setSelectedQuizModule(Number(e.target.value));
                                setQuizState('splash');
                              }}
                              className="w-full bg-[#0d1c2d] border border-[#1c2b3c] hover:border-[#00f0ff]/50 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f0ff] font-mono transition-all"
                            >
                              <option value={1}>Mô-đun 1: Nhập môn Mã hóa & Mã đối xứng (20 câu ngẫu nhiên)</option>
                              <option value={2}>Mô-đun 2: Bảo mật ứng dụng Web (20 câu ngẫu nhiên)</option>
                              <option value={3}>Mô-đun 3: An ninh hạ tầng mạng (20 câu ngẫu nhiên)</option>
                              <option value={4}>Mô-đun 4: Mật mã học nâng cao & RSA (20 câu ngẫu nhiên)</option>
                              <option value={5}>Mô-đun 5: Trắc nghiệm Chuyên sâu Chuyên gia (20 câu ngẫu nhiên)</option>
                              <option value={6}>Mô-đun 6: Mật mã học Toàn diện (20 câu ngẫu nhiên)</option>
                            </select>
                          </div>
                          
                          {completedQuizzes[selectedQuizModule] && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00311f] border border-[#10b981]/50 text-[#10b981] text-xs font-semibold rounded">
                              <CheckCircle className="w-4 h-4" />
                              Bạn đã vượt qua bài thi này rồi!
                            </div>
                          )}

                          <div className="pt-2">
                            <button 
                              onClick={startQuiz}
                              className="px-6 py-2.5 bg-[#00f0ff] hover:bg-[#7df4ff] text-[#051424] text-xs font-bold uppercase tracking-wider rounded transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                              id="btn_start_quiz"
                            >
                              Bắt đầu làm bài
                            </button>
                          </div>

                          {quizHistory.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-[#1c2b3c] text-left space-y-3" id="quiz_splash_history_minimap">
                              <h5 className="text-xs font-bold text-[#fcd34d] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                <History className="w-4 h-4 text-[#fcd34d]" />
                                Lịch sử ôn tập & lần thử ({quizAttemptsCount})
                              </h5>
                              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-[11px] custom-scrollbar" id="splash_history_scroller">
                                {quizHistory.map((att, iIdx) => {
                                  const isAttPassed = att.score >= Math.ceil(att.totalQuestions * 0.8);
                                  return (
                                    <div key={iIdx} className="bg-[#122131]/60 border border-[#273647]/40 p-2.5 rounded flex justify-between items-center gap-2">
                                      <div>
                                        <p className="text-white font-semibold">Lần thi ngày {att.timestamp}</p>
                                        <p className="text-[#849495] mt-0.5">
                                          Kết quả: <span className={isAttPassed ? 'text-[#4edea3]' : 'text-[#ffb4ab]'}>{att.score}/{att.totalQuestions} câu đúng</span>
                                          {att.incorrectQuestions.length > 0 && ` (${att.incorrectQuestions.length} lỗi sai)`}
                                        </p>
                                      </div>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        isAttPassed ? 'bg-[#003824] text-[#10b981]' : 'bg-[#690005]/40 text-[#ffb4ab]'
                                      }`}>
                                        {isAttPassed ? 'ĐẠT' : 'THI LẠI'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                      {/* PLAYING STATE QUESTION */}
                      {quizState === 'playing' && (
                        <div className="space-y-5 animate-fade-in" id="quiz_playing">
                          
                          {/* Progress indicator */}
                          <div className="flex justify-between items-center text-xs font-mono" id="quiz_progress">
                            <span className="text-[#849495]">Câu hỏi {currentQuestionIndex + 1} / {activeQuestions.length}</span>
                            <span className="text-[#00f0ff] font-bold">Tiến trình: {Math.round(((currentQuestionIndex) / activeQuestions.length) * 100)}%</span>
                          </div>

                          <div className="w-full h-1 bg-[#051424] rounded-full overflow-hidden">
                            <div className="h-full bg-[#00f0ff] transition-all" style={{ width: `${((currentQuestionIndex) / activeQuestions.length) * 100}%` }} />
                          </div>

                          {/* Question text */}
                          <div className="bg-[#122131]/60 p-4 border border-[#1c2b3c] rounded text-sm font-semibold text-white leading-relaxed">
                            {activeQuestions[currentQuestionIndex]?.questionText}
                          </div>

                          {/* Options checklist */}
                          <div className="space-y-2.5" id="quiz_options">
                            {activeQuestions[currentQuestionIndex]?.options.map((option, idx) => {
                              const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                              return (
                                <button 
                                  key={idx}
                                  onClick={() => !showExplanation && handleSelectOption(idx)}
                                  disabled={showExplanation}
                                  className={`w-full text-left p-3 rounded-md text-xs transition-all flex items-start gap-3 border ${
                                    isSelected 
                                      ? 'bg-[#122131] border-[#00f0ff] text-[#00f0ff] font-semibold' 
                                      : 'bg-[#051424]/40 border-[#1a2c3f] hover:border-[#00f0ff]/30 text-[#b9cacb]'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10px] shrink-0 ${
                                    isSelected 
                                      ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff]' 
                                      : 'border-[#849495] text-[#849495]'
                                  }`}>
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span>{option}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Detailed Explanation / Feedback */}
                          {showExplanation && (
                            <div className="mt-4 p-4 rounded bg-[#122131] border-l-4 border-[#00f0ff] space-y-2 animate-fade-in" id="quiz_explanation_block">
                              <div className="flex items-center gap-2 font-bold text-xs" id="quiz_feedback_result">
                                {selectedAnswers[currentQuestionIndex] === activeQuestions[currentQuestionIndex]?.correctAnswerIndex ? (
                                  <div className="text-[#4edea3] flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Chính xác!
                                  </div>
                                ) : (
                                  <div className="text-[#ffb4ab] flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    Chưa chính xác! Đáp án đúng: {String.fromCharCode(65 + (activeQuestions[currentQuestionIndex]?.correctAnswerIndex || 0))}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-[#b9cacb] leading-relaxed">
                                {activeQuestions[currentQuestionIndex]?.explanation}
                              </p>
                            </div>
                          )}

                          {/* Control buttons */}
                          <div className="pt-2 flex justify-end gap-2" id="quiz_controls">
                            {!showExplanation ? (
                              <button 
                                onClick={handleNextQuestion}
                                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                                className={`px-5 py-2 rounded text-xs font-bold uppercase transition-all ${
                                  selectedAnswers[currentQuestionIndex] !== undefined 
                                    ? 'bg-[#00f0ff] hover:bg-[#7df4ff] text-[#051424] cursor-pointer' 
                                    : 'bg-[#122131] text-[#849495] cursor-not-allowed'
                                }`}
                                id="btn_evaluate_answer"
                              >
                                Đánh giá câu trả lời
                              </button>
                            ) : (
                              <button 
                                onClick={handleProceedNext}
                                className="px-5 py-2 bg-[#10b981] hover:bg-[#4edea3] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                                id="btn_next_question"
                              >
                                {currentQuestionIndex < activeQuestions.length - 1 ? 'Tiếp tục câu sau' : 'Xem kết quả bài thi'}
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                        </div>
                      )}

                      {/* RESULT SUMMARY PAGE */}
                      {quizState === 'result' && (() => {
                        const totalQs = activeQuestions.length;
                        const passingScore = Math.ceil(totalQs * 0.8);
                        const isPassed = quizScore >= passingScore;
                        return (
                          <div className="text-center py-6 space-y-5 animate-fade-in" id="quiz_score_result">
                            
                            {isPassed ? (
                              <div className="space-y-4">
                                <Trophy className="w-16 h-16 text-[#fed639] mx-auto animate-bounce" />
                                <div className="space-y-1">
                                  <h5 className="text-lg font-bold text-[#4edea3]">Chúc mừng xuất sắc! Bạn đạt {quizScore} / {totalQs} điểm!</h5>
                                  <p className="text-xs text-[#b9cacb] leading-relaxed max-w-sm mx-auto">
                                    Hệ thống Học viện An toàn VWA đã đồng bộ hóa thành tích của bạn! <br />
                                    Bạn nhận được <strong>+{150 + (totalQs * 10)} XP</strong> và chính thức vượt qua <strong className="text-[#00f0ff]">Đánh giá Mô-đun 0{selectedQuizModule} ({totalQs} Câu hỏi)</strong>.
                                  </p>
                                </div>
                                <div className="inline-flex gap-1.5 px-3 py-1 bg-[#003824] text-[#10b981] text-xs font-semibold rounded-full border border-[#10b981]/40">
                                  🎖️ Đã mở khóa chứng chỉ Học viện VWA
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <AlertCircle className="w-16 h-16 text-[#ffb4ab] mx-auto" />
                                <div className="space-y-1">
                                  <h5 className="text-base font-bold text-white">Bạn đạt: {quizScore} / {totalQs} điểm!</h5>
                                  <p className="text-xs text-[#b9cacb] leading-relaxed max-w-xs mx-auto">
                                    Để vượt qua bài thực hành đánh giá và đồng bộ kết quả, bạn cần đạt tối thiểu <strong>{passingScore} / {totalQs} điểm (80%)</strong>. Hãy ôn tập lại lý thuyết và Thử lại nhé!
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
                              <button 
                                onClick={resetQuiz}
                                className="w-full sm:w-auto px-5 py-2 border border-[#273647] hover:border-[#00f0ff]/50 text-white rounded text-xs font-bold uppercase transition-all"
                                id="btn_retry_quiz"
                              >
                                Làm lại bài thi
                              </button>
                              {incorrectQuestionIndices.length > 0 && (
                                <button 
                                  onClick={() => {
                                    setQuizState('review');
                                    setReviewIndex(0);
                                  }}
                                  className="w-full sm:w-auto px-5 py-2 bg-[#d97706]/20 border border-[#d97706] hover:bg-[#d97706]/40 text-[#fcd34d] hover:text-white rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                                  id="btn_enter_review"
                                >
                                  <BookOpen className="w-4 h-4 text-[#fcd34d]" />
                                  Ôn tập câu sai ({incorrectQuestionIndices.length})
                                </button>
                              )}
                              {isPassed && (
                                <button 
                                  onClick={() => { setActiveTab('modules'); setReadingModuleId(null); }}
                                  className="w-full sm:w-auto px-5 py-2 bg-[#00f0ff] hover:bg-[#7df4ff] text-[#051424] rounded text-xs font-bold uppercase transition-all"
                                  id="btn_view_certs"
                                >
                                  Trở lại mô-đun
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })()}

                      {/* REVIEW INCORRECT ANSWERS STATE */}
                      {quizState === 'review' && (
                        <div className="space-y-5 animate-fade-in" id="quiz_review_view">
                          
                          {/* Header with Title and Back to Results */}
                          <div className="flex justify-between items-center pb-2 border-b border-[#1c2b3c]" id="review_header_nav">
                            <div className="flex items-center gap-2 text-[#fcd34d] font-bold text-sm">
                              <BookOpen className="w-4 h-4 animate-pulse" />
                              <span>CHẾ ĐỘ ÔN TẬP CÂU SAI ({incorrectQuestionIndices.length} CÂU)</span>
                            </div>
                            <button 
                              onClick={() => setQuizState('result')}
                              className="text-xs text-[#849495] hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                              id="btn_back_to_result"
                            >
                              <X className="w-3.5 h-3.5" />
                              Quay lại kết quả
                            </button>
                          </div>

                          {incorrectQuestionIndices.length > 0 ? (
                            <div className="space-y-4" id="review_content_body">
                              <div className="flex justify-between items-center text-xs font-mono text-[#849495]" id="review_info_row">
                                <span>Câu sai số: {reviewIndex + 1} / {incorrectQuestionIndices.length}</span>
                                <span>ID gốc: #{activeQuestions[incorrectQuestionIndices[reviewIndex]]?.id}</span>
                              </div>

                              {/* Question Section */}
                              <div className="bg-[#122131]/60 p-4 border border-[#1c2b3c] rounded text-sm font-semibold text-white leading-relaxed">
                                {activeQuestions[incorrectQuestionIndices[reviewIndex]]?.questionText}
                              </div>

                              {/* Interactive highlighted responses */}
                              <div className="space-y-2.5" id="review_options_list">
                                {activeQuestions[incorrectQuestionIndices[reviewIndex]]?.options.map((option, idx) => {
                                  const actualIndex = incorrectQuestionIndices[reviewIndex];
                                  const wasSelected = selectedAnswers[actualIndex] === idx;
                                  const isCorrect = activeQuestions[actualIndex]?.correctAnswerIndex === idx;

                                  let optionStyle = "bg-[#051424]/40 border-[#1a2c3f] text-[#b9cacb]";
                                  if (wasSelected) {
                                    optionStyle = "bg-[#690005]/20 border-[#ffb4ab] text-[#ffb4ab] font-medium";
                                  }
                                  if (isCorrect) {
                                    optionStyle = "bg-[#003824] border-[#10b981] text-[#4edea3] font-semibold";
                                  }

                                  return (
                                    <div 
                                      key={idx}
                                      className={`w-full text-left p-3 rounded-md text-xs flex items-start gap-3 border ${optionStyle}`}
                                    >
                                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10px] shrink-0 ${
                                        isCorrect 
                                          ? 'border-[#10b981] text-[#4edea3] bg-[#003824]' 
                                          : wasSelected 
                                            ? 'border-[#ffb4ab] text-[#ffb4ab] bg-[#690005]/40' 
                                            : 'border-[#849495] text-[#849495]'
                                      }`}>
                                        {String.fromCharCode(65 + idx)}
                                      </span>
                                      <div className="flex-1">
                                        <span>{option}</span>
                                        {wasSelected && (
                                          <span className="ml-2 py-0.5 px-1.5 bg-[#4a0006] text-[#ffb4ab] font-mono text-[9px] rounded uppercase font-bold tracking-wider">
                                            Bạn chọn sai ❌
                                          </span>
                                        )}
                                        {isCorrect && (
                                          <span className="ml-2 py-0.5 px-1.5 bg-[#002f1a] text-[#4edea3] font-mono text-[9px] rounded uppercase font-bold tracking-wider">
                                            Đáp án đúng ✔️
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation Panel */}
                              <div className="p-4 rounded bg-[#122131] border-l-4 border-[#d97706] space-y-2 animate-fade-in" id="review_explanation_box">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-[#fcd34d]" id="review_explanation_title">
                                  <Brain className="w-4 h-4 text-[#fcd34d]" />
                                  <span>Phân tích đáp án & Giải thích học thuật:</span>
                                </div>
                                <p className="text-xs text-[#b9cacb] leading-relaxed">
                                  {activeQuestions[incorrectQuestionIndices[reviewIndex]]?.explanation}
                                </p>
                              </div>

                              {/* Steppers & Navigation Actions */}
                              <div className="pt-2 flex justify-between items-center" id="review_navigation_controls">
                                <button
                                  onClick={() => setReviewIndex(prev => Math.max(0, prev - 1))}
                                  disabled={reviewIndex === 0}
                                  className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
                                    reviewIndex > 0 
                                      ? 'bg-[#122131] border border-[#273647] hover:border-[#00f0ff]/50 text-white cursor-pointer' 
                                      : 'opacity-30 cursor-not-allowed text-gray-500 border border-[#273647]/50'
                                  }`}
                                  id="btn_review_prev"
                                >
                                  Câu trước
                                </button>

                                <span className="text-xs font-mono text-[#849495]">
                                  {reviewIndex + 1} / {incorrectQuestionIndices.length}
                                </span>

                                {reviewIndex < incorrectQuestionIndices.length - 1 ? (
                                  <button
                                    onClick={() => setReviewIndex(prev => Math.min(incorrectQuestionIndices.length - 1, prev + 1))}
                                    className="px-4 py-2 bg-[#00f0ff] hover:bg-[#7df4ff] text-[#051424] rounded text-xs font-bold uppercase transition-all cursor-pointer"
                                    id="btn_review_next"
                                  >
                                    Câu tiếp theo
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setQuizState('result')}
                                    className="px-4 py-2 bg-[#10b981] hover:bg-[#4edea3] text-white rounded text-xs font-bold uppercase transition-all cursor-pointer"
                                    id="btn_review_finish"
                                  >
                                    Xong ôn tập
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 space-y-3" id="review_empty_case">
                              <CheckCircle className="w-12 h-12 text-[#4edea3] mx-auto animate-bounce" />
                              <h5 className="font-bold text-white text-sm">Tuyệt vời! Bạn không trả lời sai câu nào!</h5>
                              <p className="text-xs text-[#849495] max-w-xs mx-auto">
                                Điểm số tối đa chứng minh bạn đã hoàn toàn thấu hiểu chuyên sâu về kiến trúc an toàn thông tin & mật mã hóa RSA.
                              </p>
                              <button
                                onClick={() => setQuizState('result')}
                                className="px-5 py-2 bg-[#273647] text-white hover:bg-[#34485e] rounded text-xs font-bold uppercase transition-all cursor-pointer"
                                id="btn_review_empty_return"
                              >
                                Quay lại bảng điểm
                              </button>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  </div>

                </div>

                {/* RIGHT SIDEBAR COLUMN (AI Chat Workspace Widget) */}
                <div className="lg:col-span-5 flex flex-col bg-[#0d1c2d] border border-[#1c2b3c] rounded-xl overflow-hidden shadow-2xl h-[calc(100vh-140px)]" id="right_chat_column">
                  
                  {/* Chat header bar */}
                  <div className="bg-[#122131] border-b border-[#1c2b3c] p-4 flex items-center justify-between" id="side_chat_header">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#00363a] flex items-center justify-center border border-[#00f0ff]/30">
                        <Brain className="w-4 h-4 text-[#00f0ff]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-wide">Trợ lý VWA AI</h4>
                        <span className="text-[10px] text-[#4edea3] font-mono flex items-center gap-1.5 leading-none">
                          <span className="w-1.5 h-1.5 bg-[#4edea3] rounded-full animate-ping" />
                          Đang trực tuyến
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Messages container list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-normal" id="side_chat_messages_wrap">
                    {chatMessages.map((msg, i) => {
                      const isBot = msg.sender === 'bot';
                      return (
                        <div key={i} className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}>
                          
                          {/* Avatar icon */}
                          <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] ${
                            isBot ? 'bg-[#00363a] text-[#00f0ff] border border-[#00f0ff]/20' : 'bg-[#2c3a4c] text-[#fff]'
                          }`}>
                            {isBot ? <BriefCaseIconFallback /> : <User className="w-3 h-3" />}
                          </div>

                          {/* Text bubble box */}
                          <div className="space-y-1 bg-transparent">
                            <div className={`p-3 rounded-md text-xs leading-relaxed ${
                              isBot ? 'bg-[#1c2b3c] text-white border border-[#273647]' : 'bg-[#00f0ff] text-[#051424] font-medium'
                            }`}>
                              {isBot ? renderFormattedMessage(msg.text) : <p className="whitespace-pre-line">{msg.text}</p>}
                            </div>
                            <span className="block text-[10px] text-[#849495] font-mono">{msg.time}</span>
                          </div>

                        </div>
                      );
                    })}

                    {/* AI Thinking / typing feedback indicator */}
                    {aiTyping && (
                      <div className="flex gap-3 max-w-[50%] mr-auto text-left">
                        <div className="w-6 h-6 rounded-full bg-[#00363a] text-[#00f0ff] flex items-center justify-center">
                          <Brain className="w-3 h-3 animate-pulse" />
                        </div>
                        <div className="bg-[#1c2b3c] text-[#fff] p-3 rounded-md border border-[#273647]">
                          <div className="flex gap-1 items-center py-1">
                            <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={chatBottomRef} />
                  </div>

                  {/* Suggestion Chips list */}
                  <div className="border-t border-[#1c2b3c] p-3 bg-[#051424]/40 overflow-x-auto whitespace-nowrap flex gap-2" id="quick_prompt_chips">
                    {getSuggestionChipsForModule(readingModuleId).map((chip, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSuggestionClick(chip.prompt)}
                        className="px-2.5 py-1.5 bg-[#122131] hover:bg-[#1c2b3c] text-[11px] text-[#00f0ff] border border-[#273647] hover:border-[#00f0ff]/40 rounded transition-all cursor-pointer font-medium"
                      >
                        {chip.text}
                      </button>
                    ))}
                  </div>

                  {/* Inpuy messaging area */}
                  <div className="border-t border-[#1c2b3c] p-3 bg-[#122131]" id="side_chat_input_wrap">
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSendMessage(chatInput); }}
                      className="flex gap-2"
                    >
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Đặt câu hỏi cho Trợ lý AI..."
                        className="flex-1 px-3.5 py-2 bg-[#051424] border border-[#273647] rounded focus:outline-none focus:border-[#00f0ff] text-xs text-white placeholder-[#849495]"
                      />
                      <button 
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="w-10 h-10 rounded bg-[#00f0ff] disabled:bg-[#122131] hover:bg-[#7df4ff] text-[#051424] disabled:text-[#849495] flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4 shrink-0" />
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* 3. STANDALONE AI CHAT WORKSPACE PLAYGROUND */}
        {activeTab === 'chat' && readingModuleId === null && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[calc(100vh-160px)] animate-fade-in" id="standalone_chat_view">
            
            {/* Sidebar with suggested topics */}
            <div className="md:col-span-1 bg-[#0d1c2d] border border-[#1c2b3c] rounded-xl p-4 space-y-4" id="chat_sidebar">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[#00f0ff]" />
                Lịch sử & Đề tài AI
              </h3>
              
              <div className="space-y-1 text-xs" id="chat_suggested_syllabus">
                <button 
                  onClick={() => handleSuggestionClick("Hãy giải thích cho tôi quy trình 4 tạo khóa của RSA.")}
                  className="w-full text-left p-2.5 rounded hover:bg-[#122131] text-white flex items-start gap-2 border border-transparent hover:border-[#1c2b3c] group transition-all"
                >
                  <span className="w-2 h-2 mt-1 rounded-full bg-[#00f0ff]" />
                  <span className="group-hover:text-[#00f0ff]">Thiết lập khóa RSA</span>
                </button>
                <button 
                  onClick={() => handleSuggestionClick("Tại sao mật mã đối xứng AES lại nhanh hơn RSA đối xứng bất đối xứng?")}
                  className="w-full text-left p-2.5 rounded hover:bg-[#122131] text-white flex items-start gap-2 border border-transparent hover:border-[#1c2b3c] group transition-all"
                >
                  <span className="w-2 h-2 mt-1 rounded-full bg-[#10b981]" />
                  <span className="group-hover:text-[#00f0ff]">Mã hóa AES vs RSA</span>
                </button>
                <button 
                  onClick={() => handleSuggestionClick("Làm thế nào để phòng chống tấn công SQL Injection và XSS?")}
                  className="w-full text-left p-2.5 rounded hover:bg-[#122131] text-white flex items-start gap-2 border border-transparent hover:border-[#1c2b3c] group transition-all"
                >
                  <span className="w-2 h-2 mt-1 rounded-full bg-[#fed639]" />
                  <span className="group-hover:text-[#00f0ff]">Bảo mật OWASP Web</span>
                </button>
                <button 
                  onClick={() => handleSuggestionClick("Cho tôi biết về các chứng danh bảo mật OSCP, CISSP có lợi ích gì?")}
                  className="w-full text-left p-2.5 rounded hover:bg-[#122131] text-white flex items-start gap-2 border border-transparent hover:border-[#1c2b3c] group transition-all"
                >
                  <span className="w-2 h-2 mt-1 rounded-full bg-[#ffb4ab]" />
                  <span className="group-hover:text-[#00f0ff]">Chứng chỉ nghề nghiệp</span>
                </button>
              </div>

              <div className="border-t border-[#1c2b3c] pt-4 text-center">
                <button 
                  onClick={() => setChatMessages([{ sender: 'bot', text: 'Tôi đã dọn sạch đoạn đối thoại cũ. Hãy đặt câu hỏi mới cho Trợ lý bảo mật nhé!', time: 'Vừa xong' }])}
                  className="px-3 py-1.5 bg-transparent border border-[#ffb4ab]/30 hover:border-[#F43F5E] text-[#ffb4ab] text-[10px] uppercase font-bold rounded transition-all cursor-pointer"
                  id="btn_clear_chat"
                >
                  Xóa bộ nhớ chat 🧹
                </button>
              </div>
            </div>

            {/* Comprehensive AI Chat main body workspace */}
            <div className="md:col-span-3 flex flex-col bg-[#0d1c2d] border border-[#1c2b3c] rounded-xl overflow-hidden shadow-2xl" id="chat_main_screen">
              
              {/* Standalone Chat Header */}
              <div className="bg-[#122131] border-b border-[#1c2b3c] px-6 py-4 flex items-center justify-between" id="standalone_chat_header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00363a] flex items-center justify-center border border-[#00f0ff]/30">
                    <Brain className="w-5 h-5 text-[#00f0ff]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-normal">Phòng học Sân chơi Trợ lý AI</h3>
                    <p className="text-[10px] text-[#4edea3] font-mono leading-none mt-1">Động cơ mô phỏng Trợ lý học thuật VWA AI - Hoạt động trực tiếp</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-[#849495] font-mono">Người dùng:</span>
                  <span className="text-xs text-white font-semibold bg-[#2c3a4c] px-2 py-0.5 rounded">student_vwa_lq</span>
                </div>
              </div>

              {/* Chat conversations */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-normal h-[360px]" id="standalone_chat_canvas">
                {chatMessages.map((msg, idx) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <div key={idx} className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}>
                      
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs ${
                        isBot ? 'bg-[#00363a] text-[#00f0ff] border border-[#00f0ff]/20' : 'bg-[#2c3a4c] text-white'
                      }`}>
                        {isBot ? <BriefCaseIconFallback /> : <User className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1">
                        <div className={`p-4 rounded-xl text-xs leading-relaxed shadow-md ${
                          isBot ? 'bg-[#1c2b3c] text-white border border-[#273647]' : 'bg-[#00f0ff] text-[#051424] font-medium'
                        }`}>
                          {isBot ? renderFormattedMessage(msg.text) : <p className="whitespace-pre-line">{msg.text}</p>}
                        </div>
                        <span className="block text-[10px] text-[#849495] font-mono">{msg.time}</span>
                      </div>

                    </div>
                  );
                })}

                {aiTyping && (
                  <div className="flex gap-3 max-w-[50%] mr-auto text-left">
                    <div className="w-8 h-8 rounded-full bg-[#00363a] text-[#00f0ff] flex items-center justify-center border border-[#00f0ff]/20">
                      <Brain className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="bg-[#1c2b3c] text-white p-4 rounded-xl border border-[#273647]">
                      <div className="flex gap-1 items-center py-1.5" id="dots_indicator">
                        <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Chat recommendation prompt box */}
              <div className="p-4 border-t border-[#1c2b3c] bg-[#122131]/60" id="quick_learning_prompts">
                <span className="text-[10px] text-[#849495] uppercase font-bold block mb-2 tracking-wider">Học tập nhanh cùng phím tắt gợi ý:</span>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleSuggestionClick("Sự khác biệt cốt lõi của khóa public key và private key là gì?")}
                    className="px-3 py-1.5 bg-[#051424] hover:bg-[#122131] border border-[#273647] hover:border-[#00f0ff]/30 text-white hover:text-[#00f0ff] text-xs rounded transition-all cursor-pointer font-medium"
                  >
                    🔐 Cốt lõi Public/Private Key
                  </button>
                  <button 
                    onClick={() => handleSuggestionClick("Tại sao nói siêu máy tính lượng tử có khả năng phá hủy thuật toán bảo mật RSA?")}
                    className="px-3 py-1.5 bg-[#051424] hover:bg-[#122131] border border-[#273647] hover:border-[#00f0ff]/30 text-white hover:text-[#00f0ff] text-xs rounded transition-all cursor-pointer font-medium"
                  >
                    🧬 Đe dọa từ máy tính lượng tử
                  </button>
                </div>
              </div>

              {/* Input section */}
              <div className="p-4 border-t border-[#1c2b3c] bg-[#122131]" id="standalone_chat_input_wrap">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(chatInput); }}
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Hãy đặt câu hỏi học thuật tại đây, Trợ lý AI sẽ lập tức giải thuật cho bạn..."
                    className="flex-1 px-4 py-3 bg-[#051424] border border-[#273647] rounded-md focus:outline-none focus:border-[#00f0ff] text-xs text-white placeholder-[#849495]"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="w-12 h-12 bg-[#00f0ff] disabled:bg-[#122131] hover:bg-[#7df4ff] text-[#051424] disabled:text-[#849495] rounded-md flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* GLOBAL FOOTER COMPONENT */}
      <footer className="bg-[#010f1f] border-t border-[#1c2b3c] py-6 px-6 mt-12 text-xs text-[#849495]" id="vwa_footer_root">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="space-y-1 text-center md:text-left">
            <h5 className="font-bold text-white text-xs">HỌC VIỆN AN TOÀN VWA 🛡️</h5>
            <p className="text-[11px]">© 2026 HỌC VIỆN AN TOÀN VWA. Nền tảng học tập mật mã học & an ninh mạng thế hệ mới hỗ trợ bởi Trí tuệ Nhân tạo và Trợ lý ảo AI.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[11px]" id="footer-links">
            <a href="#" className="hover:text-[#00f0ff] transition-all">Về chúng tôi</a>
            <a href="#" className="hover:text-[#00f0ff] transition-all">Chính sách bảo mật</a>
            <a href="#" className="hover:text-[#00f0ff] transition-all">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-[#00f0ff] transition-all">Liên hệ học thuật</a>
          </div>

        </div>
      </footer>

      {/* TOAST CONGRATULATIONS NOTIFICATION */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[1000] max-w-sm w-full bg-[#0d1c2d] border border-[#22c55e] rounded-xl shadow-2xl p-4 flex gap-3 animate-fade-in-up hover:scale-[1.02] transition-transform duration-300" id="toast_notification_node">
          <div className="w-10 h-10 rounded-full bg-[#003824] border border-[#10b981]/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#4edea3]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white leading-tight">{toast.title || "Chúc mừng!"}</h4>
            <p className="text-xs text-[#b9cacb] mt-1.5 leading-relaxed">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            className="text-gray-400 hover:text-white shrink-0 self-start"
            id="toast_close_btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}

// Fallback simple mini-robot avatar icon
function BriefCaseIconFallback() {
  return (
    <svg className="w-3.5 h-3.5 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

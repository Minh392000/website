import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Học viện An toàn VWA - Đào tạo An ninh mạng & Trợ lý AI',
  description: 'Nền tảng đào tạo an ninh mạng tối tân của Học viện An toàn VWA, rèn luyện kỹ năng bảo mật thực chiến hỗ trợ bởi Trợ lý AI học tập.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" className={`${inter.variable}`}>
      <body className="bg-[#051424] text-[#d4e4fa] font-sans antialiased selection:bg-[#00dbe9]/30 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

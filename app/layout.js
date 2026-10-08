import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

export const metadata = {
  title: "HRIS · Manajemen Jabatan Karyawan",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

const APPLY_SAVED_THEME_SCRIPT = `
  try {
    var savedTheme = localStorage.getItem('hris_theme');
    document.documentElement.setAttribute('data-theme', savedTheme === 'light' ? 'light' : 'dark');
  } catch (error) {}
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      data-theme="dark"
      className={`${inter.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: APPLY_SAVED_THEME_SCRIPT }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-bg font-sans text-fg">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

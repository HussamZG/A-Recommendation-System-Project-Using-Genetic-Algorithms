import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {NextConfig} from 'next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// إعدادات Next.js الرئيسية: تفعيل Strict Mode، الصور البعيدة، وإعدادات البناء
const nextConfig: NextConfig = {
  reactStrictMode: true, // تفعيل Strict Mode لتحسين أداء التطبيق
  outputFileTracingRoot: __dirname, // تعيين الجذر لتحليل الملفات
  eslint: {
    ignoreDuringBuilds: true, // تجاهل أخطاء ESLint أثناء البناء لتجنب الفشل بسبب التحذيرات
  },
  typescript: {
    ignoreBuildErrors: false, // عدم تجاهل أخطاء TypeScript أثناء البناء
  },
  // السماح بالصور من مصدر placeholder بعيد
  images: {
    remotePatterns: [
      {
        protocol: 'https', // بروتوكول الاتصال
        hostname: 'picsum.photos', // اسم المضيف
        port: '', // رقم المنفذ
        pathname: '/**', // يسمح بأي مسار تحت هذا النطاق
      },
    ],
  },
  // standalone يستخدم symlinks قد تفشل على Windows بدون صلاحيات إضافية
  output: process.platform === 'win32' ? undefined : 'standalone', // إعدادات الإخراج
  transpilePackages: ['motion'], // تحويل حزمة motion للتوافق مع Next.js
  webpack: (config, {dev}) => {
    // إيقاف HMR في بيئة AI Studio عبر متغير DISABLE_HMR
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/, // تجاهل جميع الملفات
      };
    }
    return config;
  },
};

export default nextConfig;

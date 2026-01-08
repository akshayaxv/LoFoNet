import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

// إنشاء اتصال بقاعدة البيانات
export const sql = neon(DATABASE_URL);

// التحقق من وجود الجداول وإنشائها إذا لم تكن موجودة
export async function initializeDatabase() {
    try {
        console.log('🔄 جاري تهيئة قاعدة البيانات...');

        // إنشاء جدول المستخدمين
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `;
        console.log('✅ جدول users تم إنشاؤه');

        // إنشاء جدول البلاغات
        await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'other',
        color TEXT,
        distinguishing_marks TEXT,
        date_occurred DATE NOT NULL,
        location_address TEXT,
        location_city TEXT,
        location_lat DOUBLE PRECISION,
        location_lng DOUBLE PRECISION,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `;
        console.log('✅ جدول reports تم إنشاؤه');

        // إنشاء جدول صور البلاغات
        await sql`
      CREATE TABLE IF NOT EXISTS report_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `;
        console.log('✅ جدول report_images تم إنشاؤه');

        // إنشاء جدول التطابقات
        await sql`
      CREATE TABLE IF NOT EXISTS ai_matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lost_report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
        found_report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
        image_score DOUBLE PRECISION NOT NULL DEFAULT 0,
        text_score DOUBLE PRECISION NOT NULL DEFAULT 0,
        location_score DOUBLE PRECISION NOT NULL DEFAULT 0,
        final_score DOUBLE PRECISION NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `;
        console.log('✅ جدول ai_matches تم إنشاؤه');

        // إنشاء جدول الإشعارات
        await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'system',
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `;
        console.log('✅ جدول notifications تم إنشاؤه');

        // إنشاء جدول جلسات المستخدمين
        await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `;
        console.log('✅ جدول user_sessions تم إنشاؤه');

        // إنشاء حساب Admin افتراضي إذا لم يكن موجوداً
        const adminExists = await sql`
      SELECT id FROM users WHERE email = 'admin@murshid.com'
    `;

        if (adminExists.length === 0) {
            await sql`
        INSERT INTO users (email, password_hash, name, role)
        VALUES ('admin@murshid.com', 'Admin123!@#', 'مدير النظام', 'admin')
      `;
            console.log('✅ تم إنشاء حساب Admin الافتراضي');
        }

        console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
        return true;
    } catch (error) {
        console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
        return false;
    }
}

// دالة للحصول على إحصائيات النظام
export async function getSystemStats() {
    try {
        const lostCount = await sql`SELECT COUNT(*) as count FROM reports WHERE type = 'lost'`;
        const foundCount = await sql`SELECT COUNT(*) as count FROM reports WHERE type = 'found'`;
        const matchedCount = await sql`SELECT COUNT(*) as count FROM reports WHERE status = 'matched'`;
        const usersCount = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'user'`;

        const totalReports = Number(lostCount[0]?.count || 0) + Number(foundCount[0]?.count || 0);
        const matchRate = totalReports > 0 ? (Number(matchedCount[0]?.count || 0) / totalReports * 100).toFixed(1) : 0;

        return {
            totalLostReports: Number(lostCount[0]?.count || 0),
            totalFoundReports: Number(foundCount[0]?.count || 0),
            successfulMatches: Number(matchedCount[0]?.count || 0),
            totalUsers: Number(usersCount[0]?.count || 0),
            matchRate: Number(matchRate),
        };
    } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
        return {
            totalLostReports: 0,
            totalFoundReports: 0,
            successfulMatches: 0,
            totalUsers: 0,
            matchRate: 0,
        };
    }
}

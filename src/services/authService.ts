import { sql } from '@/lib/db';

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar_url?: string;
    role: 'admin' | 'moderator' | 'user';
    is_active: boolean;
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

export interface AuthResult {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
}

const SESSION_KEY = 'murshid_session';

/**
 * تسجيل الدخول
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
        console.log('🔄 محاولة تسجيل الدخول...');

        const users = await sql`
      SELECT id, email, name, phone, avatar_url, role, is_active, created_at
      FROM users
      WHERE email = ${credentials.email} AND password_hash = ${credentials.password}
    `;

        console.log('نتيجة البحث:', users.length);

        if (users.length === 0) {
            return {
                success: false,
                error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
            };
        }

        const user = users[0] as User;

        if (!user.is_active) {
            return {
                success: false,
                error: 'هذا الحساب معطل. يرجى التواصل مع الدعم الفني.',
            };
        }

        // إنشاء جلسة جديدة
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 أيام

        await sql`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `;

        // حفظ الجلسة في localStorage
        saveSession(token, user);

        console.log('✅ تم تسجيل الدخول بنجاح');
        return {
            success: true,
            user,
            token,
        };
    } catch (error) {
        console.error('❌ خطأ في تسجيل الدخول:', error);
        return {
            success: false,
            error: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.',
        };
    }
}

/**
 * إنشاء حساب جديد
 */
export async function register(data: RegisterData): Promise<AuthResult> {
    try {
        console.log('🔄 محاولة إنشاء حساب جديد...');

        // التحقق من عدم وجود حساب بنفس البريد
        const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${data.email}
    `;

        if (existingUsers.length > 0) {
            return {
                success: false,
                error: 'يوجد حساب مسجل بهذا البريد الإلكتروني',
            };
        }

        // إنشاء المستخدم الجديد
        const newUsers = await sql`
      INSERT INTO users (email, password_hash, name, phone)
      VALUES (${data.email}, ${data.password}, ${data.name}, ${data.phone || null})
      RETURNING id, email, name, phone, avatar_url, role, is_active, created_at
    `;

        const user = newUsers[0] as User;

        // إنشاء جلسة جديدة
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await sql`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `;

        saveSession(token, user);

        console.log('✅ تم إنشاء الحساب بنجاح');
        return {
            success: true,
            user,
            token,
        };
    } catch (error) {
        console.error('❌ خطأ في إنشاء الحساب:', error);
        return {
            success: false,
            error: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.',
        };
    }
}

/**
 * تسجيل الخروج
 */
export async function logout(): Promise<void> {
    try {
        const session = getSession();
        if (session?.token) {
            await sql`
        DELETE FROM user_sessions WHERE token = ${session.token}
      `;
        }
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
    } finally {
        clearSession();
    }
}

/**
 * التحقق من الجلسة الحالية
 */
export async function validateSession(): Promise<AuthResult> {
    try {
        const session = getSession();
        if (!session?.token) {
            return { success: false };
        }

        const sessions = await sql`
      SELECT u.id, u.email, u.name, u.phone, u.avatar_url, u.role, u.is_active, u.created_at
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${session.token} AND s.expires_at > NOW()
    `;

        if (sessions.length === 0) {
            clearSession();
            return { success: false };
        }

        const user = sessions[0] as User;

        if (!user.is_active) {
            clearSession();
            return {
                success: false,
                error: 'هذا الحساب معطل',
            };
        }

        return {
            success: true,
            user,
            token: session.token,
        };
    } catch (error) {
        console.error('خطأ في التحقق من الجلسة:', error);
        return { success: false };
    }
}

/**
 * الحصول على المستخدم الحالي من الذاكرة المحلية
 */
export function getCurrentUser(): User | null {
    const session = getSession();
    return session?.user || null;
}

/**
 * التحقق من صلاحيات الأدمن
 */
export function isAdmin(): boolean {
    const user = getCurrentUser();
    return user?.role === 'admin';
}

// ==================== Helper Functions ====================

function generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

interface SessionData {
    token: string;
    user: User;
}

function saveSession(token: string, user: User): void {
    const session: SessionData = { token, user };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getSession(): SessionData | null {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

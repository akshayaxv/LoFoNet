import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Search, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, User, Phone, CheckCircle2 } from 'lucide-react';
import { validatePhone } from '@/data/mockData';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('يرجى إدخال الاسم الكامل');
            return false;
        }
        if (!formData.email.trim()) {
            toast.error('يرجى إدخال البريد الإلكتروني');
            return false;
        }
        if (formData.phone && !validatePhone(formData.phone)) {
            toast.error('رقم الهاتف غير صحيح');
            return false;
        }
        if (!formData.password) {
            toast.error('يرجى إدخال كلمة المرور');
            return false;
        }
        if (formData.password.length < 6) {
            toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('كلمة المرور غير متطابقة');
            return false;
        }
        if (!acceptTerms) {
            toast.error('يجب الموافقة على شروط الاستخدام');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone || undefined,
                password: formData.password,
            });

            if (result.success) {
                toast.success('تم إنشاء الحساب بنجاح!', {
                    description: 'مرحباً بك في نظام مُرشد',
                });
                navigate('/');
            } else {
                toast.error(result.error || 'فشل إنشاء الحساب');
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع');
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrength = () => {
        const password = formData.password;
        if (!password) return { level: 0, text: '', color: '' };

        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { level: 1, text: 'ضعيفة', color: 'bg-destructive' };
        if (score <= 3) return { level: 2, text: 'متوسطة', color: 'bg-warning' };
        return { level: 3, text: 'قوية', color: 'bg-success' };
    };

    const strength = passwordStrength();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 py-10">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg group-hover:shadow-xl transition-shadow">
                            <Search className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-bold text-foreground">مُرشد</h1>
                            <p className="text-sm text-muted-foreground">نظام المفقودات الذكي</p>
                        </div>
                    </Link>
                </div>

                <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
                        <CardDescription>
                            أنشئ حسابك للاستفادة من خدمات نظام مُرشد
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                                    <User className="h-4 w-4 text-primary" />
                                    الاسم الكامل
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="أحمد محمد"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="h-12"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                                    <Mail className="h-4 w-4 text-primary" />
                                    البريد الإلكتروني
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="h-12 text-right"
                                    dir="ltr"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                                    <Phone className="h-4 w-4 text-primary" />
                                    رقم الجوال
                                    <span className="text-xs text-muted-foreground">(اختياري)</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+967 7xxxxxxxx"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="h-12 text-right"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                                    <Lock className="h-4 w-4 text-primary" />
                                    كلمة المرور
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="h-12 pl-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {/* Password Strength */}
                                {formData.password && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-colors ${level <= strength.level ? strength.color : 'bg-muted'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            قوة كلمة المرور: <span className="font-medium">{strength.text}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium">
                                    <Lock className="h-4 w-4 text-primary" />
                                    تأكيد كلمة المرور
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="h-12 pl-12"
                                        required
                                    />
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
                                    )}
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3 pt-2">
                                <Checkbox
                                    id="terms"
                                    checked={acceptTerms}
                                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                                    className="mt-1"
                                />
                                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                                    أوافق على{' '}
                                    <Link to="/terms" className="text-primary hover:underline">
                                        شروط الاستخدام
                                    </Link>
                                    {' '}و{' '}
                                    <Link to="/privacy" className="text-primary hover:underline">
                                        سياسة الخصوصية
                                    </Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="hero"
                                size="xl"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        جاري إنشاء الحساب...
                                    </>
                                ) : (
                                    <>
                                        إنشاء الحساب
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <div className="text-center mt-6">
                            <p className="text-sm text-muted-foreground">
                                لديك حساب بالفعل؟{' '}
                                <Link to="/login" className="text-primary font-medium hover:underline">
                                    سجل دخولك
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowRight className="h-4 w-4" />
                        العودة للصفحة الرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Sparkles, ArrowLeft } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl gradient-hero p-8 md:p-12 lg:p-16 mb-10">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          مدعوم بالذكاء الاصطناعي
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 animate-slide-up">
          اعثر على مفقوداتك
          <span className="text-gradient block mt-2">بسرعة وذكاء</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          نظام متطور يستخدم الذكاء الاصطناعي لمطابقة المفقودات والموجودات تلقائياً، مما يزيد فرصة استعادة ممتلكاتك.
        </p>

        <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link to="/new-report">
            <Button variant="hero" size="xl">
              <Search className="h-5 w-5" />
              أبلغ عن مفقود
            </Button>
          </Link>
          <Link to="/new-report?type=found">
            <Button variant="hero-outline" size="xl">
              <MapPin className="h-5 w-5" />
              أبلغ عن موجود
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span>+1200 بلاغ ناجح</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>نسبة تطابق 34%</span>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="hidden lg:block absolute top-20 left-20 animate-float">
        <div className="w-16 h-16 rounded-2xl gradient-primary shadow-glow flex items-center justify-center">
          <Search className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-20 left-40 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-12 h-12 rounded-xl bg-secondary shadow-lg flex items-center justify-center">
          <MapPin className="h-6 w-6 text-secondary-foreground" />
        </div>
      </div>
    </section>
  );
}

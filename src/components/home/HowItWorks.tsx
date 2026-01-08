import { Card, CardContent } from '@/components/ui/card';
import { FileText, Brain, Bell, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'تقديم البلاغ',
    description: 'أضف تفاصيل العنصر المفقود أو الذي وجدته مع صور ووصف دقيق',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Brain,
    title: 'تحليل الذكاء الاصطناعي',
    description: 'يحلل النظام الصور والنصوص والموقع لإيجاد التطابقات المحتملة',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Bell,
    title: 'إشعار فوري',
    description: 'نرسل إشعاراً عند العثور على تطابق محتمل مع بلاغك',
    color: 'bg-success/10 text-success',
  },
  {
    icon: CheckCircle,
    title: 'استعادة الممتلكات',
    description: 'نسهل التواصل بين الطرفين لاستعادة المفقودات بأمان',
    color: 'bg-warning/10 text-warning',
  },
];

export function HowItWorks() {
  return (
    <section className="mb-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">كيف يعمل النظام؟</h2>
        <p className="text-muted-foreground mt-2">خطوات بسيطة للعثور على مفقوداتك</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card
              key={index}
              variant="elevated"
              className="text-center animate-fade-in relative overflow-hidden"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="pt-8 pb-6">
                {/* Step Number */}
                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {index + 1}
                </div>

                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="h-8 w-8" />
                </div>

                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

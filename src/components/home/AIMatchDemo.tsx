import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Sparkles, Image, FileText, MapPin, ArrowLeftRight, CheckCircle } from 'lucide-react';

export function AIMatchDemo() {
  return (
    <section className="mb-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">The Power of AI</h2>
        <p className="text-muted-foreground mt-2">Multi-Modal Matching System</p>
      </div>

      <Card variant="glow" className="overflow-hidden">
        <CardHeader className="gradient-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Matching Process Example
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Lost Item */}
            <Card className="border-destructive/30">
              <CardContent className="p-4">
                <Badge variant="destructive" className="mb-3">Lost Report</Badge>
                <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=300"
                    alt="Lost"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-sm">iPhone 14 Pro</h4>
                <p className="text-xs text-muted-foreground mt-1">Dark Blue - Riyadh</p>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center animate-pulse-slow">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-center">Analyzing and Matching</p>
            </div>

            {/* Found Item */}
            <Card className="border-success/30">
              <CardContent className="p-4">
                <Badge variant="success" className="mb-3">Found Report</Badge>
                <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300"
                    alt="Found"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-sm">Blue iPhone</h4>
                <p className="text-xs text-muted-foreground mt-1">Found - Riyadh</p>
              </CardContent>
            </Card>
          </div>

          {/* Scores */}
          <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Image className="h-4 w-4 text-primary" />
                <span>Image Similarity</span>
                <span className="mr-auto font-bold">72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span>Text Similarity</span>
                <span className="mr-auto font-bold">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Location Proximity</span>
                <span className="mr-auto font-bold">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </div>

          {/* Final Score */}
          <div className="mt-6 p-4 border-2 border-success/30 rounded-xl bg-success/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="font-bold text-success">Final Match Score</p>
                <p className="text-sm text-muted-foreground">Score calculated: (images × 0.6) + (text × 0.4)</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-success">70%</div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
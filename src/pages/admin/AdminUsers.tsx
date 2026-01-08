import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminUsers() {
    return (
        <Layout>
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-8">إدارة المستخدمين</h1>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-6 w-6" />
                            المستخدمين
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">جاري العمل على هذه الصفحة...</p>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}

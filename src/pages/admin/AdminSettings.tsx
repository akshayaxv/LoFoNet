import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettings() {
    return (
        <Layout>
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-8">Settings</h1>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-6 w-6" />
                            System Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">This page is under construction...</p>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
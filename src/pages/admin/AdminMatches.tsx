import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompare } from "lucide-react";

export default function AdminMatches() {
    return (
        <Layout>
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-8">Manage Matches</h1>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitCompare className="h-6 w-6" />
                            Matches
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
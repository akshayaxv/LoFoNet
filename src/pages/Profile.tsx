import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Phone, Mail, Shield, Save, Loader2, FileSearch } from 'lucide-react';
import { toast } from 'sonner';
import { sql } from '@/lib/db';
import { ReportsList } from '@/components/reports/ReportsList';
import { Report, getUserReports } from '@/services/reportService';

export default function Profile() {
    const { user, login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [userReports, setUserReports] = useState<Report[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);

    // Form State
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setPhone(user.phone || '');
            loadUserReports();
        }
    }, [user]);

    const loadUserReports = async () => {
        if (!user) return;
        setIsLoadingReports(true);
        try {
            const reports = await getUserReports(user.id);
            setUserReports(reports);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setIsLoadingReports(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            // Update data in database
            await sql`
                UPDATE users 
                SET name = ${name}, phone = ${phone}, updated_at = NOW()
                WHERE id = ${user.id}
            `;

            // Update local state
            /* 
               Note: In an ideal scenario, we should have an updateProfile function in AuthContext 
               but we'll update the state by logging in again with the same token for simulation or activating the context
               Here we'll just show success message as the user state may need a refresh
            */

            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('An error occurred while updating data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        // This feature requires verifying the current password in the backend
        toast.info('Password change is not available in this demo version');
    };

    if (!user) return null;

    return (
        <Layout>
            <div className="container max-w-4xl py-6 md:py-10 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p className="text-muted-foreground mt-2">Manage your account and reports</p>
                </div>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="details">My Details</TabsTrigger>
                        <TabsTrigger value="reports">My Reports</TabsTrigger>
                    </TabsList>

                    {/* Profile Details Tab */}
                    <TabsContent value="details" className="pt-6">
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>
                                        Update your personal information and contact details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="pl-10"
                                                    placeholder="Your full name"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    value={user.email}
                                                    disabled
                                                    className="pl-10 bg-muted"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="pl-10"
                                                    placeholder="+1234567890"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Your phone number will be visible to other users when there is a match
                                            </p>
                                        </div>

                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Security</CardTitle>
                                    <CardDescription>
                                        Change your password
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current-password">Current Password</Label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="current-password"
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">New Password</Label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="new-password"
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" variant="outline">
                                            Change Password
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Reports Tab */}
                    <TabsContent value="reports" className="pt-6">
                        {isLoadingReports ? (
                            <div className="text-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                <p className="mt-2 text-muted-foreground">Loading your reports...</p>
                            </div>
                        ) : userReports.length > 0 ? (
                            <ReportsList reports={userReports} />
                        ) : (
                            <div className="text-center py-20 border rounded-lg bg-muted/20">
                                <FileSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">No reports</h3>
                                <p className="text-muted-foreground mb-4">You haven't added any reports yet</p>
                                <Button onClick={() => window.location.href = '/new-report'}>
                                    Add New Report
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}
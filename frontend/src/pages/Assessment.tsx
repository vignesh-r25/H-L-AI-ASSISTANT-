import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminQuizManager from "./admin-dashboard/QuizManager";
import AdminAnnouncements from "./admin-dashboard/Announcements";
import StudentAnalytics from "./admin-dashboard/StudentAnalytics";
import { ShieldCheck, Users, GraduationCap, Bell } from "lucide-react";

export const Assessment = () => {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Assessment Command Center</h1>
                    <p className="text-muted-foreground">Manage students, quizzes, and global notifications.</p>
                </div>
            </div>

            <Tabs defaultValue="students" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="students" className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> Student Management
                    </TabsTrigger>
                    <TabsTrigger value="quizzes" className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Quiz Master
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="w-4 h-4" /> Notification Center
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="pt-6">
                    <StudentAnalytics />
                </TabsContent>

                <TabsContent value="quizzes" className="pt-6">
                    <AdminQuizManager />
                </TabsContent>

                <TabsContent value="notifications" className="pt-6">
                    <AdminAnnouncements />
                </TabsContent>
            </Tabs>
        </div>
    );
};

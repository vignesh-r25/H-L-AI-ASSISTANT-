import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Trophy, Flame, User as UserIcon, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Student {
    id: string;
    display_name: string;
    email: string;
    total_xp: number;
    streak_count: number;
    avatar_url: string;
}

const StudentAnalytics = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [xpAward, setXpAward] = useState(100);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Status log for debugging
    const [statusLog, setStatusLog] = useState<string[]>([]);
    const [currentUserRole, setCurrentUserRole] = useState<string>("loading...");

    useEffect(() => {
        fetchStudents();
        checkUserRole();
    }, []);

    const checkUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            setCurrentUserRole(data?.role || "no-role");
        }
    };

    useEffect(() => {
        if (!isDialogOpen) setStatusLog([]);
    }, [isDialogOpen]);

    const addLog = (msg: string) => setStatusLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const fetchStudents = async () => {
        try {
            // Fetch users with role 'student' or null
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or('role.eq.student,role.is.null');

            if (error) throw error;
            setStudents((data as any[]) || []);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleAwardXP = async () => {
        if (!selectedStudent) return;

        try {
            addLog(`Starting Award Process...`);
            addLog(`Target: ${selectedStudent.display_name} (${selectedStudent.id})`);
            addLog(`Amount: ${xpAward}`);

            // Cast amount to number just in case
            const amount = Number(xpAward);

            console.log("Awarding XP via RPC:", { target_id: selectedStudent.id, amount });

            // Try using the secure RPC function
            const { data, error } = await supabase.rpc('award_xp', {
                target_id: selectedStudent.id,
                amount: amount
            });

            if (error) {
                addLog(`RPC ERROR: ${error.message}`);
                addLog(`Code: ${error.code}`);
                console.error("RPC Error:", error);
                throw new Error(error.message || "Failed to award XP via RPC");
            }

            addLog(`SUCCESS! New XP Data: ${JSON.stringify(data)}`);
            console.log("Award XP Success:", data);

            // Supabase RPC returns JSON, check structure
            const resultData = data as any;
            const newTotalXP = resultData?.new_xp || ((selectedStudent.total_xp || 0) + amount);

            toast.success(`Awarded ${amount} XP to ${selectedStudent.display_name}`);
            setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, total_xp: newTotalXP } : s));

            addLog("Closing dialog in 2s...");
            setTimeout(() => {
                setIsDialogOpen(false);
            }, 2000);

        } catch (error: any) {
            console.error("Critical Error awarding XP:", error);
            addLog(`CRITICAL FAILURE: ${error.message}`);
            toast.error(`Error: ${error.message || "Operation failed"}`);
        }
    };

    const filteredStudents = students.filter(s =>
        (s.display_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (s.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Student Analytics</h1>
                    <p className="text-muted-foreground">Monitor performance and award achievements</p>
                </div>
                <div className="bg-slate-800 text-slate-200 px-3 py-1 rounded-full text-xs font-mono border border-slate-700">
                    Your Role: <span className="text-primary font-bold">{currentUserRole}</span>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Student Registry</CardTitle>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>XP</TableHead>
                                <TableHead>Streak</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={student.avatar_url} />
                                            <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{student.display_name || "Unknown"}</div>
                                            <div className="text-xs text-muted-foreground">{student.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary shadow hover:bg-primary/20">
                                            Active
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 font-mono text-primary">
                                            <Trophy className="w-3 h-3" />
                                            {student.total_xp || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 font-mono text-orange-500">
                                            <Flame className="w-3 h-3" />
                                            {student.streak_count || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedStudent(student);
                                                setIsDialogOpen(true);
                                                setXpAward(100);
                                                setStatusLog([]);
                                            }}
                                        >
                                            <PlusCircle className="w-3 h-3 mr-1" /> Award XP
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Award XP to {selectedStudent?.display_name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label>XP Amount</Label>
                            <Input
                                type="number"
                                value={xpAward}
                                onChange={e => setXpAward(Number(e.target.value))}
                            />
                        </div>

                        {/* Visual Status Log */}
                        <div className="rounded-md border bg-slate-950 p-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-medium text-slate-400">Operation Status</p>
                                <span className="text-[10px] text-slate-600">v1.2 Debug</span>
                            </div>
                            <div className="h-[100px] w-full overflow-y-auto font-mono text-xs text-green-400 space-y-1">
                                {statusLog.length === 0 ? (
                                    <span className="text-slate-600 opacity-50">Waiting for command...</span>
                                ) : (
                                    statusLog.map((log, i) => (
                                        <div key={i} className="border-b border-green-900/30 pb-1 last:border-0 break-words">
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAwardXP} className="w-full">
                            Confirm Award
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentAnalytics;

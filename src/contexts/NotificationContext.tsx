import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SystemNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    link: string;
}

interface NotificationContextType {
    notifications: SystemNotification[];
    dismissNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);

    const addNotification = (title: string, message: string, type: SystemNotification['type'] = 'info', link: string = '/') => {
        const newNotif: SystemNotification = {
            id: crypto.randomUUID(),
            title,
            message,
            type,
            timestamp: new Date(),
            link
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // Keep last 10
    };

    useEffect(() => {
        // 1. Fetch History on Mount
        const fetchHistory = async () => {
            try {
                const [announcementsData, materialsData, quizzesData] = await Promise.all([
                    supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
                    supabase.from('materials').select('*').order('created_at', { ascending: false }).limit(3),
                    supabase.from('quizzes').select('*').order('created_at', { ascending: false }).limit(3),
                ]);

                const history: SystemNotification[] = [];

                // Map Announcements
                if (announcementsData.data) {
                    announcementsData.data.forEach((a: any) => {
                        history.push({
                            id: a.id,
                            title: 'Announcement',
                            message: a.title,
                            type: 'info',
                            timestamp: new Date(a.created_at),
                            link: '/'
                        });
                    });
                }

                // Map Materials
                if (materialsData.data) {
                    materialsData.data.forEach((m: any) => {
                        history.push({
                            id: m.id,
                            title: 'New Material',
                            message: `Uploaded: ${m.title}`,
                            type: 'success',
                            timestamp: new Date(m.created_at),
                            link: '/materials'
                        });
                    });
                }

                // Map Quizzes
                if (quizzesData.data) {
                    quizzesData.data.forEach((q: any) => {
                        history.push({
                            id: q.id,
                            title: 'New Quiz',
                            message: `Available: ${q.title}`,
                            type: 'warning',
                            timestamp: new Date(q.created_at || new Date()),
                            link: '/quizzes'
                        });
                    });
                }

                // Sort by newest first
                history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

                // Keep top 10 recent items
                setNotifications(history.slice(0, 10));

            } catch (error) {
                console.error("Error fetching notification history:", error);
            }
        };

        fetchHistory();

        // 2. Listen for Announcements
        const announcementsChannel = supabase.channel('public:announcements')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    addNotification('New Announcement', payload.new.title, 'info', '/');
                } else if (payload.eventType === 'DELETE') {
                    addNotification('Announcement Removed', 'An announcement was deleted.', 'warning', '/');
                    setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
                }
            })
            .subscribe();

        // 3. Listen for Materials
        const materialsChannel = supabase.channel('public:materials')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    addNotification('New Material', `A document was uploaded: ${payload.new.title}`, 'success', '/materials');
                } else if (payload.eventType === 'DELETE') {
                    addNotification('Material Deleted', 'A document was removed.', 'warning', '/materials');
                    setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
                }
            })
            .subscribe();

        // 4. Listen for Quizzes
        const quizzesChannel = supabase.channel('public:quizzes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'quizzes' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    addNotification('New Quiz', `A new quiz is available: ${payload.new.title}`, 'success', '/quizzes');
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(announcementsChannel);
            supabase.removeChannel(materialsChannel);
            supabase.removeChannel(quizzesChannel);
        };
    }, []);

    const dismissNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, dismissNotification, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};

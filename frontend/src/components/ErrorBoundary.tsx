import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full glass-card p-8 rounded-2xl text-center space-y-6 border border-destructive/20 bg-destructive/5">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
                            <p className="text-muted-foreground text-sm">
                                The application encountered a critical error and could not load.
                            </p>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg text-left overflow-auto max-h-40 text-xs font-mono border border-border">
                            {this.state.error?.message}
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reload Page
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

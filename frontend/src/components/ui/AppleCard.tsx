import { cn } from "@/lib/utils";

interface AppleCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const AppleCard = ({
    children,
    className,
    noPadding = false,
    ...props
}: AppleCardProps) => {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-lg bg-card border border-border/60",
                noPadding ? "" : "p-6",
                className
            )}
            {...props}
        >
            <div className="relative z-10">{children}</div>
        </div>
    );
};

import React, { useEffect, useRef, useMemo } from 'react';

export const EduAnimationList = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resize);
        resize();

        // Neural Network Nodes
        const nodes = Array.from({ length: 40 }).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
        }));

        const drawNodes = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw Tech Grid
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.03)';
            ctx.lineWidth = 1;
            const gridSize = 50;
            for (let x = 0; x < width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Update and draw connections
            ctx.lineWidth = 0.5;
            for (let i = 0; i < nodes.length; i++) {
                const nodeA = nodes[i];
                nodeA.x += nodeA.vx;
                nodeA.y += nodeA.vy;

                // Bounce off edges
                if (nodeA.x < 0 || nodeA.x > width) nodeA.vx *= -1;
                if (nodeA.y < 0 || nodeA.y > height) nodeA.vy *= -1;

                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeB = nodes[j];
                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 200) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 * (1 - distance / 200)})`;
                        ctx.moveTo(nodeA.x, nodeA.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        ctx.stroke();
                    }
                }

                // Draw node
                ctx.beginPath();
                ctx.arc(nodeA.x, nodeA.y, nodeA.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(drawNodes);
        };

        drawNodes();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            <canvas
                ref={canvasRef}
                className="opacity-60"
                style={{ filter: 'blur(0.5px)' }}
            />
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />

            {/* Vignette for cinematic depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
        </div>
    );
};

export const EduAnimation = React.memo(EduAnimationList);

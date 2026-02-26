import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Default empty data showing a flat baseline (0 usage)
const defaultData = [
    { name: 'Mon', xp: 0 },
    { name: 'Tue', xp: 0 },
    { name: 'Wed', xp: 0 },
    { name: 'Thu', xp: 0 },
    { name: 'Fri', xp: 0 },
    { name: 'Sat', xp: 0 },
    { name: 'Sun', xp: 0 },
];

interface ActivityChartProps {
    data?: { name: string; xp: number }[];
}

export const ActivityChart = ({ data = defaultData }: ActivityChartProps) => {
    return (
        <div className="w-full h-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="hsl(var(--border))" opacity={0.2} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#000',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                            boxShadow: 'none'
                        }}
                        itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                        isAnimationActive={false}
                    />
                    <Area
                        type="monotone"
                        dataKey="xp"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={0.1}
                        fill="hsl(var(--primary))"
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

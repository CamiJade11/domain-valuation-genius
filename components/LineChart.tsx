
import React from 'react';

interface DataPoint {
    label: string;
    value: number;
}

interface LineChartProps {
    data: DataPoint[];
    width?: number;
    height?: number;
    color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, width = 300, height = 150, color = "#D2B4DE" }) => {
    if (!data || data.length === 0) {
        return <div style={{ width, height }} className="flex items-center justify-center">No data available</div>;
    }

    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const values = data.map(d => d.value);
    const minValue = Math.min(...values) * 0.95;
    const maxValue = Math.max(...values) * 1.05;

    const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
    const getY = (value: number) => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

    const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`).join(' ');

    const formatYLabel = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
    };
    
    const yAxisLabels = [minValue, minValue + (maxValue-minValue)/2, maxValue];

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-label="Line chart of historical valuation">
            {/* Y Axis Grid Lines & Labels */}
            {yAxisLabels.map((value, i) => (
                <g key={`y-axis-${i}`}>
                    <line
                        x1={padding.left}
                        y1={getY(value)}
                        x2={width - padding.right}
                        y2={getY(value)}
                        stroke="#e5e7eb"
                        className="dark:stroke-gray-700"
                        strokeDasharray="2,2"
                    />
                    <text
                        x={padding.left - 8}
                        y={getY(value) + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#6b7280"
                        className="dark:fill-gray-400"
                    >
                        ${formatYLabel(value)}
                    </text>
                </g>
            ))}

            {/* X Axis Labels */}
             {data.map((d, i) => {
                // Show first, last, and some in between
                const shouldShow = i % 3 === 0 || i === data.length - 1;
                if (shouldShow) {
                    return (
                        <text
                            key={`x-label-${i}`}
                            x={getX(i)}
                            y={height - padding.bottom + 15}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#6b7280"
                            className="dark:fill-gray-400"
                        >
                            {d.label}
                        </text>
                    );
                }
                return null;
            })}

            {/* Line Path */}
            <path d={path} fill="none" stroke={color} strokeWidth="2" />

            {/* Data Points */}
            {data.map((d, i) => (
                <circle key={i} cx={getX(i)} cy={getY(d.value)} r="3" fill={color} />
            ))}
        </svg>
    );
};

export default LineChart;

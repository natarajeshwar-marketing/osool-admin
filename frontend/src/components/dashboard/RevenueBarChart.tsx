import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
                label: function (context: any) {
                    return 'SAR ' + context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
            }
        },
        datalabels: {
            color: 'white',
            font: {
                weight: 'bold' as const,
                size: 12
            },
            formatter: (value: any) => {
                if (value > 0) {
                    if (value >= 1000) {
                        return 'SAR ' + (value / 1000).toFixed(1) + 'k';
                    }
                    return 'SAR ' + value.toLocaleString(undefined, { maximumFractionDigits: 0 });
                }
                return '';
            },
            anchor: 'center' as const,
            align: 'center' as const,
        }
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#888888',
                font: {
                    size: 12
                }
            },
            border: {
                display: false
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                display: false,
            },
            ticks: {
                color: '#888888',
                font: {
                    size: 12
                },
                callback: function (value: any) {
                    if (value >= 1000) {
                        return 'SAR ' + (value / 1000).toFixed(1) + 'k';
                    }
                    return 'SAR ' + value;
                }
            },
            border: {
                display: false
            }
        },
    },
    barPercentage: 0.6,
    categoryPercentage: 0.8,
};

interface RevenueBarChartProps {
    data: {
        cleaning: number;
        maintenance: number;
        carWash: number;
        pestControl: number;
    }
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
    const labels = ['Cleaning', 'Maintenance', 'Pest Control'];
    
    const chartData = {
        labels,
        datasets: [
            {
                label: 'Revenue',
                data: [data.cleaning || 0, data.maintenance || 0, data.pestControl || 0],
                backgroundColor: [
                    '#2563eb', // Blue-600
                    '#d97706', // Amber-600
                    '#059669', // Emerald-600
                ],
                borderRadius: 4,
            },
        ],
    };

    return (
        <Card className="col-span-4 lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue by Service</CardTitle>
                <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                    <ArrowUpRight className="h-4 w-4 text-neutral-500" />
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <div className='h-[300px] w-full'>
                    <Bar options={options} data={chartData} />
                </div>
            </CardContent>
        </Card>
    )
}

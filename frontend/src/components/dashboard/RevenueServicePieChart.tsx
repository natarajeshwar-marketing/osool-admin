import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart } from "lucide-react"

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface RevenueServicePieChartProps {
    data: {
        cleaning: number;
        maintenance: number;
        carWash: number;
        pestControl: number;
    }
}

export function RevenueServicePieChart({ data }: RevenueServicePieChartProps) {
    const labels = ['Cleaning', 'Maintenance', 'Pest Control'];
    
    const revenueData = [
        data.cleaning || 0,
        data.maintenance || 0,
        data.pestControl || 0
    ];
    
    const totalRevenue = revenueData.reduce((a, b) => a + b, 0);

    const chartData = {
        labels,
        datasets: [
            {
                data: revenueData,
                backgroundColor: [
                    '#2563eb', // Blue-600
                    '#d97706', // Amber-600
                    '#059669', // Emerald-600
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 6
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const percentage = totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0;
                        
                        return [
                            `${label}: ${percentage}% of Total Revenue`,
                            `Revenue: SAR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        ];
                    }
                }
            },
            datalabels: {
                color: 'white',
                font: {
                    weight: 'bold' as const,
                    size: 16
                },
                formatter: (value: any) => {
                    if (totalRevenue === 0) return '';
                    const percentage = Math.round((value / totalRevenue) * 100);
                    return percentage > 0 ? percentage + '%' : '';
                },
                anchor: 'center' as const,
                align: 'center' as const,
            }
        },
    };

    return (
        <Card className="col-span-4 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue percentage per services</CardTitle>
                <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                    <PieChart className="h-4 w-4 text-neutral-500" />
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <div className='h-[300px] w-full flex items-center justify-center'>
                    {totalRevenue > 0 ? (
                        <Pie data={chartData} options={options} />
                    ) : (
                        <div className="text-muted-foreground text-sm">No revenue data for this period</div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

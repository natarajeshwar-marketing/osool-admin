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

interface BuildingUtilizationPieChartProps {
    data?: any[]
}

export function BuildingUtilizationPieChart({ data: propData }: BuildingUtilizationPieChartProps) {
    const labels = propData?.map(d => d.buildingName) || []
    // Use workedHours for the pie slices (Share of Work)
    const workedHoursData = propData?.map(d => d.workedHours !== undefined ? parseFloat(d.workedHours) : 0) || []
    const totalWorked = workedHoursData.reduce((a, b) => a + b, 0);

    const chartData = {
        labels,
        datasets: [
            {
                data: workedHoursData,
                backgroundColor: [
                    '#3b82f6', // blue-500
                    '#ef4444', // red-500
                    '#22c55e', // green-500
                    '#eab308', // yellow-500
                    '#a855f7', // purple-500
                    '#f97316', // orange-500
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
                        const percentage = totalWorked > 0 ? Math.round((value / totalWorked) * 100) : 0;
                        const dataIndex = context.dataIndex;
                        const utilizationRate = propData && propData[dataIndex]?.utilizationRate
                            ? propData[dataIndex].utilizationRate
                            : 0;

                        return [
                            `${label}: ${percentage}% of Total Work`,
                            `Worked Hours: ${value}`,
                            `Utilization Rate: ${utilizationRate}%`
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
                    if (totalWorked === 0) return '';
                    const percentage = Math.round((value / totalWorked) * 100);
                    return percentage > 0 ? percentage + '%' : '';
                },
                anchor: 'center' as const,
                align: 'center' as const,
            }
        },
    };

    return (
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Utilization percentage per building</CardTitle>
                <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                    <PieChart className="h-4 w-4 text-neutral-500" />
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <div className='h-[300px] w-full flex items-center justify-center'>
                    {propData && propData.some(d => parseInt(d.activeCrewCount) > 0) ? (
                        <Pie data={chartData} options={options} />
                    ) : (
                        <div className="text-muted-foreground text-sm">No active crews in this period</div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

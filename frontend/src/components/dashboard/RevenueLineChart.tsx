import { useState, useEffect } from "react"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp } from "lucide-react"
import { apiClient } from "@/lib/api"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export function RevenueLineChart() {
    const [year, setYear] = useState<string>(new Date().getFullYear().toString())
    const [revenueData, setRevenueData] = useState<number[]>(Array(12).fill(0))

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const res = await apiClient(`/daily-logs/revenue?year=${year}`)
                if (!res.ok) throw new Error('Failed to fetch revenue')
                const data = await res.json()
                setRevenueData(data.monthlyRevenue)
            } catch (err) {
                console.error("Failed to fetch revenue stats", err)
            }
        }

        fetchRevenue()
    }, [year])

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Revenue',
                data: revenueData, // Data from backend
                borderColor: '#0ea5e9', // Sky-500
                backgroundColor: 'rgba(14, 165, 233, 0.1)', // Sky-500 with opacity
                borderWidth: 2,
                tension: 0.4, // Smooth curve
                fill: true,
                pointBackgroundColor: '#0ea5e9',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#0ea5e9',
            },
        ],
    };

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
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += 'SAR ' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#888888',
                },
                border: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    borderDash: [5, 5],
                },
                ticks: {
                    color: '#888888',
                    callback: function (value: any) {
                        if (value >= 1000) {
                            return 'SAR ' + value / 1000 + 'k';
                        }
                        return 'SAR ' + value;
                    }
                },
                border: {
                    display: false
                },
                beginAtZero: true
            },
        },
    };

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium">Revenue Trends</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Monthly revenue performance for {year}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[100px] h-8">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center dark:bg-neutral-800">
                        <TrendingUp className="h-4 w-4 text-neutral-500" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <Line options={options} data={chartData} />
                </div>
            </CardContent>
        </Card>
    )
}

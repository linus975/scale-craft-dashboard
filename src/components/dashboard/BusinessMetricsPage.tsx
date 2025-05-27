
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Euro, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  Calculator,
  ArrowLeft
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface BusinessMetricsPageProps {
  onBack: () => void;
}

const BusinessMetricsPage: React.FC<BusinessMetricsPageProps> = ({ onBack }) => {
  // Mock financial data
  const monthlyData = [
    { month: 'Jan', revenue: 28500, costs: 18200, profit: 10300 },
    { month: 'Feb', revenue: 31200, costs: 19800, profit: 11400 },
    { month: 'Mar', revenue: 29800, costs: 17900, profit: 11900 },
    { month: 'Apr', revenue: 35600, costs: 21200, profit: 14400 },
    { month: 'May', revenue: 38900, costs: 22800, profit: 16100 },
    { month: 'Jun', revenue: 42300, costs: 24100, profit: 18200 }
  ];

  const costBreakdown = [
    { category: 'Materials', amount: 8500, percentage: 35.3 },
    { category: 'Energy', amount: 3200, percentage: 13.3 },
    { category: 'Maintenance', amount: 2800, percentage: 11.6 },
    { category: 'Labor', amount: 6200, percentage: 25.7 },
    { category: 'Shipping', amount: 1800, percentage: 7.5 },
    { category: 'Other', amount: 1600, percentage: 6.6 }
  ];

  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const revenueGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100);
  const profitMargin = (currentMonth.profit / currentMonth.revenue * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Business Metrics</h2>
          <p className="text-slate-600">Financial overview and cost analysis</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">€{currentMonth.revenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs">
              {revenueGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Operating Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">€{currentMonth.costs.toLocaleString()}</div>
            <p className="text-xs text-slate-500">{(currentMonth.costs / currentMonth.revenue * 100).toFixed(1)}% of revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">€{currentMonth.profit.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Profit margin: {profitMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Break-even Point
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">18.2</div>
            <p className="text-xs text-slate-500">days per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Trend */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle>Revenue & Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Revenue", color: "#3b82f6" },
                profit: { label: "Profit", color: "#10b981" }
              }}
              className="h-[300px]"
            >
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle>Cost Breakdown (June)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: { label: "Amount", color: "#ef4444" }
              }}
              className="h-[300px]"
            >
              <BarChart data={costBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="#ef4444" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cost Details */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle>Detailed Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {costBreakdown.map((cost) => (
              <div key={cost.category} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-slate-900">{cost.category}</h4>
                  <Badge variant="secondary">{cost.percentage}%</Badge>
                </div>
                <p className="text-2xl font-bold text-slate-900">€{cost.amount.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Monthly total</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Optimize Material Costs</h4>
            <p className="text-sm text-green-700">Consider bulk purchasing agreements to reduce material costs by 8-12%</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Energy Efficiency</h4>
            <p className="text-sm text-blue-700">Implement smart scheduling to reduce energy costs during peak hours</p>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Capacity Utilization</h4>
            <p className="text-sm text-yellow-700">Increase printer utilization during off-peak hours to maximize revenue</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessMetricsPage;

import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';

const sizing = {
  margin: { right: 5 },
  width: 200,
  height: 200,
  hideLegend: true,
};

export default function PieChartWithCustomizedLabel({ data }) {
    if (!data || data.length === 0) {
        return (
            <div style={{
                width: 200,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888'
            }}>
                No data
            </div>
        );
    }

    // Getting the total
    const total = data.map((item) => item.value).reduce((a, b) => a + b, 0);

    const getArcLabel = (params) => {
        const percent = params.value / total;
        if (percent < 0.05) {
            return '';
        }
        return `${(percent * 100).toFixed(0)}%`;
    };

    // Legend
    const sortedLegendData = data.map(item => ({
        label: item.label,
        value: item.value,
        percentage: total > 0 ? (item.value / total) * 100 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage); // Sorting

    return (
        <div style={{ width: sizing.width }}>
            <h1>Spending</h1>
            <PieChart
                series={[
                {
                    outerRadius: 80,
                    data,
                    arcLabel: getArcLabel,
                },
                ]}
                sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                        fill: 'white',
                        fontSize: 14,
                    },
                }}
                {...sizing}
            />
            {/* Legend */}
                <div className="chart-legend" style={{ marginTop: '16px' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {sortedLegendData.map(item => (
                        <li 
                            key={item.label} 
                            style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                marginBottom: '4px',
                                fontSize: '14px'
                            }}
                        >
                            <span>{item.label}</span>
                            <span style={{ fontWeight: 'bold' }}>
                                {item.percentage.toFixed(0)}%
                            </span>
                        </li>
                    ))}
                    </ul>
                </div>
        </div>
    );
}
import React from "react";
import Chart from "react-apexcharts";
import { Typography, Card, Row, Col } from "antd";

const { Title } = Typography;

const StatsCharts = ({ barChartSeries = [], lineChartSeries = [], categories = [] }) => {
  // Configurazioni per il barChart
  const barChartOptions = {
    chart: { type: "bar" },
    xaxis: {
      categories: categories.length ? categories : (barChartSeries[0]?.data.map(() => "") || []),
      labels: {
        style: {
          colors: "var(--text-color)",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "var(--text-color)",
        },
      },
    },
    colors: ["#FF4560"],
  };

  // Configurazioni per il lineChart
  const lineChartOptions = {
    chart: { type: "line" },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "var(--text-color)",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "var(--text-color)",
        },
      },
    },
    colors: ["#00E396", "#FF4560"],
  };

  // Valori di fallback per barChartSeries e lineChartSeries
  const barChartFallback = [
    {
      name: "Spesa (€)",
      data: [],
    },
  ];
  const lineChartFallback = [
    { name: "Entrate", data: [] },
    { name: "Uscite", data: [] },
  ];

  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Card title={<Title level={4}>Categorie Principali di Spesa</Title>}>
          <Chart
            options={barChartOptions}
            series={barChartSeries.length && barChartSeries[0].data.length ? barChartSeries : barChartFallback}
            type="bar"
            width="100%"
          />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title={<Title level={4}>Tendenze Entrate e Uscite nel Tempo</Title>}>
          <Chart
            options={lineChartOptions}
            series={lineChartSeries.length && lineChartSeries[0].data.length ? lineChartSeries : lineChartFallback}
            type="line"
            width="100%"
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatsCharts;

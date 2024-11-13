import React from "react";
import Chart from "react-apexcharts";
import { Typography, Card, Row, Col } from "antd";

const { Title } = Typography;

const StatsCharts = ({
  barChartSeries = [],
  lineChartSeries = [],
  categories = [],
  theme,
}) => {
  // Colori basati sul tema per barre e linee
  const barColors = theme === "dark" ? ["#FF4560"] : ["#FF6347"];
  const lineColors = theme === "dark" ? ["#00E396", "#FF4560"] : ["#1E90FF", "#FF6347"];

  // Configurazioni per il barChart
  const barChartOptions = {
    chart: { type: "bar" },
    xaxis: {
      categories: categories.length
        ? categories
        : barChartSeries[0]?.data.map(() => "") || [],
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
    colors: barColors, // Colori per le barre
    tooltip: {
      theme: theme === "dark" ? "dark" : "light", // Cambia tema tooltip in base al tema corrente
    },
    legend: {
      labels: {
        colors: theme === "dark" ? "#e0e0e0" : "#333333", // Colore del testo della legenda in base al tema
      },
    },
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
    colors: lineColors, // Colori per le linee
    tooltip: {
      theme: theme === "dark" ? "dark" : "light", // Cambia tema tooltip in base al tema corrente
    },
    legend: {
      labels: {
        colors: theme === "dark" ? "#e0e0e0" : "#333333", // Colore del testo della legenda in base al tema
      },
    },
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
        <Card title={<Title level={4}>Categorie principali di spesa</Title>}>
          <Chart
            options={barChartOptions}
            series={
              barChartSeries.length && barChartSeries[0].data.length
                ? barChartSeries
                : barChartFallback
            }
            type="bar"
            width="100%"
          />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card
          title={<Title level={4}>Tendenza entrate e uscite nel tempo</Title>}
        >
          <Chart
            options={lineChartOptions}
            series={
              lineChartSeries.length && lineChartSeries[0].data.length
                ? lineChartSeries
                : lineChartFallback
            }
            type="line"
            width="100%"
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatsCharts;

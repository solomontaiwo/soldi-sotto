import React from "react";
import Chart from "react-apexcharts";
import { Typography, Card, Row, Col } from "antd";
import { useMediaQuery } from "react-responsive";

const { Title } = Typography;

const StatsCharts = ({
  barChartSeries = [],
  lineChartSeries = [],
  categories = [],
  theme,
}) => {
  // Determina se si sta visualizzando il layout mobile
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Colori basati sul tema per barre e linee
  const barColors = theme === "dark" ? ["#FF4560"] : ["#FF6347"];
  const lineColors =
    theme === "dark" ? ["#00E396", "#FF4560"] : ["#1E90FF", "#FF6347"];

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
        formatter: (value) => value.toFixed(2), // Limita a due decimali sull'asse y
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => value.toFixed(2), // Limita a due decimali per i valori interni alle barre
      style: {
        colors: ["var(--text-color)"], // Colore del testo dei dati
      },
    },
    colors: barColors,
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      y: {
        formatter: (value) => value.toFixed(2), // Limita a due decimali nei tooltip
      },
    },
    legend: {
      labels: {
        colors: theme === "dark" ? "#e0e0e0" : "#333333",
      },
    },
  };

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
        formatter: (value) => value.toFixed(2), // Limita a due decimali
      },
    },
    colors: lineColors,
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      y: {
        formatter: (value) => value.toFixed(2), // Limita a due decimali nei tooltip
      },
    },
    legend: {
      labels: {
        colors: theme === "dark" ? "#e0e0e0" : "#333333",
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
    <Row gutter={[16, isMobile ? 16 : 0]}>
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
      <Col xs={24} md={12} style={isMobile ? { marginTop: 16 } : {}}>
        <Card title={<Title level={4}>Tendenza entrate/uscite</Title>}>
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

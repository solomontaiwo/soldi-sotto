import React from "react";
import Chart from "react-apexcharts";

const CashFlowChart = ({ data }) => {
  const options = {
    chart: {
      type: "line",
      height: 350,
    },
    xaxis: {
      categories: data.map((item) => item.date),
    },
    title: {
      text: "Andamento Cash Flow",
      align: "left",
    },
  };

  const series = [
    {
      name: "Cash Flow",
      data: data.map((item) => item.cashFlow),
    },
  ];

  return (
    <div className="chart-container">
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default CashFlowChart;

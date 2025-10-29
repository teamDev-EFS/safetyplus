// src/lib/highchartsTheme.ts
import Highcharts from "highcharts";

export const applyGreenTheme = () => {
  Highcharts.setOptions({
    colors: ["#10b981", "#22c55e", "#16a34a", "#059669", "#34d399"],
    chart: {
      backgroundColor: "transparent",
      style: { fontFamily: "Inter, ui-sans-serif, system-ui" },
    },
    title: { style: { color: "#0f172a", fontWeight: "600" } },
    xAxis: { lineColor: "#e5e7eb", labels: { style: { color: "#475569" } } },
    yAxis: {
      gridLineColor: "#e5e7eb",
      labels: { style: { color: "#475569" } },
    },
    legend: { itemStyle: { color: "#334155" } },
    tooltip: { borderColor: "#10b981" },
  });
};

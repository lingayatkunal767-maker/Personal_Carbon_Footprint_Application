import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrendChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Carbon Emission (kg CO₂)",
        data: [40, 35, 50, 30, 45],
        borderColor: "green",
        backgroundColor: "rgba(0, 128, 0, 0.3)"
      }
    ]
  };

  return <Line data={data} />;
};

export default TrendChart;
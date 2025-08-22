import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// PND logo colors
const PND_COLORS = {
  blue: '#003366', // Africa shape
  yellow: '#FFD600', // Chad
  red: '#E30613', // Arrow
  white: '#FFFFFF',
  darkBlue: '#002147', // For contrast
  text: '#003366',
};

export default function PNDChart({ labels, data, title }: { labels: string[]; data: number[]; title?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: title || 'Statistiques',
              data,
              backgroundColor: [PND_COLORS.blue, PND_COLORS.yellow, PND_COLORS.red, PND_COLORS.darkBlue],
              borderColor: PND_COLORS.blue,
              borderWidth: 2,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: !!title, text: title, color: PND_COLORS.text, font: { size: 18 } },
          },
          scales: {
            x: {
              grid: { color: PND_COLORS.white },
              ticks: { color: PND_COLORS.text },
            },
            y: {
              grid: { color: PND_COLORS.white },
              ticks: { color: PND_COLORS.text },
            },
          },
        }}
      />
    </div>
  );
}

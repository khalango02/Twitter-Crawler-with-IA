import { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin);

const intervals = {
  "1s": { label: "Últimos segundos", refreshRate: 30000, days: 30, interval: "minutely" }, 
  "1m": { label: "Últimos minutos (1 hora)", refreshRate: null, days: 0.041, interval: "minutely" },
  "1h": { label: "Últimas horas (24 horas)", refreshRate: null, days: 1, interval: "hourly" },
};

export default function BitcoinChart() {
  const [intervalType, setIntervalType] = useState("1s");
  const [labels, setLabels] = useState([]);
  const [prices, setPrices] = useState([]);
  const [color, setColor] = useState("#f7931a");
  const lastPriceRef = useRef(null);
  const timerRef = useRef(null);

  // Controla se já carregou o histórico (para evitar carregar duas vezes)
  const historicalLoaded = useRef(false);

  // Formata label de tempo de acordo com intervalo
  const formatLabel = (timestamp, interval) => {
    const date = new Date(timestamp);
    if (interval === "minutely") {
      return date.toLocaleTimeString();
    } else if (interval === "hourly") {
      return date.toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    }
    return date.toLocaleDateString();
  };

  // Busca dados históricos
  const fetchHistoricalData = async (days, interval) => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`
      );
      const data = await res.json();
      const newLabels = data.prices.map((p) => formatLabel(p[0], interval));
      const newPrices = data.prices.map((p) => p[1]);

      setLabels(newLabels);
      setPrices(newPrices);

      if (newPrices.length > 1) {
        setColor(newPrices[newPrices.length - 1] > newPrices[newPrices.length - 2] ? "#00ff88" : "#ff4d4d");
        lastPriceRef.current = newPrices[newPrices.length - 1];
      }

      historicalLoaded.current = true; // marcou que carregou o histórico
    } catch (err) {
      console.error("Erro ao buscar dados históricos", err);
    }
  };

  // Busca preço atual e adiciona ao gráfico mantendo histórico
  const fetchCurrentPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      const data = await res.json();
      const price = data.bitcoin.usd;
      const time = new Date().toLocaleTimeString();

      setLabels((prev) => {
        const newLabels = [...prev, time];
        return newLabels.length > 500 ? newLabels.slice(newLabels.length - 500) : newLabels;
      });

      setPrices((prev) => {
        const newPrices = [...prev, price];
        return newPrices.length > 500 ? newPrices.slice(newPrices.length - 500) : newPrices;
      });

      if (lastPriceRef.current !== null) {
        setColor(price > lastPriceRef.current ? "#00ff88" : "#ff4d4d");
      }
      lastPriceRef.current = price;
    } catch (err) {
      console.error("Erro ao buscar preço atual", err);
    }
  };

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const { refreshRate, days, interval } = intervals[intervalType];

    if (intervalType === "1s") {
      // Carrega o histórico só se ainda não carregou
      if (!historicalLoaded.current) {
        fetchHistoricalData(days, interval).then(() => {
          // Depois do histórico carregado, inicia timer para dados em tempo real
          timerRef.current = setInterval(fetchCurrentPrice, refreshRate);
        });
      } else {
        // Se histórico já carregado, só inicia o timer
        timerRef.current = setInterval(fetchCurrentPrice, refreshRate);
      }
    } else {
      historicalLoaded.current = false; // para que mude o intervalo e recarregue histórico
      fetchHistoricalData(days, interval);
    }

    return () => clearInterval(timerRef.current);
  }, [intervalType]);

  const data = {
    labels,
    datasets: [
      {
        label: "Preço do Bitcoin (USD)",
        data: prices,
        fill: false,
        borderColor: color,
        backgroundColor: color,
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: "nearest", axis: "x", intersect: false },
    plugins: {
      zoom: {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
        pan: { enabled: true, mode: "x" },
      },
      legend: { labels: { color: "white" } },
    },
    scales: {
      x: {
        ticks: { color: "white", maxRotation: 45, minRotation: 45, maxTicksLimit: 10 },
        grid: { color: "#444" },
      },
      y: {
        ticks: {
          color: "white",
          callback: (value) => `$${value.toFixed(2)}`,
        },
        grid: { color: "#444" },
      },
    },
  };

  return (
    <div className="p-4 h-full flex flex-col bg-[#161b22] rounded-lg shadow-lg">
      <h2 className="text-white text-xl mb-4 font-semibold">Bitcoin em tempo real</h2>

      <select
        className="bg-[#0d1117] text-white rounded px-3 py-2 mb-4 w-full max-w-xs"
        value={intervalType}
        onChange={(e) => setIntervalType(e.target.value)}
      >
        {Object.entries(intervals).map(([key, val]) => (
          <option key={key} value={key}>
            {val.label}
          </option>
        ))}
      </select>

      <div className="flex-grow">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

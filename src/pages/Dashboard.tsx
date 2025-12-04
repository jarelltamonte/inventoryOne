import {
  IonContent,
  IonPage,
} from "@ionic/react";

import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarController,
  ChartOptions
} from "chart.js";       // ⬅️ ChartOptions is now included

import { Bar } from "react-chartjs-2";

import "./Dashboard.css";

// Register Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarController
);

interface Item {
  id: string;
  model: string;
  price: number;
  quantity: number;
  year?: number;
}

const Dashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, "items"));
      const loaded: Item[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          model: data.model,
          price: Number(data.price),
          quantity: Number(data.quantity),
          year: data.year ? Number(data.year) : undefined
        };
      });
      setItems(loaded);
    } catch (err) {
      console.error("Error loading items for dashboard:", err);
    }
  };

  // Labels and data arrays
  const labels = items.map(item => item.model);
  const priceArr = items.map(item => item.price);
  const quantityArr = items.map(item => item.quantity);
  const priceXquantityArr = items.map(item => item.price * item.quantity);

  // Chart Data
  const dataPriceXQty = {
    labels,
    datasets: [
      {
        label: "Price × Quantity",
        data: priceXquantityArr,
        backgroundColor: "rgba(45, 211, 111, 1)"
      }
    ]
  };

  const dataPrice = {
    labels,
    datasets: [
      {
        label: "Price",
        data: priceArr,
        backgroundColor: "rgba(0, 84, 233, 1)"
      }
    ]
  };

  const dataQuantity = {
    labels,
    datasets: [
      {
        label: "Quantity",
        data: quantityArr,
        backgroundColor: "rgba(0, 84, 233, 1)"
      }
    ]
  };

  // ⭐ FIXED: Chart options now typed correctly
  const verticalOptions: ChartOptions<"bar"> = {
    indexAxis: "x",
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true }
    }
  };

  const horizontalOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true }
    },
    scales: {
      x: { beginAtZero: true }
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="dashboard-content">

        <div className="chart-box first-chart">
          <h2 className="chart-title">Market Value</h2>
          <Bar data={dataPriceXQty} options={verticalOptions} />
        </div>

        <div className="two-charts-row">
          <div className="chart-box half">
            <h2 className="chart-title">Price</h2>
            <Bar data={dataPrice} options={horizontalOptions} />
          </div>

          <div className="chart-box half">
            <h2 className="chart-title">Quantity</h2>
            <Bar data={dataQuantity} options={horizontalOptions} />
          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Dashboard;

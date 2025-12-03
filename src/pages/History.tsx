import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  useIonViewWillEnter, // 1. Import this hook
} from "@ionic/react";
import { useState } from "react"; // Removed useEffect, not needed here anymore
import { db } from "../firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const History: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  // 2. Replace useEffect with useIonViewWillEnter
  useIonViewWillEnter(() => {
    loadHistory();
  });

  const loadHistory = async () => {
    try {
      const q = query(
        collection(db, "history"),
        orderBy("timestamp", "desc") // Sorts by newest first
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => {
        const log = doc.data();

        return {
          id: doc.id,
          action: log.action,
          model: log.model,
          // Excellent fallback check here for the timestamp
          timestamp: log.timestamp?.toDate
            ? log.timestamp.toDate()
            : new Date(log.timestamp), 
        };
      });

      setLogs(data);
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>History</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonList>
          {logs.length === 0 && (
            <IonItem>
              <IonLabel>No history yet.</IonLabel>
            </IonItem>
          )}

          {logs.map((log) => (
            <IonItem key={log.id}>
              <IonLabel>
                <h2>{log.model}</h2>
                <p>
                  {/* Good use of uppercase for readability */}
                  {log.action.toUpperCase()} ·{" "}
                  {log.timestamp.toLocaleDateString()}{" "}
                  {log.timestamp.toLocaleTimeString()}
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default History;
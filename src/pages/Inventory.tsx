import {
  IonContent,
  IonPage,
  IonIcon,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  useIonAlert,
  useIonToast,
  IonSearchbar,
} from "@ionic/react";
import { add, createOutline, trash } from "ionicons/icons";
import { useState, useEffect } from "react";
import "./Inventory.css";

import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

type InventoryItem = {
  id: string;
  model: string;
  year: number;
  quantity: number;
  price: number;
};

const Inventory: React.FC = () => {
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (searchText.trim() === "") {
      loadItems();
    } else {
      searchItems(searchText);
    }
  }, [searchText]);

  const loadItems = async () => {
    const querySnapshot = await getDocs(collection(db, "items"));
    const loadedItems = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<InventoryItem, "id">),
    }));

    setItems(loadedItems);
  };

  const searchItems = async (text: string) => {
    const term = text.toLowerCase();

    const qModel = query(
      collection(db, "items"),
      where("model", ">=", text),
      where("model", "<=", text + "\uf8ff")
    );

    const querySnapshot = await getDocs(qModel);

    let results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<InventoryItem, "id">),
    }));

    results = results.filter(
      (item) =>
        item.model.toLowerCase().includes(term) ||
        item.year.toString().includes(term) ||
        item.quantity.toString().includes(term) ||
        item.price.toString().includes(term)
    );

    setItems(results);
  };

  const logHistory = async (action: string, modelName: string) => {
    try {
      await addDoc(collection(db, "history"), {
        action,
        model: modelName,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error logging history:", error);
    }
  };

  const openAddItemAlert = () => {
    presentAlert({
      header: "Add Inventory Item",
      inputs: [
        { name: "model", type: "text", placeholder: "Model Name" },
        { name: "quantity", type: "number", placeholder: "Quantity" },
        { name: "price", type: "number", placeholder: "Price" },
        { name: "year", type: "number", placeholder: "Year Released" },
      ],
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Add",
          handler: async (data) => {
            if (!data.model || !data.quantity || !data.price || !data.year) {
              presentToast({
                message: "Please fill in all fields.",
                duration: 1500,
                color: "danger",
                position: "top",
              });
              return false;
            }

            const newItem = {
              model: data.model,
              quantity: Number(data.quantity),
              price: Number(data.price),
              year: Number(data.year),
            };

            const docRef = await addDoc(collection(db, "items"), newItem);

            setItems((prev) => [...prev, { id: docRef.id, ...newItem }]);
            await logHistory("Added", data.model);

            presentToast({
              message: "Item added successfully!",
              duration: 1500,
              color: "success",
              position: "top",
            });

            return true;
          },
        },
      ],
    });
  };

  const openEditItemAlert = (item: InventoryItem, index: number) => {
    presentAlert({
      header: "Edit Item",
      inputs: [
        { name: "model", type: "text", value: item.model },
        { name: "quantity", type: "number", value: item.quantity },
        { name: "price", type: "number", value: item.price },
        { name: "year", type: "number", value: item.year },
      ],
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Save",
          handler: async (newData) => {
            if (
              !newData.model ||
              !newData.quantity ||
              !newData.price ||
              !newData.year
            ) {
              presentToast({
                message: "All fields are required.",
                duration: 1500,
                color: "danger",
                position: "top",
              });
              return false;
            }

            const updatedItem = {
              model: newData.model,
              quantity: Number(newData.quantity),
              price: Number(newData.price),
              year: Number(newData.year),
            };

            const itemId = items[index].id;
            const ref = doc(db, "items", itemId);

            await updateDoc(ref, updatedItem);

            const updated = [...items];
            updated[index] = { id: itemId, ...updatedItem };
            setItems(updated);

            await logHistory("Edited", newData.model);

            presentToast({
              message: "Item updated!",
              duration: 1500,
              color: "success",
              position: "top",
            });

            return true;
          },
        },
      ],
    });
  };

  const deleteItem = (item: InventoryItem, index: number) => {
    presentAlert({
      header: "Delete Item?",
      message: `Are you sure you want to delete "${item.model}"?`,
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete",
          role: "destructive",
          handler: async () => {
            await deleteDoc(doc(db, "items", item.id));

            setItems((prev) => prev.filter((_, i) => i !== index));
            await logHistory("Deleted", item.model);

            presentToast({
              message: "Item deleted",
              duration: 1500,
              color: "danger",
              position: "top",
            });
          },
        },
      ],
    });
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonButton
          className="add-icon"
          shape="round"
          fill="solid"
          expand="full"
          color="primary"
          onClick={openAddItemAlert}
        >
          <IonIcon slot="icon-only" icon={add} />
        </IonButton>

        <div className="inventoryOne">
          <p className="title">Inventory One</p>
          <p className="subtitle">Your inventory bestfriend</p>
        </div>

        <div className="card-container">
          <IonSearchbar
            placeholder="Search items"
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
          />

          {items.map((item, index) => (
            <IonCard key={item.id} className="card-item">
              <div className="edit-button">
                <IonButton
                  size="small"
                  color="warning"
                  onClick={() => openEditItemAlert(item, index)}
                >
                  <IonIcon icon={createOutline} slot="start" />
                </IonButton>
              </div>

              <IonCardHeader>
                <IonCardSubtitle>{item.year}</IonCardSubtitle>
                <IonCardTitle>{item.model}</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <p>
                  Qty:<strong> {item.quantity} units</strong>
                  {item.quantity < 20 && (
                    <span
                      style={{
                        color: "red",
                        marginLeft: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      ⚠️ Low in stock
                    </span>
                  )}
                </p>
                <p>₱{item.price} per item</p>

                <IonButton
                  size="small"
                  color="danger"
                  expand="block"
                  onClick={() => deleteItem(item, index)}
                >
                  <IonIcon icon={trash} slot="start" />
                  DELETE
                </IonButton>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Inventory;

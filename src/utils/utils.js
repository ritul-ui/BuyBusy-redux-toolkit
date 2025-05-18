import data from "./data";
import {
  doc,
  writeBatch,
  query,
  where,
  getDocs,
  collection,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";


// Add data to the products collection only for one time so that they can be used again.
const addDataToCollection = async () => {
  try {
    const batch = writeBatch(db);
    console.log("data", data);
    data.forEach((product) => {
      const docRef = doc(db, "products", product.id.toString());
      batch.set(docRef, product);
    });

    const res = await batch.commit();
    console.log("res", res);
  } catch (error) {
    console.log(error);
  }
};

// Fetch products from firestore based on their ids
const getProductsUsingProductIds = async (cart) => {
  const productIds = Object.keys(cart).map(Number);
  if (!productIds.length) {
    return false;
  }

  const productsRef = collection(db, "products");

  const productsSnapshot = await getDocs(
    query(productsRef, where("id", "in", productIds))
  );
  console.log("productsSnapshot", productsSnapshot);

  const productsData = productsSnapshot.docs.map((doc) => ({
    ...doc.data(),
    date: cart?.date,
    quantity: cart[doc.data().id],
  }));

  return productsData;
};

// Fetch users cart products from firestore
const getUserCartProducts = async (uid) => {
  const docRef = doc(db, "usersCarts", uid);
  const docSnap = await getDoc(docRef);
  console.log("docSnap", docSnap.data());
  return { docRef, data: docSnap.data() };
};

// Simple function to format date
const convertDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

export {
  addDataToCollection,
  getProductsUsingProductIds,
  getUserCartProducts,
  convertDate,
};

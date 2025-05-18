import React, { useState, useEffect } from "react";
import Loader from "../../components/UI/Loader/Loader";
import styles from "./OrdersPage.module.css";
import OrderTable from "../../components/OrderTable/OrderTable";
import { db } from "../../config/firebase";
import { getDoc , doc} from "firebase/firestore";
import { useSelector } from "react-redux";
import { getProductsUsingProductIds } from "../../utils/utils";
import { toast } from "react-toastify";
import { getUser } from "../../redux/reducers/authReducer";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user orders from firestore
  const user = useSelector(getUser);

  const getOrders = async () => {
    setLoading(true);
    try{
      const docRef = doc(db, "userOrders", user.uid);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      //
      if(!data){
        return toast.error("no order found")
      }
      let  promiseArray = [];

      data.orders.forEach((order) => {
        promiseArray.push(
          new Promise((resolve, reject) => {
            const data = getProductsUsingProductIds(order);
            if(data) {
              resolve(data);
            }else{
              reject("something went wrong")
            }
          })
        )
      })

      const finalOrders = await Promise.all(promiseArray);
      console.log("finalorder", finalOrders);
      setOrders(finalOrders);
    }catch(error){
      console.log(error);
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    getOrders();
  }, [user])
 
  if (loading) {
    return <Loader />;
  }

  if (!loading && !orders.length)
    return <h1 style={{ textAlign: "center" }}>No Orders Found!</h1>;

  return (
    <div className={styles.ordersContainer}>
      <h1>Your Orders</h1>
      {orders.map((order, idx) => {
        return <OrderTable order={order} key={idx} />;
      })}
    </div>
  );
};

export default OrdersPage;

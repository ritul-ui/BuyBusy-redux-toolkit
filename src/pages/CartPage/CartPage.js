import React, { useEffect } from "react";
import Loader from "../../components/UI/Loader/Loader";
import ProductList from "../../components/Product/ProductList/ProductList";
import styles from "./CartPage.module.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "../../redux/reducers/authReducer";
import { fetchCartProducts, getCartLoadingState, getCartProducts, clearUserCart, getPurchasingState, purchaseProducts } from "../../redux/reducers/cartReducer";
import { current } from "@reduxjs/toolkit";

const CartPage = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartProducts = useSelector(getCartProducts);
  console.log("cartprodtc", cartProducts);
  const loading = useSelector(getCartLoadingState);
  const user = useSelector(getUser);
  const purchasing = useSelector(getPurchasingState);

  //calculate total price of the products in cart
  let totalPrice = cartProducts?.reduce((acc, currentProduct) => {
    return acc+ currentProduct.price* currentProduct.quantity;
  }, 0);
  // Fetch all cart products for the user

  useEffect(() => {
    dispatch(fetchCartProducts({uid : user?.uid}));
  }, [user])

  const purchaseProductsHandler = async () => {
    // Write code to purchase the item present in the cart
    // Redirect the user to orders page after successful purchase
    // Clear the item present in the cart after successful purchase
    try{
      await dispatch(purchaseProducts({uid : user?.uid}));
      clearUserCartAndRedirectToOrdersPage();
    }catch(error){
      toast.error("something went wrong");
      console.log(error);
    }
  };

  // Clear user cart
  const clearUserCartAndRedirectToOrdersPage = async () => {
    await dispatch(clearUserCart({ uid: user?.uid }));
    navigate("/myorders");
  };


  if (loading) return <Loader />;

  return (
    <div className={styles.cartPageContainer}>
      {/*cartProduct here is the array of item present in the cart for the user yu can change this as per your need */}
      {!!cartProducts?.length && (
        <aside className={styles.totalPrice}>
          <p>TotalPrice:- ₹{totalPrice}/-</p>
          <button
            className={styles.purchaseBtn}
            onClick={purchaseProductsHandler}
          >
            {purchasing ? "Purchasing" : "Purchase"}
          </button>
        </aside>
      )}
      {!!cartProducts?.length ? (
        <ProductList  products={cartProducts}  onCart={true}/>
      ) : (
        <h1>Cart is Empty!</h1>
      )}
    </div>
  );
};

export default CartPage;

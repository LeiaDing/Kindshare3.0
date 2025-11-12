import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./features/userSlice";
import cartReducer from "./features/cartSlice";
import web3Reducer from "./features/web3Slice";

import { productApi } from "./api/productsApi";
import { authApi } from "./api/authApi";
import { userApi } from "./api/userApi";
import { orderApi } from "./api/orderApi";
import { web3Api } from "./api/web3Api";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    cart: cartReducer,
    web3: web3Reducer,
    [productApi.reducerPath]: productApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [web3Api.reducerPath]: web3Api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      productApi.middleware,
      authApi.middleware,
      userApi.middleware,
      orderApi.middleware,
      web3Api.middleware,
    ]),
});

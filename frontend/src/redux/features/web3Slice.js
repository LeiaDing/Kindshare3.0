import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  account: null,
  balance: '0',
  isConnected: false,
  loading: false,
  error: null,
  tokenBalance: '0'
};

const web3Slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload;
    },
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setTokenBalance: (state, action) => {
      state.tokenBalance = action.payload;
    },
    setIsConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    disconnectWeb3: (state) => {
      state.account = null;
      state.balance = '0';
      state.isConnected = false;
      state.tokenBalance = '0';
      state.error = null;
    },
    clearWeb3: () => initialState
  }
});

export const {
  setAccount,
  setBalance,
  setTokenBalance,
  setIsConnected,
  setLoading,
  setError,
  clearError,
  disconnectWeb3,
  clearWeb3
} = web3Slice.actions;

export default web3Slice.reducer;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const web3Api = createApi({
  reducerPath: 'web3Api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
  }),
  endpoints: (builder) => ({
    connectWallet: builder.mutation({
      query: (data) => ({
        url: '/wallet/connect',
        method: 'POST',
        body: data,
      }),
    }),
    getWalletBalance: builder.query({
      query: (address) => `/wallet/balance/${address}`,
    }),
    getUserWallet: builder.query({
      query: () => '/me/wallet',
    }),
    mintTokens: builder.mutation({
      query: (data) => ({
        url: '/tokens/mint',
        method: 'POST',
        body: data,
      }),
    }),
    transferTokens: builder.mutation({
      query: (data) => ({
        url: '/tokens/transfer',
        method: 'POST',
        body: data,
      }),
    }),
    getTransaction: builder.query({
      query: (txHash) => `/transaction/${txHash}`,
    }),
  }),
});

export const {
  useConnectWalletMutation,
  useGetWalletBalanceQuery,
  useGetUserWalletQuery,
  useMintTokensMutation,
  useTransferTokensMutation,
  useGetTransactionQuery,
} = web3Api;

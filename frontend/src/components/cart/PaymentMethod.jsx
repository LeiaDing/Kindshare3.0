import React, { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import { useSelector } from "react-redux";
import CheckoutSteps from "./CheckoutSteps";
import { caluclateOrderCost } from "../../helpers/helpers";
import {
  useCreateNewOrderMutation,
  useStripeCheckoutSessionMutation,
} from "../../redux/api/orderApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

const PaymentMethod = () => {
  const [method, setMethod] = useState("");

  const navigate = useNavigate();

  const { shippingInfo, cartItems } = useSelector((state) => state.cart);

  const [createNewOrder, { error, isSuccess }] = useCreateNewOrderMutation();

  const [
    stripeCheckoutSession,
    { data: checkoutData, error: checkoutError, isLoading },
  ] = useStripeCheckoutSessionMutation();

  useEffect(() => {
    if (checkoutData) {
      window.location.href = checkoutData?.url;
    }

    if (checkoutError) {
      toast.error(checkoutError?.data?.message);
    }
  }, [checkoutData, checkoutError]);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      navigate("/me/orders?order_success=true");
    }
  }, [error, isSuccess]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
      caluclateOrderCost(cartItems);

    if (method === "COD") {
      // Create COD Order
      const orderData = {
        shippingInfo,
        orderItems: cartItems,
        itemsPrice,
        shippingAmount: shippingPrice,
        taxAmount: taxPrice,
        totalAmount: totalPrice,
        paymentInfo: {
          status: "Not Paid",
        },
        paymentMethod: "COD",
      };

      createNewOrder(orderData);
    }

    if (method === "Card") {
      // Stripe Checkout
      const orderData = {
        shippingInfo,
        orderItems: cartItems,
        itemsPrice,
        shippingAmount: shippingPrice,
        taxAmount: taxPrice,
        totalAmount: totalPrice,
      };

      stripeCheckoutSession(orderData);
    }

    if (method === "Crypto") {
      // Crypto Token Payment
      try {
        if (!window.ethereum) {
          toast.error("请安装 MetaMask 钱包");
          return;
        }

        // 连接 MetaMask
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const buyerAddress = await signer.getAddress();

        // 获取卖家钱包地址（从第一个商品获取）
        const sellerAddress = cartItems[0]?.sellerWallet;
        if (!sellerAddress) {
          toast.error("卖家未设置钱包地址");
          return;
        }

        // 合约配置
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || "0x6d87bCE47B5A08E9F453A515F5548509d737743C";
        const contractABI = [
          "function transfer(address to, uint256 amount) public returns (bool)",
          "function balanceOf(address account) public view returns (uint256)"
        ];

        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // 检查余额
        const balance = await contract.balanceOf(buyerAddress);
        const balanceInTokens = parseFloat(ethers.utils.formatUnits(balance, 18));
        
        if (balanceInTokens < totalPrice) {
          toast.error(`代币余额不足！当前余额: ${balanceInTokens.toFixed(2)} KSTT`);
          return;
        }

        // 转账代币
        toast.loading("正在处理代币转账...");
        const amount = ethers.utils.parseUnits(totalPrice.toString(), 18);
        const tx = await contract.transfer(sellerAddress, amount);
        
        toast.loading("等待交易确认...");
        const receipt = await tx.wait();
        toast.dismiss();

        // 创建订单
        const orderData = {
          shippingInfo,
          orderItems: cartItems,
          itemsPrice,
          shippingAmount: shippingPrice,
          taxAmount: taxPrice,
          totalAmount: totalPrice,
          paymentInfo: {
            status: "Paid",
            txHash: receipt.transactionHash,
          },
          paymentMethod: "Crypto",
          web3TransactionHash: receipt.transactionHash,
          buyerWallet: buyerAddress,
          sellerWallet: sellerAddress,
          tokenTransferred: totalPrice,
        };

        createNewOrder(orderData);
        toast.success("代币支付成功！");
      } catch (error) {
        toast.dismiss();
        console.error("Crypto payment error:", error);
        toast.error(error?.message || "代币支付失败，请重试");
      }
    }
  };

  return (
    <>
      <MetaData title={"Payment Method"} />
      <CheckoutSteps shipping confirmOrder payment />

      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow rounded bg-body" onSubmit={submitHandler}>
            <h2 className="mb-4">Select Payment Method</h2>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="payment_mode"
                id="codradio"
                value="COD"
                onChange={(e) => setMethod("COD")}
              />
              <label className="form-check-label" htmlFor="codradio">
                Cash on Delivery
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="payment_mode"
                id="cardradio"
                value="Card"
                onChange={(e) => setMethod("Card")}
              />
              <label className="form-check-label" htmlFor="cardradio">
                Card - VISA, MasterCard
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="payment_mode"
                id="cryptoradio"
                value="Crypto"
                onChange={(e) => setMethod("Crypto")}
              />
              <label className="form-check-label" htmlFor="cryptoradio">
                虚拟代币 (KSTT) - MetaMask
              </label>
            </div>

            <button
              id="shipping_btn"
              type="submit"
              className="btn py-2 w-100"
              disabled={isLoading}
            >
              CONTINUE
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PaymentMethod;

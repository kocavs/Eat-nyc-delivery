import React, { useState, useEffect } from 'react';
import apigClient from './apigClient'

function OrdersComponent() {
  const [orders, setOrders] = useState([]);
  const [intervalIds, setIntervalIds] = useState({});

  useEffect(() => {
    // Call showOrders function when the component mounts
    showOrders();

    // Clean up any intervals and remove them from the state when the component unmounts
    return () => {
      Object.values(intervalIds).forEach((intervalId) => clearInterval(intervalId));
    };

  }, []);

  function showOrders() {
    const params = {
      user_id:'example@gmail.com'
    };
    const body = {};

    // Call the API Gateway endpoint to get orders ready to deliver
    apigClient.ordersGet(params, body,{})
      .then(response => {
        console.log(response)
        displayOrders(response.data);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
      });
  }

  function displayOrders(ordersData) {
    if (Array.isArray(ordersData) && ordersData.length > 0) {
      setOrders(ordersData);
    } else {
      // Handle empty or invalid ordersData
      setOrders([]); // Clear any existing orders
    }
  }

  function startDelivery(orderId) {
    const intervalId = setInterval(function () {
      navigator.geolocation.getCurrentPosition(function (position) {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        sendLocation(orderId, location);
      });
    }, 15000);

    // Store the intervalId in state with orderId as the key
    setIntervalIds((prevIntervalIds) => ({
      ...prevIntervalIds,
      [orderId]: intervalId,
    }));
  }

  function sendLocation(orderId, location) {
    const params = {};
    const body = { orderId: orderId, location: location };

    // Call API Gateway endpoint to send the location
    apigClient.locationPost(params, body)
      .then(function (result) {
        console.log('Location sent successfully:', result.data);
      })
      .catch(function (err) {
        console.error('Error sending location:', err);
      });
  }

  function completeDelivery(orderId) {
    // Stop tracking location for the specific orderId
    clearInterval(intervalIds[orderId]);

    // Call API Gateway to update that the order is delivered
    const params = {};
    const body = { orderId: orderId };

    // Call API Gateway endpoint to mark delivery as complete
    apigClient.completeDeliveryPost(params, body)
      .then(function (result) {
        console.log('Delivery completed:', result.data);
      })
      .catch(function (err) {
        console.error('Error completing delivery:', err);
      });
  }

  return (
    <div>
      {orders.length > 0 ? (
        <ul>
          {orders.map((order) => (
            <li key={order.order_id}>
              <p>Order ID: {order.order_id}</p>
              <p>Details: {order.details}</p>
              <button onClick={() => startDelivery(order.order_id)}>
                Start Delivery
              </button>
              <button onClick={() => completeDelivery(order.order_id)}>
                Complete Delivery
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No orders available.</p>
      )}
    </div>
  );
}

export default OrdersComponent;

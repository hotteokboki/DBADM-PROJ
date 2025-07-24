import { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
    const baseURL = import.meta.env.VITE_WEB_APP_BACKEND_PORT;
      try {
        const res = await axios.get(`${baseURL}/api/orders/get-user-orders`, {
            withCredentials: true,
        });
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <Grid>
      <h1>My Orders</h1>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <Card key={order.order_id}>
            <h2>Order #{order.order_id.slice(0, 8)}</h2>
            <p><strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ₱{order.order_total_amount}</p>
            <p><strong>Status:</strong> {order.current_status}</p>
            <hr />
            <p><strong>Payment:</strong> {order.payment_mode} - {order.status_name}</p>
            <p><strong>Transaction Date:</strong> {new Date(order.transaction_date).toLocaleString()}</p>
            {order.full_name ? (
              <>
                <hr />
                <p><strong>Shipping To:</strong> {order.full_name}</p>
                <p>{order.street_address}, {order.city}, {order.province}, {order.postal_code}</p>
                <p>📞 {order.phone_number}</p>
              </>
            ) : (
              <p><em>No address provided</em></p>
            )}
          </Card>
        ))
      )}
    </Grid>
  );
}

const Grid = styled.section`
  max-width: 111rem;
  margin: 4rem auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;

  h1 {
    grid-column: 1 / -1;
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }
`;

const Card = styled.article`
  border: 1px solid #ddd;
  padding: 1.6rem;
  border-radius: 1.2rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  background-color: #fff;

  h2 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
    color: #222;
  }

  p {
    font-size: 1rem;
    margin: 0.4rem 0;
  }

  hr {
    margin: 1rem 0;
    border: none;
    border-top: 1px solid #eee;
  }
`;
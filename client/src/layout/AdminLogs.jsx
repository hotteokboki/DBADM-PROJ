import styled from "styled-components";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminLogs() {
  const [productLogs, setProductLogs] = useState([]);
  const [sessionLogs, setSessionLogs] = useState([]);

  useEffect(() => {
    const baseURL = import.meta.env.VITE_WEB_APP_BACKEND_PORT;

    axios
      .get(`${baseURL}/api/logs/get-product-logs`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) setProductLogs(res.data.productlogs);
      });

    axios
      .get(`${baseURL}/api/logs/get-session-logs`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) setSessionLogs(res.data.sessionlogs);
      });
  }, []);

  return (
    <Grid>
      <h1>Admin Logs</h1>

      <SectionTitle>Product Logs</SectionTitle>
      {productLogs.map((log) => (
        <LogCard key={`product-${log.log_id}`}>
          <Action>
            <span className="user">
              {log.first_name} {log.last_name}
            </span>{" "}
            performed <span className="action">{log.action_type}</span>
          </Action>
          <Product>
            <h2>{log.product_name}</h2>
            <p>{log.product_description}</p>
          </Product>
        </LogCard>
      ))}

      <SectionTitle>Session Logs</SectionTitle>
      {sessionLogs.map((log) => (
        <LogCard key={`session-${log.log_id}`}>
          <Action>
            <span className="user">
              {log.first_name} {log.last_name}
            </span>{" "}
            <span className="action">{log.action}</span> at{" "}
            <span className="time">
              {new Date(log.timestamp).toLocaleString()}
            </span>
          </Action>
          <Product>
            <h2>{log.email}</h2>
            <p>User ID: {log.user_id}</p>
          </Product>
        </LogCard>
      ))}
    </Grid>
  );
}

const Grid = styled.section`
  max-width: 111rem;
  margin: 4rem auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32rem, 1fr));
  gap: 2rem;
  padding: 2rem;

  h1 {
    grid-column: 1 / -1;
    text-align: center;
    font-size: 3rem;
    margin-bottom: 2rem;
  }
`;

const LogCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 1.2rem;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Action = styled.div`
  font-weight: 500;
  font-size: 1.4rem;
  color: #374151;

  .user {
    color: #1f2937;
    font-weight: 600;
  }

  .action {
    color: #2563eb;
    font-weight: 600;
    text-transform: uppercase;
  }
`;

const Product = styled.div`
  h2 {
    font-size: 1.6rem;
    margin: 0 0 0.6rem;
    color: #111827;
  }

  p {
    font-size: 1.3rem;
    color: #4b5563;
    white-space: pre-wrap;
    line-height: 1.5;
  }
`;

const SectionTitle = styled.h2`
  grid-column: 1 / -1;
  font-size: 2rem;
  margin-top: 3rem;
  margin-bottom: 1rem;
  color: #1f2937;
`;

Action.defaultProps = {
  as: "div",
};

Product.defaultProps = {
  as: "div",
};

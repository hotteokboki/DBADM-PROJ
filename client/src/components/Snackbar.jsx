import React from "react";
import { useGlobalContext } from "../context/context";
import styled, { keyframes } from "styled-components";

const Snackbar = () => {
  const {
    state: {
      snackbar: { message, type, visible },
    },
  } = useGlobalContext();

  if (!visible) return null;

  return (
    <SnackbarContainer type={type}>
      {message}
    </SnackbarContainer>
  );
};

export default Snackbar;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -100%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0%);
  }
`;

const SnackbarContainer = styled.div`
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translate(-50%, 0%);
  background-color: ${({ type }) =>
    type === "success" ? "hsl(140, 70%, 40%)" : "hsl(0, 70%, 50%)"};
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: ${slideDown} 0.3s ease forwards;
`;
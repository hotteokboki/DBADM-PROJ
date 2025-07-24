import styled from "styled-components";
import { Logo, Menu, Cart } from "../icons/index";
import { avatar } from "../assets/imagedata";
import FloatingCart from "../components/FloatingCart";
import { useGlobalContext } from "../context/context";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";

const Navigator = () => {
  const { showSidebar, showCart, hideCart, state, dispatch } =
    useGlobalContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const navigate = useNavigate();
  const role = state.userRole;

  console.log("Navigator User Role:", role);

  let navLinks = [];

  if (role === 2) {
    // Admin
    navLinks = [
      { name: "transaction logs", path: "/transaction-logs" },
      { name: "admin logs", path: "/admin-logs" },
    ];
  } else if (role === 3) {
    // Admin
    navLinks = [
      { name: "add item", path: "/add-item" },
      { name: "update item", path: "/update-item" },
      { name: "manage discount", path: "/manage-discount" },
    ];
  } else {
    // Customer or Guest
    navLinks = [
      { name: "home", path: "/" },
      { name: "shop", path: "/shop" },
      { name: "collections", path: "/collections" },
      { name: "about", path: "/about" },
    ];
  }

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/auth/logout`,
        {},
        {
          withCredentials: true, // important for sending cookies
        }
      );

      // 🔥 FIXED: Clear user data from global context
      dispatch({ type: "CLEAR_USER" });

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <NavigatorWrapper>
      <nav>
        <div className="nav-left">
          <button onClick={showSidebar} className="menu-btn">
            <Menu />
          </button>
          <div className="logo">
            <Logo />
          </div>
          <ul className="nav-links">
            {navLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.path}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="nav-right">
          {role === 1 && (
            <button
              onClick={() => {
                if (state.showingCart) {
                  hideCart();
                } else {
                  showCart();
                }
              }}
              className="cart-btn"
            >
              <Cart />
              {state.totalCartSize > 0 && <span>{state.totalCartSize}</span>}
            </button>
          )}
          <div className="avatar-dropdown">
            <button className="avatar-btn" onClick={toggleDropdown}>
              <img src={avatar} alt="avatar" />
            </button>

            {isDropdownOpen && (
              <DropdownMenu>
                {!role && <StyledLink to="/login">Login</StyledLink>}
                {role && (
                  <>
                    <StyledLink to="/orders">My Orders</StyledLink>
                    <StyledLink to="/wishlist">Wishlist</StyledLink>
                    <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
                  </>
                )}
              </DropdownMenu>
            )}
          </div>
          <FloatingCart className={`${state.showingCart ? "active" : ""}`} />
        </div>
      </nav>
    </NavigatorWrapper>
  );
};

const NavigatorWrapper = styled.header`
  position: relative;
  padding: 2.4rem;
  border-bottom: 1px solid hsl(var(--divider));

  img,
  svg {
    display: block;
  }

  nav {
    display: flex;
    justify-content: space-between;
  }

  .nav-left {
    display: flex;
    align-items: center;
    gap: 1.6rem;

    .menu-btn {
      display: block;

      @media only screen and (min-width: 768px) {
        display: none;
      }
    }

    .nav-links {
      display: none;
    }
  }

  .nav-right {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1.6rem;

    .cart-btn {
      position: relative;

      svg,
      path {
        fill: hsl(var(--black));
      }

      span {
        user-select: none;
        position: absolute;
        top: -1rem;
        right: -1rem;
        background-color: hsl(var(--orange));
        font-weight: 700;
        color: hsl(var(--white));
        border-radius: 50%;
        padding: 0.3rem 0.8rem;
        font-size: 1.1rem;
      }
    }

    .avatar-btn {
      height: 2.4rem;
      width: 2.4rem;
      border-radius: 50%;
      img {
        width: 100%;
      }
    }
  }

  @media only screen and (min-width: 768px) {
    padding-bottom: 4rem;
    .nav-left {
      .nav-links {
        display: flex;
        gap: 3.2rem;
        list-style: none;
        margin-left: 3rem;
        a {
          text-decoration: none;
          font-size: 1.5rem;
          text-transform: capitalize;
          color: hsl(var(--dark-grayish-blue));
        }
      }
    }

    .nav-right {
      gap: 2.4rem;

      .avatar-btn {
        height: 3.5rem;
        width: 3.5rem;
        &:hover {
          outline: 2px solid hsl(var(--orange));
        }
      }
    }
  }

  @media only screen and (min-width: 1000px) {
    padding: 4rem 0 4rem;
    max-width: 80%;
    margin: 0 auto;

    .nav-right {
      gap: 4.7rem;
      justify-content: space-between;
      .avatar-btn {
        height: 5rem;
        width: 5rem;

        img {
          width: 100%;
        }
      }
    }
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.8rem;
  background-color: white;
  border: 1px solid hsl(var(--divider));
  border-radius: 0.6rem;
  box-shadow: 0 0.8rem 2rem rgba(0, 0, 0, 0.1);
  width: 18rem;
  z-index: 99;
  display: flex;
  flex-direction: column;
`;

const StyledLink = styled(Link)`
  padding: 1rem 1.6rem;
  font-size: 1.4rem;
  color: hsl(var(--black));
  text-decoration: none;

  &:hover {
    background-color: hsl(var(--very-light-gray));
  }
`;

const LogoutButton = styled.button`
  padding: 1rem 1.6rem;
  font-size: 1.4rem;
  color: hsl(var(--red));
  background: none;
  border: none;
  text-align: left;
  width: 100%;
  cursor: pointer;

  &:hover {
    background-color: hsl(var(--very-light-gray));
  }
`;

export default Navigator;

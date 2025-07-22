import styled from "styled-components"
import { Close } from "../icons/index"
import { useGlobalContext } from "../context/context"
import { Link } from "react-router-dom"

const Sidebar = ({ isShowing }) => {
  const { hideSidebar, state } = useGlobalContext()
  const role = state.userRole;

  let sideBarLinks = [];

  if (role === 2) {
    //  Admin
    sideBarLinks = [
      { name: "Add Item", path: "/add-item" },
      { name: "Update Item", path: "/update-item" },
      { name: "Transaction Logs", path: "/transaction-logs" },
      { name: "Admin Logs", path: "/admin-logs" },
      { name: "Manage Discount", path: "/manage-discount" },
    ];
  } else if (role === 3) {
    // Staff
    sideBarLinks = [
      { name: "Add Item", path: "/add-item" },
      { name: "Update Item", path: "/update-item" },
      { name: "Manage Discount", path: "/manage-discount" },
    ];
  } else {
    // Customer
    sideBarLinks = [
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
      { name: "Collections", path: "/collections" },
      { name: "About", path: "/about" },
    ];
  }

  return (
    <SidebarWrapper className={isShowing && "active"}>
      <nav>
        <button onClick={hideSidebar}>
          <Close />
        </button>
        <ul className="sidebar-links">
          {sideBarLinks.map((link, idx) => (
            <li key={idx}>
              <Link to={link.path} onClick={hideSidebar}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </SidebarWrapper>
  )
}

const SidebarWrapper = styled.aside`
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 0;
  z-index: 1000;
  height: 100vh;
  transition: 0.3s ease width, 0.2s ease opacity;
  background-color: hsl(var(--black) / 0.7);
  user-select: none;
  pointer-events: none;

  nav {
    padding: 2.5rem;
    max-width: 25rem;
    height: 100%;
    background-color: hsl(var(--white));

    .sidebar-links {
      margin-top: 5.4rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      font-size: 1.8rem;
      font-weight: 700;
      font-family: inherit;
      list-style: none;

      a {
        color: hsl(var(--black));
        text-decoration: none;
      }
    }
  }

  &.active {
    pointer-events: auto;
    user-select: auto;
    opacity: 1;
    width: 100%;
  }
`

export default Sidebar

import styled from "styled-components"
import { Routes, Route, Navigate } from "react-router-dom"
import ProductList from "./ProductList.jsx"
import Product from "./Product.jsx"
import Home from "./Home.jsx"
import Collections from "./Collections.jsx"
import About from "./About.jsx"
import Login from "./Login.jsx"
import Register from "./Register.jsx"
import AdminLogs from "./AdminLogs.jsx"
import TransactionLogs from "./TransactionLogs.jsx"
import UpdateItem from "./UpdateItem.jsx"
import AddItem from "./AddItem.jsx"
import ManageDiscount from "./ManageDiscounts.jsx"
import Wishlist from "../components/Wishlist.jsx"
import WishlistProductDetail from "../components/WishlistProductDetail.jsx"

const Main = () => {
  return (
    <MainWrapper>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ProductList />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/manage-discount" element={<ManageDiscount />} />
        <Route path="/update-item" element={<UpdateItem />} />
        <Route path="/transaction-logs" element={<TransactionLogs />} />
        <Route path="/admin-logs" element={<AdminLogs />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/wishlist/product/:id" element={<WishlistProductDetail />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainWrapper>
  )
}

const MainWrapper = styled.main`
  max-width: 111rem;
  margin: 0 auto;
  display: flex;
  justify-content: center;
`

export default Main
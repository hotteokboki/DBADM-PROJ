import styled from "styled-components"
import { Routes, Route, Navigate } from "react-router-dom"
import ProductList from "./ProductList.jsx"
import Product from "./Product.jsx"
import Home from "./Home.jsx"
import Collections from "./Collections.jsx"
import About from "./About.jsx"

const Main = () => {
  return (
    <MainWrapper>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ProductList />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/about" element={<About />} />
        <Route path="/product/:id" element={<Product />} />
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
import styled from "styled-components"
import React, { useState, useEffect } from "react"
import axios from "axios"
import { useGlobalContext } from "../context/context"

export default function ManageDiscount() {
    const { showSnackbar } = useGlobalContext()
    const [mode, setMode] = useState("create") // 'create' or 'tag'
    const [formData, setFormData] = useState({
        discount_name: "",
        discount_type: "percentage",
        discount_value: "",
        start_date: "",
        end_date: "",
        tagged_products: [],
    })
    const [productList, setProductList] = useState([])
    const [discountList, setDiscountList] = useState([])
    const [selectedDiscount, setSelectedDiscount] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, discountsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/products/get-all-products-without-discount`),
                    axios.get(`${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/discounts/get-all-discounts`)
                ])

                if (productsRes.data.success) setProductList(productsRes.data.products)
                if (discountsRes.data.success) setDiscountList(discountsRes.data.discounts)
            } catch (err) {
                console.error("Error fetching data:", err)
            }
        }

        fetchData()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleProductTag = (productId) => {
        setFormData((prev) => {
            const exists = prev.tagged_products.includes(productId)
            return {
                ...prev,
                tagged_products: exists
                    ? prev.tagged_products.filter((id) => id !== productId)
                    : [...prev.tagged_products, productId],
            }
        })
    }

    const handleCreateSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/discounts/create`,
                formData,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            )

            if (res.data.success) {
                showSnackbar(res.data.message || "Discount created successfully", "success")
                setFormData({
                    discount_name: "",
                    discount_type: "percentage",
                    discount_value: "",
                    start_date: "",
                    end_date: "",
                    tagged_products: [],
                })
            } else {
                throw new Error(res.data.message)
            }
        } catch (err) {
            console.error("Error creating discount:", err)
            showSnackbar(err.message || "Failed to create discount.", "error")
        }
    }

    const handleTagSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/discounts/tag`,
                {
                    discount_id: selectedDiscount,
                    product_ids: formData.tagged_products,
                },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            )

            if (res.data.success) {
                showSnackbar(res.data.message || "Products tagged successfully", "success")
                setFormData((prev) => ({ ...prev, tagged_products: [] }))
                setSelectedDiscount("")
            } else {
                throw new Error(res.data.message)
            }
        } catch (err) {
            console.error("Error tagging discount:", err)
            showSnackbar(err.message || "Failed to tag products.", "error")
        }
    }

    return (
        <Grid>
            <h1>Manage Discounts</h1>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                <button onClick={() => setMode("create")} disabled={mode === "create"}>
                    Create Discount
                </button>
                <button onClick={() => setMode("tag")} disabled={mode === "tag"}>
                    Tag Existing Discount
                </button>
            </div>

            <Form onSubmit={mode === "create" ? handleCreateSubmit : handleTagSubmit}>
                {mode === "create" ? (
                    <>
                        <label>
                            Discount Name
                            <input
                                type="text"
                                name="discount_name"
                                value={formData.discount_name}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Discount Type
                            <select
                                name="discount_type"
                                value={formData.discount_type}
                                onChange={handleChange}
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed</option>
                            </select>
                        </label>

                        <label>
                            Discount Value (%)
                            <input
                                type="number"
                                name="discount_value"
                                value={formData.discount_value}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                required
                            />
                        </label>

                        <label>
                            Start Date
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            End Date
                            <input
                                type="date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </>
                ) : (
                    <>
                        <label>
                            Select Discount
                            <select
                                value={selectedDiscount}
                                onChange={(e) => setSelectedDiscount(e.target.value)}
                                required
                            >
                                <option value="">-- Select Discount --</option>
                                {discountList.map((discount) => (
                                    <option key={discount.discount_id} value={discount.discount_id}>
                                        {discount.discount_name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Tag Products
                            <div className="product-list">
                                {productList.map((product) => (
                                    <div key={product.product_id}>
                                        <input
                                            type="checkbox"
                                            checked={formData.tagged_products.includes(product.product_id)}
                                            onChange={() => handleProductTag(product.product_id)}
                                        />
                                        {product.product_name}
                                    </div>
                                ))}
                            </div>
                        </label>
                    </>
                )}

                <button type="submit">{mode === "create" ? "Create Discount" : "Tag Discount"}</button>
            </Form>
        </Grid>
    )
}

const Grid = styled.section`
  max-width: 700px;
  margin: 4rem auto;
  padding: 2rem;
  border-radius: 1rem;
  background: #f9f9f9;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);

  h1 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }

  button {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    background-color: #0077ff;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  button:not(:disabled):hover {
    background-color: #005dc1;
  }
`

const Form = styled.form`
  display: grid;
  gap: 1.5rem;

  label {
    display: flex;
    flex-direction: column;
    font-weight: 600;
    font-size: 1.1rem;
  }

  input, select, textarea {
    margin-top: 0.5rem;
    padding: 0.8rem 1rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    font-size: 1rem;
    background: #fff;
    transition: 0.2s ease;
  }

  input:focus, textarea:focus, select:focus {
    border-color: #0077ff;
    outline: none;
  }
`
import React, { useState } from 'react';
import { API_URL } from "../App";

export default function CheckoutForm({ token, userId }) {
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        shippingInfo: {
            firstName: '',
            lastName: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            zipcode: ''
        },
        paymentInfo: {
            cardNumber: '',
            expirationDate: '',
            securityCode: '',
            cardHolderName: ''
        }
    });

    const checkOut = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}/cart/checkout`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                throw new Error('Failed to checkout');
            }
            console.log('Checkout successful!')
        } catch (error) {
            setError(error.message || 'Failed to checkout');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // checking userId and token... DELETE LATER
        console.log('userId:', userId);
        console.log('token:', token);


        // Call checkout function
        try {
            // check form data... DELETE LATER
            console.log('Form Data Submitted:', formData);
            await checkOut(userId, token);
            // Show success message
            alert('Checkout successful!');
            // Reset the form
            setFormData({
                shippingInfo: {
                    firstName: '',
                    lastName: '',
                    address1: '',
                    address2: '',
                    city: '',
                    state: '',
                    zipcode: ''
                },
                paymentInfo: {
                    cardNumber: '',
                    expirationDate: '',
                    securityCode: '',
                    cardHolderName: ''
                }
            });
        } catch (error) {
            console.error('Failed to checkout:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Shipping Information</h2>
            <label>
                First Name:
                <input
                    type="text"
                    name="shippingInfo.firstName"
                    value={formData.shippingInfo.firstName}
                    onChange={(e) => setFormData({ ...formData, shippingInfo: { ...formData.shippingInfo, firstName: e.target.value } })}
                    required
                />
            </label>
            <br />
            <label>
                Last Name:
                <input
                    type="text"
                    name="shippingInfo.lastName"
                    value={formData.shippingInfo.lastName}
                    onChange={(e) => setFormData({ ...formData, shippingInfo: { ...formData.shippingInfo, lastName: e.target.value } })}
                    required
                />
            </label>
            <br />
            <label>
                Address Line 1:
                <input
                    type="text"
                    name="shippingInfo.address1"
                    value={formData.shippingInfo.address1}
                    onChange={(e) => setFormData({ ...formData, shippingInfo: { ...formData.shippingInfo, address1: e.target.value } })}
                    required
                />
            </label>
            <br />
            <label>
                Address Line 2 (Optional):
                <input
                    type="text"
                    name="shippingInfo.address2"
                    value={formData.shippingInfo.address2}
                    onChange={(e) => setFormData({ ...formData, shippingInfo: { ...formData.shippingInfo, address2: e.target.value } })}
                />
            </label>
            <br />
            <label>
                City:
                <input
                    type="text"
                    name="shippingInfo.city"
                    value={formData.shippingInfo.city}
                    onChange={(e) => setFormData({ ...formData, shippingInfo: { ...formData.shippingInfo, city: e.target.value } })}
                    required
                />
            </label>
            <br />
            <label>
                State:
                <input
                    type="text"
                    name="shippingInfo.state"
                    value={formData.shippingInfo.state}
                    onChange={(e) => setFormData({ ...formData, shippingInfo: { ...formData.shippingInfo, state: e.target.value } })}
                    required
                />
            </label>
            <br />
            <label>
                Zipcode:
                <input
                    type="text"
                    name="shippingInfo.zipcode"
                    value={formData.shippingInfo.zipcode}
                    onChange={(e) => setFormData({ ...formData, shippingInfo: { ...formData.shippingInfo, zipcode: e.target.value } })}
                    required
                />
            </label>
            <br />

            <h2>Payment Method</h2>
            <label>
                Card Number:
                <input
                    type="text"
                    name="paymentInfo.cardNumber"
                    value={formData.paymentInfo.cardNumber}
                    onChange={(e) => setFormData({ ...formData, paymentInfo: { ...formData.paymentInfo, cardNumber: e.target.value } })}
                    required
                />
            </label>
            <br />
            <label>
                Expiration Date (MM/YY):
                <input
                    type="text"
                    name="paymentInfo.expirationDate"
                    value={formData.paymentInfo.expirationDate}
                    onChange={(e) => setFormData({ ...formData, paymentInfo: { ...formData.paymentInfo, expirationDate: e.target.value } })}
                    pattern="^(0[1-9]|1[0-2])\/\d{2}$" // MM/YY format
                    maxLength={5}
                    placeholder='MM/YY'
                    required
                />
            </label>
            <br />
            <label>
                Security Code:
                <input
                    type="text"
                    name="paymentInfo.securityCode"
                    value={formData.paymentInfo.securityCode}
                    onChange={(e) => setFormData({ ...formData, paymentInfo: { ...formData.paymentInfo, securityCode: e.target.value } })}
                    pattern="^\d{3,4}$" // digits 3-4 long
                    minLength={3}
                    maxLength={4}
                    placeholder='3 or 4 digit code'
                    required
                />
            </label>
            <br />
            <label>
                Name on Card:
                <input
                    type="text"
                    name="paymentInfo.cardHolderName"
                    value={formData.paymentInfo.cardHolderName}
                    onChange={(e) => setFormData({ ...formData, paymentInfo: { ...formData.paymentInfo, cardHolderName: e.target.value } })}
                    required
                />
            </label>
            <br />

            <button type="submit">Submit</button>
        </form>
    );
}
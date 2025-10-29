import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { formatCurrency } from "../lib/utils";
import { generateOrderNumber } from "../lib/utils";
import { useNavigate, Navigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";

export function CheckoutPage() {
  const { items, totals, clear } = useCartStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    payment_method: "COD" as "COD" | "PO" | "Offline",
  });

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.address_line1.trim()) {
      newErrors.address_line1 = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = "Postal code is required";
    } else if (!/^\d{6}$/.test(formData.postal_code)) {
      newErrors.postal_code = "Please enter a valid 6-digit postal code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const orderNo = generateOrderNumber();
      const orderData = {
        orderNo,
        items: items.map((item) => ({
          productId: item.product_id,
          sku: item.sku,
          name: item.name,
          price: item.price,
          qty: item.qty,
          imagePath: item.image_path,
        })),
        totals,
        paymentMethod: formData.payment_method,
        shippingAddress: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.address_line1.trim(),
          addressLine2: formData.address_line2.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postal_code.trim(),
          country: "India",
        },
        billingAddress: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.address_line1.trim(),
          addressLine2: formData.address_line2.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postal_code.trim(),
          country: "India",
        },
        guestInfo: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
      };

      // Use orders API to create order
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create order");
      }

      await response.json();
      clear();
      toast({
        title: "Order Placed Successfully!",
        description: `Your order ${orderNo} has been placed. Our team will contact you shortly for further steps and order confirmation.`,
      });
      navigate(`/orders/${orderNo}`);
    } catch (error: any) {
      console.error("Order error:", error);
      toast({
        title: "Order Failed",
        description:
          error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md space-y-6"
            >
              <div>
                <h2 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">
                  Customer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      className={`px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full ${
                        errors.name
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      className={`px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full ${
                        errors.email
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="tel"
                      placeholder="Phone"
                      required
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                      className={`px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full ${
                        errors.phone
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      required
                      value={formData.address_line1}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          address_line1: e.target.value,
                        });
                        if (errors.address_line1)
                          setErrors({ ...errors, address_line1: "" });
                      }}
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        errors.address_line1
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                    {errors.address_line1 && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address_line1}
                      </p>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={formData.address_line2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address_line2: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="City"
                        required
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value });
                          if (errors.city) setErrors({ ...errors, city: "" });
                        }}
                        className={`px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full ${
                          errors.city
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="State"
                        required
                        value={formData.state}
                        onChange={(e) => {
                          setFormData({ ...formData, state: e.target.value });
                          if (errors.state) setErrors({ ...errors, state: "" });
                        }}
                        className={`px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full ${
                          errors.state
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Postal Code"
                        required
                        value={formData.postal_code}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            postal_code: e.target.value,
                          });
                          if (errors.postal_code)
                            setErrors({ ...errors, postal_code: "" });
                        }}
                        className={`px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full ${
                          errors.postal_code
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                      />
                      {errors.postal_code && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.postal_code}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {(["COD", "PO", "Offline"] as const).map((method) => (
                    <label
                      key={method}
                      className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-amber-500 transition"
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method}
                        checked={formData.payment_method === method}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            payment_method: e.target.value as any,
                          })
                        }
                        className="w-5 h-5 text-amber-600"
                      />
                      <span className="ml-3 font-medium">
                        {method === "COD"
                          ? "Cash on Delivery"
                          : method === "PO"
                          ? "Purchase Order"
                          : "Offline Payment"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md sticky top-24">
              <h2 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">
                Order Summary
              </h2>
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>
                    {totals.shipping === 0
                      ? "FREE"
                      : formatCurrency(totals.shipping)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatCurrency(totals.grand)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

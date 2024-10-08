import axios from "axios";
import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { load } from "@cashfreepayments/cashfree-js";
import { useNavigate } from "react-router-dom";
import Alerts from "../reusable/alerts";
import { useSelector } from "react-redux";

export function Payment() {
  const studentinfo = useSelector((state) => state.StudentInfo.tudentinfo);
  console.log(studentinfo)
  const [orderId, setOrderId] = useState("");
  const navigate = useNavigate();
  // const [paymentSessionId, setPaymentSessionId] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] =useState('')
  const [alertColor, setAlertColor] =useState('')
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    phoneNumber: "",
    totalFee: "7000", // Default value
    amountPaid: "",
  });

  const [errors, setErrors] = useState({});

  // Validation function for individual fields
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "userId":
        if (!value.trim()) {
          error = "User ID is required";
        }
        break;
      case "name":
        if (!value.trim()) {
          error = "Name is required";
        }
        break;
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Email is invalid";
        }
        break;
      case "phoneNumber":
        if (!value) {
          error = "Phone number is required";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Phone number must be 10 digits";
        }
        break;
      case "totalFee":
        if (!value) {
          error = "Total fee is required";
        }
        break;
      case "amountPaid":
        if (!value) {
          error = "Amount to be paid is required";
        }
        break;
      default:
        break;
    }

    return error;
  };

  // Validate the entire form
  const validateForm = () => {
    const validationErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) validationErrors[field] = error;
    });

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0; // Returns true if no errors
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate the field on change
    const fieldError = validateField(name, value);
    setErrors({
      ...errors,
      [name]: fieldError,
    });
  };


   const verifyPayment = async () => {
     try {
      console.log(orderId);
       let res = await axios.post("/payment/verify", {
         orderId: orderId,
       });
       if (res && res.data) {
        //  alert("payment verified");
       
       setShowAlert(true)
       setAlertColor('success')
       setAlertText('Payment Successfull');
       setTimeout(() => {
         setShowAlert(false);
         navigate("/student/");
       }, 3000);

       }
     } catch (err) {
       console.log(err);
       setShowAlert(true);
       setAlertColor("danger");
       setAlertText("Payment failed!");
       setTimeout(() => {
         setShowAlert(false);
         navigate('/student/')
       }, 3000);
     }
   };

  const getSessionId = async () => {
    try {
      let res = await axios.post("/payment/student",
        formData
      );
      if (res.data && res.data.payment_session_id) {
        setOrderId(...orderId,res.data.order_id);
        
        console.log(orderId)
        console.log("hiii")
        return res.data.payment_session_id;
      }
    } catch (err) {
      console.log(err);
    }
  };

  let cashfree;
  const initializeSDK = async function () {
    cashfree = await load({
      mode: "sandbox",
    });
  };
  initializeSDK();

  const handlePayment = async (e) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) {
      console.log("Form validation failed");
      return; // If validation fails, stop the execution
    }

    let sessionId = await getSessionId();
    console.log(sessionId);
    let checkoutOptions = {
      paymentSessionId: sessionId,
      redirectTarget: "_modal",
    };

    try {
      console.log(formData);

      cashfree
        .checkout(checkoutOptions)
        .then((res) => {
          verifyPayment(orderId);
          setShowAlert(true);
          setAlertColor("success");
          setAlertText("Payment Successfull");
          setTimeout(() => {
            setShowAlert(false);
            navigate("/student/");
          }, 3000);
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container>
      {/* <h1 className="icon">hello </h1> */}
      {showAlert ? <Alerts color={alertColor} text={alertText} /> : ""}
      <Form className="icon m-5">
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridUserId">
            <Form.Label>User ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter User ID"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              isInvalid={!!errors.userId}
            />
            <Form.Control.Feedback type="invalid">
              {errors.userId}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} controlId="formGridName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
        </Row>

        <Form.Group className="mb-3" controlId="formGridEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formGridPhoneNumber">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            isInvalid={!!errors.phoneNumber}
          />
          <Form.Control.Feedback type="invalid">
            {errors.phoneNumber}
          </Form.Control.Feedback>
        </Form.Group>

        <Row>
          <Form.Group as={Col} className="mb-3" controlId="formGridTotalFee">
            <Form.Label>Total Fee</Form.Label>
            <Form.Control
              type="number"
              name="totalFee"
              value="7000"
              disabled // Total fee is static, hence disabled
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group as={Col} className="mb-3" controlId="formGridAmountPaid">
            <Form.Label>Amount to be Paid</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter Amount to be Paid"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
              isInvalid={!!errors.amountPaid}
              min={500}
            />
            <Form.Control.Feedback type="invalid">
              {errors.amountPaid}
            </Form.Control.Feedback>
          </Form.Group>
        </Row>

        <Button className="button" type="button" onClick={handlePayment}>
          Pay Now
        </Button>
      </Form>
    </Container>
  );
}

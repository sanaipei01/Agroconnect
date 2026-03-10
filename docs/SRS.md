# AgroConnect - Software Requirements Specification (SRS)
**Prepared by:** [Your Full Name] - Project Manager / Business Analyst  
**Date:** March 2026  
**Version:** 1.0

## 1. Introduction
Small-scale farmers face challenges such as lack of reliable markets, middlemen exploitation, poor logistics, and limited market information. Buyers struggle to find trusted suppliers. AgroConnect solves this with a web-based digital marketplace.

## 4. Functional Requirements
### 4.1 User Management
- Users shall register and log in with email and password
- Roles: Farmer, Buyer, Transporter, Admin
- Role-based access control

### 4.2 Product Management
- Farmers can create, edit, delete product listings (name, quantity, price, location, availability)
- Buyers can browse and search products

### 4.3 Order & Negotiation Management
- Buyers can place orders
- Farmers can Accept / Reject / Negotiate price
- Order status: Pending, Negotiating, Confirmed, Delivered

### 4.4 Logistics & Delivery
- Transporters can accept delivery requests
- Real-time delivery tracking and status updates

### 4.5 Reviews & Ratings
- Users can rate and review each other after delivery
- Ratings affect user visibility and trust

### 4.6 Notifications
- Notifications for order updates, negotiation responses, and delivery alerts

### 4.7 Administration
- Admin can manage users, view analytics, and handle disputes

## 5. Non-Functional Requirements
- Performance: Support 500 concurrent users
- Security: JWT authentication, encrypted passwords
- Scalability: Containerized deployment
- Availability: 99.5% uptime
- Usability: Simple and responsive design

## 6. Use Case Descriptions
**UC-01 Register/Login** – Users register and log in  
**UC-02 List Products** – Farmer creates product listing  
**UC-03 Browse Products** – Buyer searches products  
**UC-04 Place Order** – Buyer places order (pre: logged in, post: order saved + farmer notified)  
**UC-05 Negotiate Price** – Farmer accepts/rejects/negotiates  
**UC-06 Assign Transport** – Transporter accepts delivery  
**UC-07 Update Delivery Status**  
**UC-08 Rate User** – After delivery  
**UC-09 Monitor System** – Admin dashboard

## 7. Conclusion
AgroConnect will create a transparent and efficient marketplace.

**All diagrams (Use Case, Class, Sequence) are in docs/UML folder.**

# AgroConnect – System Architecture Explanation

## Overview

AgroConnect is a **web-based digital marketplace** built on a classic three-tier architecture: a browser-based frontend, a RESTful API backend, and a MongoDB database. The system connects four actor types — Farmers, Buyers, Transporters, and Admins — through a secure, role-based platform.

---

## 1. Architecture Style: Layered REST API

AgroConnect follows a **Model-View-Controller (MVC)** pattern on the backend and a **Single-Page Application (SPA)** model on the frontend.

```
┌──────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                      │
│   Browser → HTML/CSS/JS (React-ready static frontend)    │
│   Pages: index, marketplace, farmer, transporter, order  │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP / REST (JSON)
                         ▼
┌──────────────────────────────────────────────────────────┐
│                      API LAYER (Node.js / Express)       │
│  Routes:  /auth   /products   /orders                    │
│  Middleware: JWT Auth (auth.js)                          │
│  Business Logic: validation, price calc, status updates  │
└────────────────────────┬─────────────────────────────────┘
                         │ Mongoose ODM
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    DATA LAYER (MongoDB)                   │
│  Collections: users · products · orders                  │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Layer

**Technology:** Vanilla HTML5, CSS3, and JavaScript (with optional React migration path)

The frontend is a multi-page static web application. Key pages include:

| Page | Role |
|---|---|
| `index.html` | Landing / marketing page |
| `login.html` / `register.html` | Authentication |
| `marketplace.html` | Browse all available products |
| `farmer.html` | Farmer dashboard – manage listings |
| `transporter.html` | Transporter dashboard – manage deliveries |
| `order.html` | Order details and status tracking |

**API Integration:** All frontend pages communicate with the backend via `fetch()` REST calls. JWT tokens returned from `/auth/login` are stored client-side and sent in the `Authorization: Bearer <token>` header on every protected request.

---

## 3. Backend / API Layer

**Technology:** Node.js with Express.js

The backend is organized into three route modules:

### `/auth` – Authentication Routes
- `POST /auth/register` — Creates a new user with a hashed password (bcryptjs). Roles: `farmer`, `buyer`, `transporter`.
- `POST /auth/login` — Verifies credentials, returns a signed JWT token valid for 24 hours.

### `/products` – Product Management Routes
- `GET /products` — Public endpoint, returns all `Available` products populated with farmer name/email.
- `POST /products` — Protected (farmer only). Creates a new product listing.
- `PUT /products/:id` — Protected. Farmer updates their own product.
- `DELETE /products/:id` — Protected. Farmer deletes their own product.
- `GET /products/farmer/:farmerId` — Returns all products belonging to a specific farmer.

### `/orders` – Order Lifecycle Routes
- `POST /orders` — Buyer places a new order. System validates product availability, checks stock, and auto-calculates `totalPrice`.
- `GET /orders/buyer` — Returns all orders placed by the authenticated buyer.
- `GET /orders/farmer` — Returns all orders for the authenticated farmer's products.
- `GET /orders/available` — Returns unassigned accepted/pending orders for transporters.
- `GET /orders/transporter` — Returns orders assigned to the authenticated transporter.
- `PUT /orders/:id/status` — Farmer or transporter updates order status.
- `PUT /orders/:id/accept` — Transporter accepts and self-assigns to an order.
- `PUT /orders/:id/cancel` — Buyer cancels an order (not if already delivered).

---

## 4. Middleware Layer

**`middleware/auth.js`** — JWT Verification Middleware

Every protected route passes through this middleware:
1. Extracts the `Authorization: Bearer <token>` header.
2. Verifies the JWT using the server secret (`SECRETKEY`).
3. Decodes `{ id, role }` and attaches it to `req.user`.
4. Rejects requests with `401 Unauthorized` if token is missing or invalid.

This enables **Role-Based Access Control (RBAC)** throughout the API — each route handler checks `req.user.role` or compares `req.user.id` to resource owner IDs before allowing mutations.

---

## 5. Data Layer

**Technology:** MongoDB with Mongoose ODM

### User Collection
```
{ name, email, password (hashed), role: ['farmer'|'buyer'|'transporter'], timestamps }
```

### Product Collection
```
{ name, quantity, price, location, availability: ['Available'|'Unavailable'], farmer: ref(User), timestamps }
```

### Order Collection
```
{ product: ref(Product), buyer: ref(User), quantity, deliveryLocation, pickupLocation,
  totalPrice, status: ['pending'|'accepted'|'in-transit'|'delivered'|'cancelled'],
  transporter: ref(User), notes, timestamps }
```

Mongoose's **population** feature is used extensively to join related documents — for example, an order response includes the full product name/price and the buyer's name/email, without requiring a SQL-style join.

---

## 6. Security Architecture

| Concern | Implementation |
|---|---|
| Password storage | bcryptjs with salt rounds (10) |
| Authentication | JWT (jsonwebtoken), 24-hour expiry |
| Authorization | Middleware verifies token on every protected route |
| Ownership checks | Routes compare `req.user.id` to resource `farmer` or `buyer` fields |
| Input validation | Mongoose schema validation (required fields, enums, types) |

---

## 7. Order State Machine

The Order entity follows a defined status lifecycle:

```
        ┌─────────┐
        │ pending │◄──────────────────────────┐
        └────┬────┘                            │
             │ Farmer accepts                  │ (creation)
             ▼                                 │
        ┌──────────┐         Buyer cancels     │
        │ accepted │──────────────────────► cancelled
        └────┬─────┘
             │ Transporter accepts
             ▼
        ┌────────────┐
        │ in-transit │
        └─────┬──────┘
              │ Delivered
              ▼
         ┌───────────┐
         │ delivered │
         └───────────┘
```

---

## 8. Deployment Architecture

```
Internet
   │
   ▼
[Reverse Proxy / CDN]  (e.g. Nginx / Cloudflare)
   │              │
   ▼              ▼
[Frontend      [API Server]    ←──►  [MongoDB Atlas / Docker]
 Static Files]  Node.js/Express
                   │
                   ▼
              [CI/CD Pipeline]
              GitHub Actions → Docker → Cloud (AWS/Azure/GCP)
```

The backend is containerized with **Docker**, enabling consistent environments across development, staging, and production. GitHub Actions automates build, test (Jest), and deployment pipelines on every push to `main`.

---

## 9. UML Diagrams

All UML diagrams are located in `docs/uml/`:

| Diagram | File | Description |
|---|---|---|
| Use Case Diagram | `use-case-diagram.svg` | Actors and their interactions with the system |
| Class Diagram | `class-diagram.svg` | Data models and their relationships |
| Activity Diagram | `activity-diagram.svg` | End-to-end order placement workflow |
| Sequence Diagram | `sequence-diagram.svg` | Message flow between Buyer, System, Farmer, Transporter |

---

## 10. Key Design Decisions

1. **MongoDB over SQL** — Flexible document schema suits the evolving product/order structures and handles nested population efficiently.
2. **JWT Stateless Auth** — No session storage needed; scales horizontally without shared session state.
3. **Role-based routing** — Each actor type (farmer/buyer/transporter) has dedicated endpoints, keeping business logic clean and auditable.
4. **Status enum on Order** — A controlled state machine prevents invalid transitions and simplifies frontend rendering.
5. **Mongoose refs + populate** — Avoids data duplication while keeping queries readable and performant for this scale.

# API Testing Guide

This guide provides examples for testing all API endpoints using cURL or tools like Postman.

## Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** `https://yourdomain.com/api`

## Products API

### 1. Get All Products

```bash
curl -X GET http://localhost:5000/api/products
```

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

### 2. Get Single Product

```bash
curl -X GET http://localhost:5000/api/products/{productId}
```

### 3. Create Product

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Wool Cardigan",
    "description": "High-quality wool cardigan perfect for Nigerian weather",
    "price": 15000,
    "category": "Cardigan",
    "featured": true,
    "variants": [
      {
        "size": "Large",
        "color": "Burgundy Wool",
        "stock": 25
      },
      {
        "size": "Medium",
        "color": "Burgundy Wool",
        "stock": 30
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Premium Wool Cardigan",
    "price": 15000,
    "variants": [...],
    "totalStock": 55
  }
}
```

### 4. Update Product

```bash
curl -X PUT http://localhost:5000/api/products/{productId} \
  -H "Content-Type: application/json" \
  -d '{
    "price": 16000,
    "featured": false
  }'
```

### 5. Delete Product

```bash
curl -X DELETE http://localhost:5000/api/products/{productId}
```

### 6. Upload Product Images

```bash
curl -X POST http://localhost:5000/api/products/{productId}/images \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    ]
  }'
```

**Note:** Images should be base64 encoded strings.

## Shipping Rates API

### 1. Get All Shipping Rates

```bash
curl -X GET http://localhost:5000/api/shipping
```

### 2. Get Rate by State

```bash
curl -X GET http://localhost:5000/api/shipping/Lagos
```

### 3. Create/Update Shipping Rate

```bash
curl -X POST http://localhost:5000/api/shipping \
  -H "Content-Type: application/json" \
  -d '{
    "state": "Lagos",
    "rate": 2500,
    "estimatedDays": "1-2 business days"
  }'
```

### 4. Update Shipping Rate

```bash
curl -X PUT http://localhost:5000/api/shipping/{rateId} \
  -H "Content-Type: application/json" \
  -d '{
    "rate": 3000
  }'
```

### 5. Delete Shipping Rate

```bash
curl -X DELETE http://localhost:5000/api/shipping/{rateId}
```

## Analytics API

### 1. Get Dashboard Analytics

```bash
curl -X GET http://localhost:5000/api/analytics/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "totalRevenue": 2250000,
    "topVariants": [
      {
        "_id": {
          "size": "Large",
          "color": "Burgundy Wool"
        },
        "totalSold": 45,
        "revenue": 675000
      }
    ],
    "recentOrders": [...],
    "monthlyRevenue": [...],
    "lowStockProducts": [...]
  }
}
```

### 2. Get Sales by Period

```bash
# Get weekly sales
curl -X GET "http://localhost:5000/api/analytics/sales?period=week"

# Get monthly sales
curl -X GET "http://localhost:5000/api/analytics/sales?period=month"

# Get today's sales
curl -X GET "http://localhost:5000/api/analytics/sales?period=today"

# Get yearly sales
curl -X GET "http://localhost:5000/api/analytics/sales?period=year"
```

## Webhook API

### Paystack Webhook

This endpoint is called by Paystack when a payment is successful.

**Endpoint:** `POST /api/webhooks/paystack`

**Headers:**
- `x-paystack-signature`: HMAC SHA512 signature

**Payload Example:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "ORDER-123456",
    "amount": 17500,
    "customer": {
      "email": "customer@example.com"
    }
  }
}
```

## Validation Errors

When validation fails, you'll receive a 400 response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "price",
      "message": "Price must be greater than 0"
    },
    {
      "field": "variants",
      "message": "At least one variant is required"
    }
  ]
}
```

## Common Validation Rules

### Product
- `name`: Required, minimum 1 character
- `description`: Required, minimum 10 characters
- `price`: Required, must be positive number
- `variants`: Required, must have at least 1 variant
- `variants[].size`: Required, non-empty string
- `variants[].color`: Required, non-empty string
- `variants[].stock`: Required, non-negative integer

### Shipping Rate
- `state`: Required, non-empty string
- `rate`: Required, non-negative number
- `estimatedDays`: Optional string

## Testing with Postman

1. Import the following as a Postman collection
2. Set base URL as environment variable
3. Test each endpoint

### Environment Variables
```
BASE_URL = http://localhost:5000/api
```

## Testing Paystack Webhook Locally

Use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 5000
ngrok http 5000

# Use the ngrok URL in Paystack webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/paystack
```

## Health Check

```bash
curl -X GET http://localhost:5000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```


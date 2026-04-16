# Gokul Logistics Command Center

## Overview

A professional logistics dashboard that fetches live data from an n8n webhook and displays KPIs, a searchable tracking table, and admin actions.

## Features

### 1. Data Integration

- Fetch logistics data from `https://gokulsmenon.app.n8n.cloud/webhook/get-client-data` on page load
- Auto-refresh capability with loading/error states

### 2. KPI Header Cards

Four stat cards with icons:

- **Total Invoices** — count of all entries
- **Delivery Success** — % of "Completed" status rows
- **POD Compliance** — % of rows with non-empty POD field
- **Active Shipments** — count of "PENDING" status rows

### 3. Detailed Tracking Table

- Columns: Date, Invoice No, Customer Name, Route (From/To), Status
- Color-coded status badges: Yellow (PENDING), Green (Completed), Red (Return)
- Search bar filtering by Invoice No or Customer Name

### 4. Admin Actions

- "Mark as Delivered" button per row (visible only for non-Completed rows)
- Sends POST to n8n backend to update status, then refreshes data

### 5. Design

- Dark/light mode toggle
- Professional dark theme by default with high-contrast text
- Fully mobile-responsive layout
- Clean typography and spacing
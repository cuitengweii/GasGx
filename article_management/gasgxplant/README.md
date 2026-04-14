# GasGx Plant Dashboard

## 1) Setup

```powershell
cd D:\code\GasGx\article_management\gasgxplant
python -m pip install pymysql
```

## 2) Configure DB

PowerShell (current session):

```powershell
$env:GASGX_DB_HOST='47.77.201.76'
$env:GASGX_DB_PORT='65506'
$env:GASGX_DB_NAME='demo_linkplant'
$env:GASGX_DB_USER='demo_linkplant'
$env:GASGX_DB_PASSWORD='your_password_here'
```

## 3) Run

```powershell
python .\server.py
```

Open:

- `http://127.0.0.1:8096/`

## Features

- Device filter
- Time range filter
- Multi-parameter independent curves
- Zoom and pan

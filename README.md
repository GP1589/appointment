# Appointment API

API para gestión de citas médicas con seguimiento de estado y datos de programación.

## 📌 Endpoints

### Repositorios asociados

`https://github.com/GP1589/appointment_pe`
`https://github.com/GP1589/appointment_cl`


![Diagrama de la arquitectura del sistema](image.png)


### URL
`https://3nynf5zwrg.execute-api.us-east-1.amazonaws.com/Stage/`

### Crear una nueva cita
`POST {{url}}/appointment/create`

**Request Body:**
```json
{
  "insuredId": "00012",
  "scheduleId": 16,
  "status": "pending",
  "countryISO": "CL",
  "scheduleData": {
    "centerId": 2,
    "specialtyId": 8,
    "medicId": 4,
    "date": "2024-09-30T12:30:00Z"
  }
}
```



### Obtener citas por insuredId
`GET {{url}}/appointment/getAppointmentsByInsuredId/{insuredId}`

**Example Response:**
```json
{
    "data": [
        {
            "createdAt": "2025-07-09T03:10:24.894Z",
            "insuredId": "00011",
            "scheduleData": {
                "date": "2024-09-30T12:30:00Z",
                "centerId": 2,
                "medicId": 4,
                "specialtyId": 8
            },
            "scheduleId": 15,
            "countryISO": "PE",
            "status": "completed"
        },
        {
            "insuredId": "00011",
            "createdAt": "2025-07-09T03:45:32.639Z",
            "scheduleData": {
                "date": "2024-09-30T12:30:00Z",
                "centerId": 2,
                "medicId": 4,
                "specialtyId": 8
            },
            "scheduleId": 26,
            "countryISO": "CL",
            "status": "pending"
        }
    ],
    "isSuccess": true,
    "message": "Citas recuperadas"
}
```
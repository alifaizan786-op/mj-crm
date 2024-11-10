# API Documentation

<details>
<summary><strong>1. Create User</strong></summary>

**Route**: `/api/user/`  
**Method**: POST

### Sample Request Body:

```json
{
  "firstName": "john",
  "lastName": "doe",
  "employeeId": "john-jd",
  "department": "sales",
  "password": "john-jd",
  "active": true,
  "views": ["login"],
  "permissions": ["login"]
}
```

### Sample Response:

```json
{
  "firstName": "john",
  "lastName": "doe",
  "employeeId": "john-jd",
  "department": "sales",
  "password": "$2b$10$pRnKgfyYZA61OI6sbBiDEOOXyAsohwoZsyvSiUUtPLdXbwH1SkueO",
  "active": true,
  "views": ["login"],
  "permissions": ["login"],
  "_id": "67312d389bae14600dfcabb0",
  "__v": 0
}
```

### Example JavaScript Fetch:

```javascript
const createUser = async (
  firstName,
  lastName,
  employeeId,
  department,
  password,
  active,
  views,
  permissions
) => {
  try {
    const response = await fetch('/api/user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        employeeId,
        department,
        password,
        active,
        views,
        permissions,
      }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    return error;
  }
};
```

</details>

<details>
<summary><strong>2. User Login</strong></summary>

**Route**: `/api/user/login`  
**Method**: POST

### Sample Request Body:

```json
{
  "employeeId": "john-jd",
  "password": "john-jd"
}
```

### Sample Response:

```json
{
  "user": {
    "_id": "67312d389bae14600dfcabb0",
    "firstName": "john",
    "lastName": "doe",
    "employeeId": "john-jd",
    "department": "sales",
    "password": "$2b$10$pRnKgfyYZA61OI6sbBiDEOOXyAsohwoZsyvSiUUtPLdXbwH1SkueO",
    "active": true,
    "views": ["login"],
    "permissions": ["login"],
    "__v": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY3MzEyZDM4OWJhZTE0NjAwZGZjYWJiMCIsImZpcnN0TmFtZSI6ImpvaG4iLCJsYXN0TmFtZSI6ImRvZSIsImVtcGxveWVlSWQiOiJqb2huLWpkIiwiZGVwYXJ0bWVudCI6InNhbGVzIiwidmlld3MiOlsibG9naW4iXSwicGVybWlzc2lvbnMiOlsibG9naW4iXX0sImlhdCI6MTczMTI3NjIyNiwiZXhwIjoxNzMxMzA1MDI2fQ.kDVK1SprsjB9GRjbrQ9hWkm13a3Bl7fwUr-agWOyu80"
}
```

### Example JavaScript Fetch:

```javascript
const loginHandler = async (employeeId, password) => {
  try {
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId, password }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    return error;
  }
};
```

</details>

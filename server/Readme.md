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

<details> <summary><strong>3. Get All Users</strong></summary>

**Route**: `/api/user/`

**Method**: GET

### Sample Response:

```json
[
  {
    "_id": "67312d389bae14600dfcabb0",
    "firstName": "john",
    "lastName": "doe",
    "employeeId": "john-jd",
    "department": "sales",
    "password": "$2b$10$pRnKgfyYZA61OI6sbBiDEOOXyAsohwoZsyvSiUUtPLdXbwH1SkueO",
    "active": true,
    "views": [
      "login",
      "/Client",
      "/Client/LookUp",
      "/Client/:id",
      "/Client/Reports",
      "/Client/Reports/Birthday",
      "/Client/Reports/RewardsPoints",
      "/Client/Reports/Mailing",
      "/Users/",
      "/Users/AllUsers",
      "/Users/:id"
    ],
    "permissions": ["login"],
    "__v": 0
  },
  {
    "_id": "673e3692affa125ad0598fad",
    "firstName": "jane",
    "lastName": "doe",
    "employeeId": "jane-jd",
    "department": "IT",
    "password": "$2b$10$rDsCRch05Aqvm2Z7gKb54Okc3BR.Lzr7lcE5FBh7Fcs2kTuLYjMjW",
    "active": false,
    "views": ["login"],
    "permissions": ["login"],
    "__v": 0
  }
]
```

### Example JavaScript Fetch:

```Javascript
const getAllUsers = async () => {
  try {
    const response = await fetch('/api/user/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
<summary><strong>4. Get User By ID</strong></summary>

**Route**: `/api/user/:id`  
**Sample Route**: `/api/user/67312d389bae14600dfcabb0`  
**Method**: GET

### Sample Request Body:

```json
{
  "_id": "67312d389bae14600dfcabb0",
  "firstName": "john",
  "lastName": "doe",
  "employeeId": "john-jd",
  "department": "sales",
  "password": "$2b$10$pRnKgfyYZA61OI6sbBiDEOOXyAsohwoZsyvSiUUtPLdXbwH1SkueO",
  "active": true,
  "views": [
    "login",
    "/Client",
    "/Client/LookUp",
    "/Client/:id",
    "/Client/Reports",
    "/Client/Reports/Birthday",
    "/Client/Reports/RewardsPoints",
    "/Client/Reports/Mailing",
    "/Users/",
    "/Users/AllUsers",
    "/Users/:id"
  ],
  "permissions": ["login"],
  "__v": 0
}
```

### Sample Response:

```json
{
  "_id": "67312d389bae14600dfcabb0",
  "firstName": "john",
  "lastName": "doe",
  "employeeId": "john-jd",
  "department": "sales",
  "password": "$2b$10$pRnKgfyYZA61OI6sbBiDEOOXyAsohwoZsyvSiUUtPLdXbwH1SkueO",
  "active": true,
  "views": [
    "login",
    "/Client/LookUp",
    "/Client/:id",
    "/Client",
    "/Users/:id",
    "/Users/"
  ],
  "permissions": ["login"],
  "__v": 0
}
```

### Example JavaScript Fetch:

```javascript
const getUserById = async (id) => {
  try {
    const response = await fetch(`/api/user/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
<summary><strong>5. Update User By ID</strong></summary>

**Route**: `/api/user/:id`  
**Sample Route**: `/api/user/67312d389bae14600dfcabb0`  
**Method**: PUT

### Sample Request Body:

```json
{
  "_id": "67312d389bae14600dfcabb0",
  "firstName": "john",
  "lastName": "doe",
  "employeeId": "john-jd",
  "department": "sales",
  "password": "$2b$10$pRnKgfyYZA61OI6sbBiDEOOXyAsohwoZsyvSiUUtPLdXbwH1SkueO",
  "active": true,
  "views": [
    "login",
    "/Client",
    "/Client/LookUp",
    "/Client/:id",
    "/Client/Reports",
    "/Client/Reports/Birthday",
    "/Client/Reports/RewardsPoints",
    "/Client/Reports/Mailing",
    "/Users/",
    "/Users/AllUsers",
    "/Users/:id"
  ],
  "permissions": ["login"],
  "__v": 0
}
```

### Sample Response :

```json
{
  "_id": "67312d389bae14600dfcabb0",
  "firstName": "john",
  "lastName": "doe",
  "employeeId": "john-jd",
  "department": "sales",
  "password": "$2b$10$pRnKgfyYZA61OI6sbBiDEOOXyAsohwoZsyvSiUUtPLdXbwH1SkueO",
  "active": true,
  "views": [
    "login",
    "/Client",
    "/Client/LookUp",
    "/Client/:id",
    "/Client/Reports",
    "/Client/Reports/Birthday",
    "/Client/Reports/RewardsPoints",
    "/Client/Reports/Mailing",
    "/Users/",
    "/Users/AllUsers",
    "/Users/:id"
  ],
  "permissions": ["login"],
  "__v": 0
}
```

### Example JavaScript Fetch:

```javascript
const updateUserById = async (id, userData) => {
  try {
    const response = await fetch(`/api/user/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
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
<summary><strong>6. Archive/Delete User By ID</strong></summary>

**Route**: `/api/user/:id`  
**Sample Route**: `/api/user/673e3692affa125ad0598fad`  
**Method**: DELETE

### Sample Response:

```json
{
  "message": "User Deactivated Successfully",
  "user": {
    "_id": "673e3692affa125ad0598fad",
    "firstName": "jane",
    "lastName": "doe",
    "employeeId": "jane-jd",
    "department": "IT",
    "password": "$2b$10$rDsCRch05Aqvm2Z7gKb54Okc3BR.Lzr7lcE5FBh7Fcs2kTuLYjMjW",
    "active": false,
    "views": ["login"],
    "permissions": ["login"],
    "__v": 0
  }
}
```

### Example JavaScript Fetch:

```javascript
const deleteUserById = async (id) => {
  try {
    const response = await fetch(`/api/user/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
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

# Data Processing

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [API Routes](#api-routes)
  - [GET /api/requests](#get-apirequests)
  - [POST /api/upload/csv](#post-apiuploadcsv)
- [Error Handling](#error-handling)
  - [404: Not Found](#404-not-found)
  - [400: Internal Server Error](#400-internal-server-error)
  - [500: Internal Server Error](#500-internal-server-error)
  - [422: Unprocessable Entity](#422-unprocessable-entity)
- [License](#license)

## Description

This is a simple API that allows users to upload a CSV file and get a report of all requests currently in the database.

## Installation

To install dependencies:

```bash
bun install
```

## Usage

To run:

```bash
bun start
```

This project was created using `bun init` in bun v1.0.30. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Documentation

### API Routes

#### GET /api/requests

returns a report of all requests currently in the database.

- Request:
  - None

- Response:

```JSON
    {
        "status": 200,
        "message": "Data Report",
        "details": {
            "tables": "allCounts",
        },
    }
    ```

Where `allCounts` is an object with the following structure:

```JSON
"allRequests": [
        {
          "Amount": 499
        }
      ],
      "licenses": [
        {
          "Amount": 99
        }
      ],
      "accounts": [
        {
          "Amount": 51
        }
      ],
      "inspections": [
        {
          "Amount": 23
        }
      ],
      "activities": [
        {
          "Amount": 204
        }
      ],
      "stamps": [
        {
          "Amount": 122
        }
      ]
```

#### POST /api/upload/csv

uploads a CSV file to the database.

- Request:
  - Form Data:
    - `csv`: a CSV file

- Response:

```JSON
    {
        "status": 200,
        "message": "Data uploaded successfully",
        "details": {
            "tables": allCounts,
        },
    }
    ```

Where `allCounts` is an object with the following structure:

```JSON
"allRequests": [
        {
          "Amount": 499
        }
      ],
      "licenses": [
        {
          "Amount": 99
        }
      ],
      "accounts": [
        {
          "Amount": 51
        }
      ],
      "inspections": [
        {
          "Amount": 23
        }
      ],
      "activities": [
        {
          "Amount": 204
        }
      ],
      "stamps": [
        {
          "Amount": 122
        }
      ]
```

### Error Handling

#### 404: Not Found

- Response:

```JSON
  {
      "status": 404,
      "message": "Route not found",
      "details": "The route you are trying to access does not exist",
  }
  ```

#### 400: Internal Server Error

- Response:

```JSON
    {
        "status": 400,
        "statusText": "Bad Request",
        "message": "Human readable error message",
        "error" : "Error message",
    }
```

#### 500: Internal Server Error

- Response:

```JSON
    {
        "status": 500,
        "statusText": "Internal Server Error",
        "message": "Human readable error message",
        "error" : "Error message",
    }
```

#### 422: Unprocessable Entity

- Response:

```JSON
  {
      "status": 422,
      "statusText": "Unprocessable Entity",
      "message": "Human readable error message",
      "error" : "Error message",
  }
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

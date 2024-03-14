# Data Processing

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [API Routes](#api-routes)
  - [GET /api/report](#get-apireport)
  - [GET /api/select/:table](#get-apiselecttable)
  - [POST /api/upload/csv](#post-apiuploadcsv)
- [Error Handling](#error-handling)
  - [404: Not Found](#404-not-found)
  - [400: Internal Server Error](#400-internal-server-error)
  - [422: Unprocessable Entity](#422-unprocessable-entity)
  - [500: Internal Server Error](#500-internal-server-error)
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

#### GET /api/report

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

#### GET /api/select/:table

returns a report of all values in a specific table currently in the database.

- Request:
  - URL Parameters:
    - `table`: the name of the table to get the report from

- Response:

```JSON
{
  "status": 200,
  "message": "Data Report",
  "count": 204,
  "details": {
    "data": [data]
  }
}
```

where `data` is an array of objects based on the table.

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

### Server Errors

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

### Error Handling

Type enforcement is handled using TypeScript. The API will return a 422 error if the request is not properly formatted. The API will also store the data using proper types, which can be found in the [model](./models/) files. Every schema is accounted for using a model.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

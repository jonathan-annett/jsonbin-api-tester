# JSONBinAPI Wrapper Documentation

This document provides details on the JSONBinAPI wrapper, its functions, and how to use it. The wrapper includes CRUD operations, encryption features, and mock mode for development.

## Overview

The JSONBinAPI wrapper simplifies interactions with the JSONBin.io REST API by providing a set of functions to create, retrieve, update, and delete storage bins. It also includes optional encryption for sensitive data. The wrapper supports a mock mode for local development, allowing the same code to be used with real API keys for production.

## Functions

### CRUD Functions

1. **createStorageBin(data)**
    - Creates a new storage bin with the provided data.
    - Parameters:
        - `data`: The JSON data to store in the new bin.
    - Returns: A promise that resolves with the response from the JSONBin.io API.

    ```javascript
    api.createStorageBin({ name: "example", value: 42 }).then(response => {
        console.log("Created Bin:", response);
    }).catch(error => {
        console.error("Error:", error);
    });
    ```

2. **retrieveStorageBin(id)**
    - Retrieves data from an existing storage bin using its ID.
    - Parameters:
        - `id`: The ID of the storage bin to retrieve.
    - Returns: A promise that resolves with the response from the JSONBin.io API.

    ```javascript
    api.retrieveStorageBin("bin-id").then(response => {
        console.log("Retrieved Bin:", response);
    }).catch(error => {
        console.error("Error:", error);
    });
    ```

3. **updateStorageBin(id, data)**
    - Updates data in an existing storage bin using its ID.
    - Parameters:
        - `id`: The ID of the storage bin to update.
        - `data`: The new JSON data to store in the bin.
    - Returns: A promise that resolves with the response from the JSONBin.io API.

    ```javascript
    api.updateStorageBin("bin-id", { name: "updated example", value: 43 }).then(response => {
        console.log("Updated Bin:", response);
    }).catch(error => {
        console.error("Error:", error);
    });
    ```

4. **deleteStorageBin(id)**
    - Deletes an existing storage bin using its ID.
    - Parameters:
        - `id`: The ID of the storage bin to delete.
    - Returns: A promise that resolves with the response from the JSONBin.io API.

    ```javascript
    api.deleteStorageBin("bin-id").then(response => {
        console.log("Deleted Bin:", response);
    }).catch(error => {
        console.error("Error:", error);
    });
    ```

### Encryption Functions

1. **genKeys()**
    - Generates and stores encryption keys in local storage.
    - Returns: A promise that resolves with the stored key data.

    ```javascript
    api.genKeys().then(keyData => {
        console.log("Generated Keys:", keyData);
    });
    ```

2. **revokeKeys()**
    - Removes the encryption keys from local storage.

    ```javascript
    api.revokeKeys();
    ```

3. **loadKeys(keyData)**
    - Loads encryption keys from provided key data or from local storage.
    - Parameters:
        - `keyData` (optional): JSON string of key data to load.
    - Returns: A promise that resolves when the keys are loaded.

    ```javascript
    api.loadKeys().then(() => {
        console.log("Keys Loaded");
    });
    ```

4. **encrypt(data)**
    - Encrypts the provided data.
    - Parameters:
        - `data`: The JSON data to encrypt.
    - Returns: A promise that resolves with the encrypted data.

    ```javascript
    api.encrypt({ name: "secret", value: 42 }).then(encryptedData => {
        console.log("Encrypted Data:", encryptedData);
    });
    ```

5. **decrypt(encryptedData)**
    - Decrypts the provided encrypted data.
    - Parameters:
        - `encryptedData`: The data to decrypt.
    - Returns: A promise that resolves with the decrypted data.

    ```javascript
    api.decrypt(encryptedData).then(decryptedData => {
        console.log("Decrypted Data:", decryptedData);
    });
    ```

### Mock Mode

The JSONBinAPI wrapper includes a mock mode for local development. In mock mode, all data is stored in-memory and optionally in local storage, simulating interactions with the JSONBin.io API without making actual network requests. This allows you to develop and test your code locally before using real API keys.

#### Using Mock Mode

1. **Default Mock Mode**
    - By default, the wrapper operates in mock mode if no API keys are provided.

    ```javascript
    const api = JSONBinAPI();
    ```

2. **Using Real API Keys**
    - To switch from mock mode to real API interactions, provide your Master and Access API keys.

    ```javascript
    const api = JSONBinAPI(accessApiKey, masterApiKey);
    ```

In both cases, the same code can be used, and you can seamlessly switch between mock and real modes by adding or removing API keys.

## Example Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSONBinAPI CRUD Tester</title>
    <script src="jsonbin.js"></script>
    <script src="testapi.js"></script>
</head>
<body>
    <h1>JSONBinAPI CRUD Tester</h1>

    <!-- Your UI Elements -->

    <script>
        const masterApiKey = localStorage.getItem("masterApiKey") || "";
        const accessApiKey = localStorage.getItem("accessApiKey") || "";
        const api = JSONBinAPI(accessApiKey, masterApiKey);
    </script>
</body>
</html>

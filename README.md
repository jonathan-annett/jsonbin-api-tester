# jsonbin-api-tester

[live demo](https://github.com/jonathan-annett/jsonbin-api-tester)

This project provides a simple web interface to test CRUD operations with JSONBinAPI. It allows users to create, retrieve, update, and delete storage bins, with optional encryption. The tool also supports saving and forgetting API keys, making it a versatile tool for working with JSONBin.io's API.

## Features

- **Create Storage Bin**: Add JSON data to create a new storage bin.
- **Retrieve Storage Bin**: Fetch and display data from an existing storage bin using its ID.
- **Update Storage Bin**: Modify data in an existing storage bin using its ID.
- **Delete Storage Bin**: Remove an existing storage bin using its ID.
- **Encryption**: Optionally encrypt and decrypt data using AES-GCM before storing it in JSONBin.io.
- **API Key Management**: Save and forget Master and Access API keys.
- **Local Storage Persistence**: Persistently store and retrieve the last used bin ID, API keys, and JSON data across sessions.
- **User-Friendly UI**: Interactive interface with input fields, buttons, and real-time feedback.
- **Background Indicator**: Background color changes based on the presence of API keys (`red` for master key, `yellow` for access key).

## Getting Started

### Prerequisites

- Web Browser
- Python (for simple HTTP server) or Node.js (for http-server)

### Usage

1. **Clone the Repository**

    ```sh
    git clone https://github.com/jonathan-annett/jsonbin-api-tester.git
    cd jsonbin-api-tester
    ```

2. **Start a Local Server**

    - **Using Python:**

      ```sh
      # Python 3.x
      python -m http.server 8000

      # Python 2.x
      python -m SimpleHTTPServer 8000
      ```

    - **Using Node.js:**

      ```sh
      npm install -g http-server
      http-server -p 8000
      ```

3. **Open the Web Interface**

    Open `http://localhost:8000` in your preferred web browser.

4. **Set API Keys**

    - Enter your Master API Key and Access API Key in the provided input fields.
    - Click "Save API Keys" to store the keys in local storage and reload the page.

5. **Enable Encryption (Optional)**

    - Check the "Enable Encryption" checkbox to enable encryption for data stored in JSONBin.io.

6. **Perform CRUD Operations**

    - Use the provided interface to create, retrieve, update, and delete storage bins.

### File Structure

- `index.html`: Main HTML file with the interface and input fields for testing JSONBinAPI.
- `testapi.js`: JavaScript file containing the logic for handling user inputs, performing CRUD operations, and managing encryption.
- `jsonbin.js`: JavaScript file containing the mock JSONBinAPI implementation for local testing.

### Screenshots

![JSONBinAPI CRUD Tester](screenshot.png)

### Contributing

Feel free to submit issues and pull requests. Contributions are welcome!

### License

This project is licensed under the MIT License.

### Acknowledgements

- [JSONBin.io](https://jsonbin.io) for providing a simple and powerful JSON storage API.

---


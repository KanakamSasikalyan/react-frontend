# React Clothing Design Generator

This project is a React.js frontend application that interacts with a Spring Boot backend to generate clothing designs based on user input. 

## Project Structure

```
react-frontend
├── public
│   ├── index.html          # Main HTML file for the React application
│   └── favicon.ico         # Favicon for the application
├── src
│   ├── components          # Contains React components
│   │   ├── DesignForm.jsx  # Form for user input to generate designs
│   │   └── DesignDisplay.jsx # Displays the generated design image
│   ├── services            # Contains API service functions
│   │   └── api.js         # Function to call the backend API
│   ├── App.jsx             # Main application component
│   ├── index.js            # Entry point of the React application
│   └── styles              # Contains CSS styles
│       └── App.css        # Styles for the application
├── package.json            # Configuration file for npm
├── .gitignore              # Specifies files to ignore by Git
└── README.md               # Documentation for the project
```

## Getting Started with repo

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd react-frontend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

4. **Access the application:**
   Open your browser and go to `http://localhost:3000`.

## Usage

- Use the form in the application to input a prompt and select a style for the clothing design.
- Upon submission, the application will call the Spring Boot backend to generate a design based on the provided input.
- The generated design will be displayed on the screen.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you would like to add.

## License

This project is licensed under the MIT License.
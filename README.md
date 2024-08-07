# Pantry System

A user-friendly web application to manage pantry inventory, track item quantities, and monitor expiration dates. Built with Next.js and Firebase, featuring image recognition for easy item addition.

## Features

- **Inventory Management:** Add, update, and remove pantry items with ease.
- **Search Functionality:** Quickly find items in your pantry by name.
- **Expiration Tracking:** Keep track of item expiration dates.
- **Image Recognition:** Add items using a camera or photo with built-in image recognition.
- **Responsive Design:** Access your pantry from any device.

## Technologies Used

- **Frontend:** Next.js, React, Material-UI
- **Backend:** Firebase Firestore
- **Image Recognition:** Axios (for API calls)

## Getting Started

### Prerequisites

- Node.js
- Firebase account
- Image recognition API (replace placeholder URL in the code)

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/Jadalriyabi/Pantry-Project.git
   cd Pantry-Project```

2. **Install dependencies:**

```sh
npm install
```

3. **Set up image recognition API:**

Replace YOUR_IMAGE_RECOGNITION_API_URL and YOUR_LLAMA_API_URL with your image recognition and LLaMA API endpoints in the analyzeImage function.

4. **Running the Application:**

```sh
npm run dev
```

Open your browser and navigate to http://localhost:3000 to see the application in action.

5. **Usage:**
  
  Add New Item: Click on the "Add New Item" button, fill out the details, and click "Add."
  Add with Camera: Click on the "Add with Camera" button, upload a photo, and let the image recognition handle the rest.
  Search Items: Use the search bar to filter items in the inventory.
  Remove Item: Click "Remove" next to an item to decrease its quantity or delete it.
 

6. **Contributing:**
  Contributions are welcome! Please fork the repository and create a pull request with your changes.

License
This project is licensed under the MIT License.

Author
Jad Alriyabi


This format ensures consistency throughout the file, making it easy to read and navigate.

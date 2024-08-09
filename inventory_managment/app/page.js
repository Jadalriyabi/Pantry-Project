"use client";

import { Box, Typography, Link, CircularProgress, Snackbar, Alert, TextField, Button, Modal, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { GitHub, LinkedIn } from "@mui/icons-material";
import { useState, useEffect } from "react";
import axios from "axios";
import { firestore } from "@/firebase";
import { collection, query, getDocs, getDoc, doc, setDoc, deleteDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false); // State for camera modal
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [processing, setProcessing] = useState(false);

  const updateInventory = async () => {
    try {
      setLoading(true);
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch inventory data');
      setLoading(false);
    }
  };

  const addItem = async (item, quantity, expiryDate) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity: existingQuantity } = docSnap.data();
        await setDoc(docRef, { quantity: existingQuantity + quantity, expiryDate });
      } else {
        await setDoc(docRef, { quantity, expiryDate });
      }

      await updateInventory();
    } catch (err) {
      setError('Failed to add item');
    }
  };

  const removeItem = async () => {
    try {
      const item = itemToRemove;
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity > 1) {
          await setDoc(docRef, { quantity: quantity - 1 });
        } else {
          await deleteDoc(docRef);
        }
      }

      setItemToRemove(null);
      setConfirmationOpen(false);
      await updateInventory();
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCameraOpen = () => setCameraOpen(true); // Open camera modal
  const handleCameraClose = () => setCameraOpen(false); // Close camera modal
  const handleConfirmationOpen = (item) => {
    setItemToRemove(item);
    setConfirmationOpen(true);
  };
  const handleConfirmationClose = () => setConfirmationOpen(false);

  // Function to handle image file change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Function to analyze image using a separate image recognition API
  const analyzeImage = async (file) => {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use an image recognition API to get a description
      const imageResponse = await axios.post('YOUR_IMAGE_RECOGNITION_API_URL', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageDescription = imageResponse.data.description || 'Unknown Item';

      // Use LLaMA to process the image description
      const llamaResponse = await axios.post('YOUR_LLAMA_API_URL', { text: imageDescription });
      const item = llamaResponse.data.processedText || imageDescription;

      await addItem(item, 1, ''); // Add item to inventory with default values
    } catch (error) {
      setError('Failed to analyze image');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex"
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      gap={2}
      sx={{ 
        backgroundImage: 'url(background.jpg)', // Replace with the actual path to your image
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Typography variant="h2" color="#333" sx={{ mb: 2, fontWeight: 'bold' }}>
        PantryPal
      </Typography>
      <Typography variant="h6" color="#333" sx={{ mb: 2 }}>
        Keep track of your pantry items, their quantities, and expiration dates effortlessly.
      </Typography>
      {loading && <CircularProgress />}
      {processing && <CircularProgress />}
      {error && <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>}

      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search Pantry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ borderRadius: '18px', flex: 1 }}
        />
        <Button 
          variant="contained" 
          onClick={handleOpen}
          sx={{ borderRadius: '16px' }} // Rounded corners for button
        >
          Add New Item
        </Button>
        <Button 
          variant="contained" 
          onClick={handleCameraOpen}
          sx={{ borderRadius: '16px' }} // Rounded corners for button
        >
          Add with Camera
        </Button>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box 
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #0004"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
            borderRadius: '16px'
          }}
        >
          <Typography variant="h6">Add item</Typography>
          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              label="Item Name"
              sx={{ borderRadius: '16px' }} // Rounded corners for text field
            />
            <TextField
              variant="outlined"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              label="Quantity"
              type="number"
              inputProps={{ min: 1 }}
              sx={{ borderRadius: '16px' }} // Rounded corners for text field
            />
            <TextField
              variant="outlined"
              fullWidth
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              label="Expiry Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              sx={{ borderRadius: '16px' }} // Rounded corners for text field
            />
            <Button 
              variant="outlined" 
              onClick={() => {
                addItem(itemName, quantity, expiryDate);
                setItemName('');
                setQuantity(1);
                setExpiryDate('');
                handleClose();
              }}
              sx={{ borderRadius: '16px' }} // Rounded corners for button
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={cameraOpen} onClose={handleCameraClose}>
        <Box 
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #0004"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
            borderRadius: '16px'
          }}
        >
          <Typography variant="h6">Add with Camera</Typography>
          <Stack width="100%" direction="column" spacing={2}>
            <Button 
              variant="contained" 
              component="label"
              sx={{ borderRadius: '16px' }} // Rounded corners for button
            >
              Choose Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            <Button 
              variant="contained"
              onClick={() => analyzeImage(imageFile)}
              disabled={processing || !imageFile}
              sx={{ borderRadius: '16px' }} // Rounded corners for button
            >
              {processing ? 'Processing...' : 'Analyze Image'}
            </Button>
          </Stack>
          {imagePreview && (
            <Box mt={2}>
              <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '16px' }} /> {/* Rounded corners for image */}
            </Box>
          )}
        </Box>
      </Modal>

      <Box border="1px solid #333" width="800px" sx={{ borderRadius: '16px' }}> {/* Rounded corners for inventory box */}
        <Box 
          height="100px"
          bgcolor="#ADD8E6"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ borderRadius: '16px 16px 0 0' }} // Rounded corners for top part of inventory box
        >
          <Typography variant="h3" color="#333" sx={{ mb: 2, fontWeight: 'bold' }}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="100%" spacing={2} overflow="auto" sx={{ borderRadius: '0 0 16px 16px' }}> {/* Rounded corners for bottom part of inventory box */}
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding={2}
            bgcolor="#d0d0d0"
          >
            <Typography variant="h6" color="#333" sx={{ flex: 1, textAlign: 'center' }}>
              Item Name
            </Typography>
            <Typography variant="h6" color="#333" sx={{ flex: 1, textAlign: 'center' }}>
              Quantity
            </Typography>
            <Typography variant="h6" color="#333" sx={{ flex: 1, textAlign: 'center' }}>
              Expiry Date
            </Typography>
            <Typography variant="h6" color="#333" sx={{ flex: 1, textAlign: 'center' }}>
              Actions
            </Typography>
          </Box>
          {inventory
            .filter(({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(({ name, quantity, expiryDate }) => (
              <Box
                key={name}
                width="100%"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="#0000"
                padding={2}
                sx={{ borderRadius: '16px' }} // Rounded corners for each inventory item row
              >
                <Typography variant="h6" color="#333" sx={{ flex: 1, textAlign: 'center' }}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h6" color="#333" sx={{ flex: 1, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <Typography variant="h6" color="#333" sx={{ flex: 1, textAlign: 'center' }}>
                  {expiryDate}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ flex: 1, justifyContent: 'center' }}>
                  <Button variant="contained" onClick={() => addItem(name, 1, expiryDate)} sx={{ borderRadius: '16px' }}>
                    Add
                  </Button>
                  <Button variant="contained" onClick={() => handleConfirmationOpen(name)} sx={{ borderRadius: '16px' }}>
                    Remove
                  </Button>
                </Stack>
              </Box>
          ))}
        </Stack>
      </Box>

      <Dialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        sx={{ borderRadius: '16px' }} // Rounded corners for dialog
      >
        <DialogTitle>{"Confirm Item Removal"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this item from the inventory?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose} color="primary" sx={{ borderRadius: '16px' }}>
            Cancel
          </Button>
          <Button onClick={removeItem} color="primary" autoFocus sx={{ borderRadius: '16px' }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        width="100%"
        position="fixed"
        bottom={0}
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="#ADD8E6"
        py={2}
        sx={{ color: "white" }}
      >
        <Typography variant="body2" component="span" sx={{color: "black", mr: 1 }}>
          Jad Alriyabi © 2024
        </Typography>
        <Link href="https://github.com/Jadalriyabi/Pantry-Project" target="_blank" sx={{ color: "black", mx: 1 }}>
          <GitHub />
        </Link>
        <Link href="https://www.linkedin.com/in/jadalriyabi/" target="_blank" sx={{ color: "black", mx: 1 }}>
          <LinkedIn />
        </Link>
      </Box>
    </Box>
  );
}

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from "@mui/material";
import { collection, query, getDocs, getDoc, doc, setDoc, deleteDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1); 
  const [expiryDate, setExpiryDate] = useState(''); // State for expiry date
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

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
  const handleConfirmationOpen = (item) => {
    setItemToRemove(item);
    setConfirmationOpen(true);
  };
  const handleConfirmationClose = () => setConfirmationOpen(false);

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
        Pantry System
      </Typography>
      <Typography variant="h5" color="#333" sx={{ mb: 2 }}>
        Keep track of your pantry items, their quantities, and expiration dates effortlessly.
      </Typography>
      {loading && <CircularProgress />}
      {error && <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>}
      <TextField
        variant="outlined"
        placeholder="Search Pantry..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />
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
            />
            <TextField
              variant="outlined"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              label="Quantity"
              type="number"
              inputProps={{ min: 1 }}
            />
            <TextField
              variant="outlined"
              fullWidth
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              label="Expiry Date"
              type="date"
              InputLabelProps={{ shrink: true }}
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
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button 
        variant="contained" 
        onClick={handleOpen}
      >
        Add New Item
      </Button>
      <Box border="1px solid #333" width="800px">
        <Box 
          height="100px"
          bgcolor="#ADD8E6"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h3" color="#333" sx={{ mb: 2, fontWeight: 'bold' }}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="100%" spacing={2} overflow="auto">
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
                  <Button variant="contained" onClick={() => addItem(name, 1, expiryDate)}>
                    Add
                  </Button>
                  <Button variant="contained" onClick={() => handleConfirmationOpen(name)}>
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
      >
        <DialogTitle>{"Confirm Item Removal"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this item from the inventory?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose} color="primary">
            Cancel
          </Button>
          <Button onClick={removeItem} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
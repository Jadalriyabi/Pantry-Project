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

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
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
    >
      {loading && <CircularProgress />}
      {error && <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>}
      <TextField
        variant="outlined"
        placeholder="Search..."
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
            />
            <Button 
              variant="outlined" 
              onClick={() => {
                addItem(itemName);
                setItemName('');
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
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
        <Stack width="100%" height="300px" spacing={2} overflow="auto">
          {inventory
            .filter(({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(({ name, quantity }) => (
              <Box
                key={name}
                width="100%"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="#f0f0f0"
                padding={2}
              >
                <Typography 
                  variant="h6"
                  color="#333"
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography 
                  variant="h6"
                  color="#333"
                >
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="contained" 
                    onClick={() => addItem(name)}
                  >
                    Add
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={() => handleConfirmationOpen(name)}
                  >
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

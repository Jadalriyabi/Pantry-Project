// Add this at the top of your file to indicate this is a Client Component
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField } from "@mui/material";
import { collection, query, getDocs, getDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');

  const updateInventory = async () => {
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
    console.log(inventoryList);
  };

  const addItem =  async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      await setDoc(docRef, {quantity: quantity - 1})
    }

    await updateInventory()
  }

  const removeItem =  async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
      } else {
        await setDoc(docRef, {quantity: 1})
      }

    await updateInventory()
  }


  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      gap={2}
    >
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
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant = "outlined"
              fullwidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value)
              }}
            />
            <Button 
              variant ="outlined" 
              onClick={() =>{
                addItem(itemName)
                setItemName('')
                handleClose()
            }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Typography variant="h1">Inventory Management</Typography>
    </Box>
  )
}

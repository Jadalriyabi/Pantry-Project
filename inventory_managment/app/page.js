// Add this at the top of your file to indicate this is a Client Component
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Typography } from "@mui/material";
import { collection, query, getDocs } from "firebase/firestore";

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

  useEffect(() => {
    updateInventory();
  }, []);

  return (
    <Box>
      <Typography variant="h1">Inventory Management</Typography>
      {inventory.map((item, index) => (
        <Box key={index}>
          <Typography>{item.name}</Typography>
          <Typography>{item.count}</Typography>
        </Box>
      ))}
    </Box>
  );
}

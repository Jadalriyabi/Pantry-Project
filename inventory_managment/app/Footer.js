"use client";

import { Box, Typography, Link } from "@mui/material";
import { GitHub, LinkedIn } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      width="100%"
      position="absolute"
      bottom={0}
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#a4ce39" // Green background color
      py={2}
      sx={{ color: "white" }}
    >
      <Typography variant="body2" component="span" sx={{ mr: 1 }}>
        Jad Alriyabi © 2024
      </Typography>
      <Link href="https://github.com/Jadalriyabi" target="_blank" sx={{ color: "white", mx: 1 }}>
        <GitHub />
      </Link>
      <Link href="https://www.linkedin.com/in/jadalriyabi/" target="_blank" sx={{ color: "white", mx: 1 }}>
        <LinkedIn />
      </Link>
    </Box>
  );
};

export default Footer;
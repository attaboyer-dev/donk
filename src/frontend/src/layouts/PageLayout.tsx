import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#2c3e50" }}>
      <AppBar position="fixed" sx={{ backgroundColor: "#1a1a1a" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "#4caf50" }}>
            Donk Poker
          </Typography>
          <Button color="inherit" variant="outlined">
            Settings
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 8 }}>{children}</Container>
    </Box>
  );
};

export default PageLayout;

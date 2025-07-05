import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#2c3e50" }}>
      <AppBar position="static" sx={{ backgroundColor: "#1a1a1a", flexShrink: 0 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "#4caf50" }}>
            Donk Poker
          </Typography>
          <Button color="inherit" variant="outlined">
            Settings
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ flex: 1, p: 0, maxWidth: "none", overflow: "hidden" }}>{children}</Container>
    </Box>
  );
};

export default PageLayout;

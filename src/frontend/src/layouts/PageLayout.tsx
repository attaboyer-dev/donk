import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "honeydew" }}>
      <AppBar position="static" sx={{ backgroundColor: "#1a1a1a" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "#4caf50" }}>
            Donk Poker
          </Typography>
          <Button color="inherit" variant="contained" sx={{ mr: 2, backgroundColor: "#4caf50" }}>
            Join Game
          </Button>
          <Button color="inherit" variant="outlined">
            Settings
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default PageLayout;

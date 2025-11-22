// src/components/Layout.jsx
import { AppBar, Toolbar, Typography, Container, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
          >
            Queue System
          </Typography>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="xl"
        sx={{ flexGrow: 1, py: { xs: 2, md: 4 }, pb: { xs: 4, md: 6 } }}
      >
        {children}
      </Container>
    </Box>
  );
}

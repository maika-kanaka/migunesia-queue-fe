import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import EventListPage from "./pages/EventListPage.jsx";
import BoardPage from "./pages/BoardPage.jsx";
import LoketDisplayRouter from "./router/LoketDisplayRouter.jsx";
import LoketAdminPage from "./pages/LoketAdminPage.jsx";
import MultiDisplayRouter from "./router/MultiLoketDisplayRouter.jsx";
import { Box, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <EventListPage />
          </Layout>
        }
      />
      <Route
        path="/event/:eventId/board"
        element={
          <Layout>
            <BoardPage />
          </Layout>
        }
      />
      <Route
        path="/event/:eventId/loket/:loketId/display"
        element={<LoketDisplayRouter />}
      />
      <Route
        path="/loket/:loketId/admin"
        element={
          <Layout>
            <LoketAdminPage />
          </Layout>
        }
      />
      <Route
        path="/event/:eventId/display-all"
        element={<MultiDisplayRouter />}
      />
      <Route
        path="*"
        element={
          <Layout>
            <Box textAlign="center" mt={4}>
              <Typography variant="h5" gutterBottom>
                Halaman tidak ditemukan
              </Typography>
              <Button
                variant="contained"
                component={RouterLink}
                to="/"
                sx={{ mt: 2 }}
              >
                Kembali ke Beranda
              </Button>
            </Box>
          </Layout>
        }
      />
    </Routes>
  );
}

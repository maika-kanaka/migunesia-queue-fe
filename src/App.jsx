import { Routes, Route, HashRouter } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import EventListPage from "./pages/EventListPage.jsx";
import BoardPage from "./pages/BoardPage.jsx";
import LoketDisplayRouter from "./router/LoketDisplayRouter.jsx";
import LoketDisplayLedRouter from "./router/LoketDisplayLedRouter.jsx";
import LoketAdminPage from "./pages/LoketAdminPage.jsx";
import MultiDisplayRouter from "./router/MultiLoketDisplayRouter.jsx";
import MultiDisplayLedRouter from "./router/MultiLoketDisplayLedRouter.jsx";
import { Box, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function App() {
  return (
    <HashRouter>
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
          path="/event/:eventId/loket/:loketId/display/led"
          element={<LoketDisplayLedRouter />}
        />
        <Route
          path="/event/:eventId/loket/:loketId/admin"
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
          path="/event/:eventId/display-led-all"
          element={<MultiDisplayLedRouter />}
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
    </HashRouter>
  );
}

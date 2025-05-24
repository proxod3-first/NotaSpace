import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import { MainProvider } from "./context/MainContext";
import GlobalStyle from "./styles/global";

export default function App() {
  return (
    <MainProvider>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </MainProvider>
  );
}

import { useState } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { ethers } from "ethers"
import Navbar from "./components/Navbar"
import Landing from "./pages/Landing"
import Market from "./pages/Market"
import Create from "./pages/Create"
import MyNFTs from "./pages/MyNFTs"
import NFTDetail from "./pages/NFTDetail"
import Footer from "./components/Footer"
import bgImage from "./assets/bg.jpg"
import { AnimatePresence } from "framer-motion"
import "./App.css"

/* ---------- PAGE TRANSITIONS ---------- */
function AnimatedRoutes({ account, connectWallet }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Landing
              account={account}
              connectWallet={connectWallet}
            />
          }
        />
        <Route path="/market" element={<Market />} />
        <Route
          path="/create"
          element={<Create account={account} />}
        />
        <Route path="/my-nfts" element={<MyNFTs />} />
        <Route path="/nft/:nft/:tokenId" element={<NFTDetail />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const [account, setAccount] = useState(null)

  /* ---------- CONNECT ---------- */
  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not detected")
      return
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send("eth_requestAccounts", [])
    setAccount(accounts[0])
  }

  /* ---------- DISCONNECT ---------- */
  function disconnectWallet() {
    setAccount(null)
  }

  return (
    <BrowserRouter>
      <AppLayout
        account={account}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />
    </BrowserRouter>
  )
}

function AppLayout({ account, connectWallet, disconnectWallet }) {
  const location = useLocation()
  const isLanding = location.pathname === "/"

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 🔹 BLURRED BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* 🔹 DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/50" />

      {/* 🔹 MAIN CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ❌ HIDE NAVBAR ON LANDING */}
        {!isLanding && (
          <Navbar
            account={account}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
          />
        )}

        <main className={`flex-1 flex ${!isLanding ? "pt-20" : ""}`}>
          <AnimatedRoutes
            account={account}
            connectWallet={connectWallet}
          />
        </main>

        {!isLanding && <Footer />}
      </div>
    </div>
  )
}

export default App
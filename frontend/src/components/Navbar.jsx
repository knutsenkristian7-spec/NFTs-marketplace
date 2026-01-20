import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useState } from "react"

export default function Navbar({ account, connectWallet, disconnectWallet }) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 z-30 w-full bg-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center h-16">
          {/* LOGO */}
          <h1 className="flex-1 text-xl sm:text-2xl font-bold text-green-400 logo-gradient">
            NFT Marketplace
          </h1>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex gap-10 font-bold text-lg md:text-xl text-blue-500">
            <Link to="/" className="hover:text-yellow-700">Market</Link>
            <Link to="/create" className="hover:text-green-700">Create</Link>
            <Link to="/my-nfts" className="hover:text-red-600">My NFTs</Link>
          </div>

          {/* DESKTOP WALLET */}
          <div className="hidden md:flex flex-1 justify-end">
            {account ? (
              <motion.button
                onClick={disconnectWallet}
                className="bg-green-600 px-5 py-2 rounded font-semibold text-white"
              >
                Disconnect · {account.slice(0, 6)}...{account.slice(-4)}
              </motion.button>
            ) : (
              <motion.button
                onClick={connectWallet}
                className="bg-red-600 px-5 py-2 rounded font-semibold text-white"
              >
                Connect
              </motion.button>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-3xl"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-gray-900 px-6 py-6 space-y-4 text-center">
          <Link to="/" onClick={() => setOpen(false)}>Market</Link>
          <Link to="/create" onClick={() => setOpen(false)}>Create</Link>
          <Link to="/my-nfts" onClick={() => setOpen(false)}>My NFTs</Link>

          {account ? (
            <button
              onClick={disconnectWallet}
              className="w-full bg-green-600 py-2 rounded text-white logo-gradient"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="w-full bg-red-600 py-2 rounded text-white logo-gradient"
            >
              Connect
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
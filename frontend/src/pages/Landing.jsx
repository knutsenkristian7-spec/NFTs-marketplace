import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

/* ---------------- ANIMATIONS ---------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
}

export default function Landing({ account, connectWallet }) {
  const navigate = useNavigate()

  return (
    /* 🌍 FULL VIEWPORT WRAPPER (FORCES CENTERING) */
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950 text-white overflow-hidden">
      
      {/* 🌌 BACKGROUND GLOW */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/30 blur-[150px]" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-indigo-600/30 blur-[150px]" />
      </div>

      {/* 🚀 CONTENT */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="
          relative z-10
          text-center
          max-w-2xl
          px-6
          flex flex-col items-center
        "
      >
        <h1 className="text-4xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          Discover, Collect & Sell
          <br /> Extraordinary NFTs
        </h1>

        <p className="mt-6 text-gray-300 text-lg">
          A decentralized NFT marketplace where creators and collectors
          connect securely on the blockchain.
        </p>

        {/* 🔘 BUTTONS */}
        <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center">
          {/* CONNECT WALLET */}
          {!account ? (
            <button
              onClick={connectWallet}
              className="
                px-8 py-3 rounded-xl font-bold text-lg
                bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
                hover:scale-105 transition-transform
              "
            >
              Connect Wallet
            </button>
          ) : (
            <div className="text-green-400 font-semibold text-lg">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          )}

          {/* CREATE NFT */}
          <button
            disabled={!account}
            onClick={() => navigate("/create")}
            className={`
              px-8 py-3 rounded-xl font-bold text-lg transition
              ${
                account
                  ? "border border-indigo-500 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                  : "border border-gray-600 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            Create NFT
          </button>
        </div>

        {/* MARKET */}
        
      </motion.div>
    </div>
  )
}
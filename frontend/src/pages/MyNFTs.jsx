import { useEffect, useState } from "react"
import axios from "axios"
import { ethers } from "ethers"
import { getNFTContract, getMarketplaceContract } from "../web3"
import { MARKETPLACE_ADDRESS, NFT_ADDRESS } from "../constants"
import { motion } from "framer-motion"

/* ---------------- PAGE TRANSITION ---------------- */
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
}

/* ---------------- CARD VARIANTS ---------------- */
const cardVariants = {
  rest: {},
  hover: {},
}

/* ---------------- INFO VARIANTS ---------------- */
const infoVariants = {
  rest: {
    opacity: 0,
    y: 25,
    pointerEvents: "none",
  },
  hover: {
    opacity: 1,
    y: 0,
    pointerEvents: "auto",
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
}

export default function MyNFTs() {
  const [items, setItems] = useState([])
  const [price, setPrice] = useState({})

  /* ---------------- LOAD MY NFTs ---------------- */
  async function loadMyNFTs() {
    const nft = await getNFTContract()
    const provider = nft.runner.provider
    const signer = await provider.getSigner()
    const user = await signer.getAddress()

    const total = await nft.tokenCount()
    const results = []

    for (let i = 1; i <= total; i++) {
      try {
        const owner = await nft.ownerOf(i)
        if (owner.toLowerCase() === user.toLowerCase()) {
          const uri = await nft.tokenURI(i.toString())
          const meta = await axios.get(uri)

          results.push({
            id: i,
            ...meta.data,
          })
        }
      } catch {}
    }

    setItems(results)
  }

  /* ---------------- LIST NFT ---------------- */
  async function listNFT(tokenId) {
    const nft = await getNFTContract(true)
    const marketplace = await getMarketplaceContract(true)

    await nft.approve(MARKETPLACE_ADDRESS, tokenId)
    await marketplace.listItem(
      NFT_ADDRESS,
      tokenId,
      ethers.parseEther(price[tokenId])
    )

    alert("NFT listed!")
    loadMyNFTs()
  }

  useEffect(() => {
    loadMyNFTs()
  }, [])

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] flex justify-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="w-full max-w-7xl px-6 py-10 flex flex-col items-center">

        {/* ✨ SHINY TITLE */}
        <motion.h1
          className="
            mb-12 text-4xl font-extrabold text-center
            bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400
            bg-[length:300%_300%] bg-clip-text text-transparent
          "
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          My NFTs
        </motion.h1>

        {/* 🖼 NFT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {items.length > 0 ? (
            items.map((nft) => (
              <motion.div
                key={nft.id}
                variants={cardVariants}
                initial="rest"
                whileHover="hover"
                animate="rest"
                className="relative"
              >
                {/* 🌈 SHINY BORDER */}
                <motion.div
                  className="
                    absolute inset-0 rounded-2xl
                    bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                    blur-sm opacity-70
                  "
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: "300% 300%" }}
                />

                {/* 🧊 CARD */}
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="
                    relative z-10
                    bg-slate-800 rounded-2xl
                    w-[220px] h-[360px]
                    border border-slate-700
                    overflow-hidden
                  "
                >
                  {/* IMAGE */}
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="h-full w-full object-cover"
                  />

                  {/* 🔥 INFO OVERLAY */}
                  <motion.div
                    variants={infoVariants}
                    className="
                      absolute inset-0
                      bg-black/75 backdrop-blur-md
                      p-4 flex flex-col justify-end text-center
                    "
                  >
                    <h3 className="text-indigo-400 font-semibold text-sm truncate">
                      {nft.name}
                    </h3>

                    <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                      {nft.description}
                    </p>

                    <input
                      placeholder="Price (ETH)"
                      className="w-full mt-3 p-1.5 bg-slate-700 rounded text-sm text-center"
                      onChange={(e) =>
                        setPrice({ ...price, [nft.id]: e.target.value })
                      }
                    />

                    <button
                      onClick={() => listNFT(nft.id)}
                      className="
                        btn ripple w-full mt-2
                        bg-yellow-600 py-1.5 rounded text-sm
                        hover:shadow-[0_0_20px_rgba(234,179,8,0.9)]
                      "
                    >
                      List
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 col-span-full text-center">
              You don’t own any NFTs yet
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
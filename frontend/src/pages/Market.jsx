import { useEffect, useState } from "react"
import { ethers } from "ethers"
import axios from "axios"
import { motion, useAnimation } from "framer-motion"

import { getMarketplaceContract, getNFTContract } from "../web3"
import NFTCard from "../components/NFTCard"

/* ---------------- PAGE TRANSITION ---------------- */
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
}

export default function Market() {
  const marqueeControls = useAnimation()

  const [allNfts, setAllNfts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [search, setSearch] = useState("")

  /* ---------------- LOAD MARKET ---------------- */
  async function loadMarketplaceNFTs() {
    try {
      const marketplace = await getMarketplaceContract()
      const nftContract = await getNFTContract()
      const data = await marketplace.getAllListings()

      const formatted = await Promise.all(
        data.map(async (item, index) => {
          let name = ""

          try {
            const tokenURI = await nftContract.tokenURI(item[3])
            const meta = await axios.get(tokenURI)
            name = meta.data.name || ""
          } catch {}

          return {
            seller: item[0],
            price: item[1],
            nftAddress: item[2],
            tokenId: item[3],
            index,
            name,
          }
        })
      )

      setAllNfts(
        formatted.filter(nft => nft.price && nft.price > 0n)
      )
    } catch (err) {
      console.error("Marketplace load error:", err)
    }

    setLoading(false)
  }

  /* ---------------- LOAD SALES ---------------- */
  async function loadSales() {
    const marketplace = await getMarketplaceContract()
    const data = await marketplace.getSales()

    setSales(
      data.map(s => ({
        buyer: s[1],
        tokenId: s[3],
        price: s[4],
        time: Number(s[5]),
      }))
    )
  }

  useEffect(() => {
    loadMarketplaceNFTs()
    loadSales()
  }, [])

  /* ---------------- SEARCH (FIXED) ---------------- */
  const filteredNFTs = search.trim()
    ? allNfts.filter(nft =>
        nft.name.toLowerCase().includes(search.toLowerCase())
      )
    : allNfts

  const isSingleResult = filteredNFTs.length === 1

  /* ---------------- MARQUEE CONTROL ---------------- */
  const startMarquee = () => {
    marqueeControls.start({
      x: "-100%",
      transition: {
        duration: filteredNFTs.length * 6,
        ease: "linear",
        repeat: Infinity,
      },
    })
  }

  useEffect(() => {
    marqueeControls.stop()

    if (!isSingleResult && filteredNFTs.length > 1) {
      startMarquee()
    }
  }, [filteredNFTs])

  if (loading) {
    return <div className="p-6 text-xl text-center">Loading marketplace...</div>
  }

  return (
    <motion.div
      className="flex-1 flex flex-col items-center px-6 py-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-2xl font-bold mb-6 text-red-700">
        NFT Marketplace
      </h1>

      {/* 🔍 SEARCH */}
      <div className="max-w-md w-full mb-10 relative">
        <input
          type="text"
          placeholder="Search NFT by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>

      {/* 🖼 NFT DISPLAY */}
      <div className="relative w-full max-w-6xl overflow-hidden">
        {filteredNFTs.length === 0 && (
          <p className="text-gray-400 text-center">No NFTs found</p>
        )}

        {/* 🔥 AUTO-FOCUS SINGLE NFT */}
        {isSingleResult && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="shadow-[0_0_50px_rgba(99,102,241,0.9)] rounded-2xl">
              <NFTCard
                nft={filteredNFTs[0]}
                reload={loadMarketplaceNFTs}
              />
            </div>
          </motion.div>
        )}

        {/* 🌊 MARQUEE MULTIPLE NFTs */}
        {!isSingleResult && filteredNFTs.length > 1 && (
          <motion.div
            className="flex gap-6 w-max cursor-grab"
            animate={marqueeControls}
            drag="x"
            dragConstraints={{ left: -100000, right: 100000 }}
            dragElastic={0.05}
            onHoverStart={() => marqueeControls.stop()}
            onHoverEnd={startMarquee}
          >
            {filteredNFTs.map(nft => (
              <div
                key={nft.tokenId}
                className="min-w-[160px] sm:min-w-[200px] md:min-w-[220px]"
              >
                <NFTCard nft={nft} reload={loadMarketplaceNFTs} />
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* 🧾 SOLD HISTORY BUTTON */}
      <div className="flex justify-center mt-12 mb-6">
        <motion.button
          onClick={() => setShowHistory(!showHistory)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"
        >
          {showHistory ? "Hide Sold History" : "Sold History"}
        </motion.button>
      </div>
      

      {/* 🧾 SOLD HISTORY */}
      {showHistory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mt-6">
          {sales.length > 0 ? (
            sales.map((s, i) => (
              <div
                key={i}
                className="bg-slate-900 p-4 rounded-xl border border-slate-700"
              >
                <p className="text-indigo-400 font-semibold">
                  NFT #{s.tokenId}
                </p>

                <p className="text-sm">
                  {ethers.formatEther(s.price)} ETH
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Buyer:
                  <span className="ml-1 text-indigo-300">
                    {s.buyer.slice(0, 6)}...{s.buyer.slice(-4)}
                  </span>
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {new Date(s.time * 1000).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 col-span-full text-center">
              No sales yet
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}
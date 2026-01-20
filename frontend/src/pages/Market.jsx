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
        formatted.filter(nft => nft.tokenId && nft.price && nft.price > 0n)
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

  /* ---------------- SEARCH ---------------- */
  const filteredNFTs = allNfts.filter(nft =>
    nft.name.toLowerCase().includes(search.toLowerCase())
  )

  /* ---------------- START MARQUEE (CONTINUOUS) ---------------- */
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
    if (filteredNFTs.length > 0) {
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

      {/* 🖼 NFT MARQUEE */}
      <div className="relative w-full max-w-6xl overflow-hidden">
        {filteredNFTs.length > 0 ? (
          <motion.div
            className="flex gap-6 w-max"
            animate={marqueeControls}
          >
            {filteredNFTs.map(nft => (
              <div
                key={nft.tokenId}
                className="min-w-[160px] sm:min-w-[200px] md:min-w-[220px]"
                onMouseEnter={() => marqueeControls.stop()}
                onMouseLeave={startMarquee} // ✅ CONTINUES, NOT RESTARTS
              >
                <NFTCard nft={nft} reload={loadMarketplaceNFTs} />
              </div>
            ))}
          </motion.div>
        ) : (
          <p className="text-gray-400 text-center">No NFTs found</p>
        )}
      </div>

      {/* 🧾 SOLD HISTORY */}
      {showHistory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mt-10">
          {sales.map((s, i) => (
            <div
              key={i}
              className="bg-slate-900 p-4 rounded-xl border border-slate-700"
            >
              <p className="text-indigo-400 font-semibold">
                NFT #{s.tokenId}
              </p>
              <p>{ethers.formatEther(s.price)} ETH</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
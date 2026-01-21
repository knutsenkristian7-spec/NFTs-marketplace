import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { ethers } from "ethers"
import { motion } from "framer-motion"

import { getMarketplaceContract, getNFTContract } from "../web3"

export default function NFTCard({ nft, reload }) {
  const navigate = useNavigate()
  const [meta, setMeta] = useState(null)
  const [account, setAccount] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [price, setPrice] = useState(nft.price)

  useEffect(() => {
    loadMetadata()
    loadAccount()
  }, [])

  async function loadAccount() {
    const [user] = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    setAccount(user.toLowerCase())
  }

  async function loadMetadata() {
    try {
      const nftContract = await getNFTContract()
      const tokenURI = await nftContract.tokenURI(nft.tokenId.toString())
      const meta = await axios.get(tokenURI)
      setMeta(meta.data)
    } catch (err) {
      console.error("Metadata error:", err)
    }
  }

  async function buy() {
    const marketplace = await getMarketplaceContract(true)
    const tx = await marketplace.buyItem(nft.index, { value: price })
    await tx.wait()
    reload()
  }

  async function cancel() {
    const marketplace = await getMarketplaceContract(true)
    const tx = await marketplace.cancelListing(nft.index)
    await tx.wait()
    reload()
  }

  async function updatePrice() {
    if (!newPrice || Number(newPrice) <= 0) {
      alert("Invalid price")
      return
    }

    const marketplace = await getMarketplaceContract(true)
    const priceInWei = ethers.parseEther(newPrice)

    const tx = await marketplace.updatePrice(nft.index, priceInWei)
    await tx.wait()

    setPrice(priceInWei)
    setNewPrice("")
    reload()
  }

  if (!meta) {
    return (
      <div className="bg-slate-800 rounded-xl w-[220px] h-[420px]" />
    )
  }

  const isOwner = account === nft.seller.toLowerCase()

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* 🌈 SHINY ANIMATED BORDER */}
      <motion.div
        className="
          absolute inset-0 rounded-2xl
          bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
          opacity-70 blur-sm
          group-hover:opacity-100
        "
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ backgroundSize: "300% 300%" }}
      />

      {/* 🧊 CARD */}
      <div className="relative z-10 bg-slate-800 rounded-2xl w-[220px] h-[420px] overflow-hidden border border-slate-700">

        {/* IMAGE */}
        <img
          src={meta.image}
          alt={meta.name}
          className="h-full w-full object-cover cursor-pointer"
          onClick={() =>
            navigate(`/nft/${nft.nftAddress}/${nft.tokenId}`)
          }
        />

        {/* 🌑 OVERLAY */}
        <motion.div
          className="
            absolute inset-0
            bg-gradient-to-t from-black via-black/80 to-transparent
          "
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.9 }}
          transition={{ duration: 0.4 }}
        />

        {/* 📄 INFO (HIDDEN → SHOW ON HOVER) */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-4 z-10 text-black"
          initial={{ opacity: 0, y: 40 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h3 className="text-black font-semibold truncate">
            NFT #{nft.tokenId} {meta.name}
          </h3>

          <p className="text-xs text-black line-clamp-2 mt-1">
            {meta.description}
          </p>

          <p className="mt-2 font-semibold">
            {ethers.formatEther(price)} ETH
          </p>

          <div className="mt-3">
            {isOwner ? (
              <>
                <input
                  type="text"
                  placeholder="New price (ETH)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full p-1.5 text-sm rounded bg-slate-700"
                />

                <button
                  onClick={updatePrice}
                  className="mt-2 w-full bg-green-600 py-1.5 rounded text-sm"
                >
                  Change Price
                </button>

                <button
                  onClick={cancel}
                  className="mt-2 w-full bg-red-600 py-1.5 rounded text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={buy}
                className="
                  w-full bg-indigo-600 py-1.5 rounded text-sm
                  hover:shadow-[0_0_20px_rgba(99,102,241,0.9)]
                "
              >
                Buy
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
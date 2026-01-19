import { useState } from "react"
import { uploadFileToIPFS, uploadMetadata } from "../pinata"
import { getNFTContract, getMarketplaceContract } from "../web3"
import { MARKETPLACE_ADDRESS, NFT_ADDRESS } from "../constants"
import { motion } from "framer-motion"

const pageVariants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -30,
  },
}

export default function Create() {
  const [image, setImage] = useState(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  async function createNFT() {
    try {

      await window.ethereum.request({ method: "eth_requestAccounts" })


      if (!image || !name || !description) {
        alert("Please fill all fields")
        return
      }

      setLoading(true)

      // 1️⃣ Upload image to Pinata
      const imageUrl = await uploadFileToIPFS(image)

      // 2️⃣ Upload metadata to Pinata
      const metadataUrl = await uploadMetadata(name, description, imageUrl)

      // 3️⃣ Get contracts
      const nft = await getNFTContract(true)
      // const marketplace = await getMarketplaceContract(true)

      // 4️⃣ Mint NFT
      const mintTx = await nft.mint(metadataUrl)
      await mintTx.wait()

      const tokenId = await nft.tokenCount()

      // 5️⃣ Approve marketplace
      const approveTx = await nft.approve(MARKETPLACE_ADDRESS, tokenId)
      await approveTx.wait()

      // 6️⃣ List NFT
      // const listTx = await marketplace.listItem(
      //   NFT_ADDRESS,
      //   tokenId,
      //   ethers.parseEther(price)
      // )
      // await listTx.wait()

      alert("NFT created and listed successfully!")
    } catch (error) {
      console.error(error)
      alert("Transaction failed")
    } finally {
      setLoading(false)
    }
  }

  return (
  <motion.div
      className="flex-1 flex items-center justify-center w-full px-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
    <div className="max-w-md w-full bg-slate-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl mb-5 text-indigo-400 font-bold text-center logo-gradient">
        Create New NFT
      </h2>

      <input
        type="file"
        onChange={e => setImage(e.target.files[0])}
        className="mb-4 text-yellow-300"
      />

      <input
        className="w-full p-2 mb-3 bg-slate-700 rounded text-white"
        placeholder="NFT Name"
        onChange={e => setName(e.target.value)}
      />

      <textarea
        className="w-full p-2 mb-3 bg-slate-700 rounded text-white"
        placeholder="Description"
        onChange={e => setDescription(e.target.value)}
      />

      <button
        onClick={createNFT}
        disabled={loading}
        className="btn ripple w-full bg-green-700  py-2 rounded hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
      >
        {loading ? "Minting..." : "Create NFT"}
      </button>
    </div>
  </motion.div>
)
}

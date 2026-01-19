import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { ethers } from "ethers"
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
      <div className="bg-slate-800 rounded-lg p-4 w-[220px] h-[420px]" />
    )
  }

  const isOwner = account === nft.seller.toLowerCase()

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg w-[220px] h-[420px] flex flex-col">
      
      {/* IMAGE */}
      <div className="p-3">
        <div
          onClick={() =>
            navigate(`/nft/${nft.nftAddress}/${nft.tokenId}`)
          }
          className="cursor-pointer"
        >
          <img
            src={meta.image}
            className="rounded-md h-40 w-full object-cover"
          />
        </div>
      </div>

      {/* INFO */}
      <div className="px-3 text-sm flex-1">
        <h3 className="text-indigo-400 font-semibold truncate">
          NFT #{nft.tokenId} {meta.name}
        </h3>

        <p className="text-xs text-gray-400 line-clamp-2 mt-1">
          {meta.description}
        </p>

        <p className="mt-2 font-medium">
          {ethers.formatEther(price)} ETH
        </p>
      </div>

      {/* ACTIONS (FIXED HEIGHT) */}
      <div className="p-3 h-[120px]">
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
              className="btn ripple mt-2 w-full bg-green-600 py-1.5 text-sm rounded"
            >
              Change Price
            </button>

            <button
              onClick={cancel}
              className="btn ripple mt-2 w-full bg-red-600 py-1.5 text-sm rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {/* spacer keeps same height */}
            <div className="h-[56px]" />

            <button
              onClick={buy}
              className="btn ripple w-full bg-indigo-600 py-1.5 text-sm rounded hover:shadow-[0_0_15px_rgba(99,102,241,0.8)]"
            >
              Buy
            </button>
          </>
        )}
      </div>
    </div>
  )
}
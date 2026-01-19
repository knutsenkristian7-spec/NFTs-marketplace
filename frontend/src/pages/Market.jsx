import { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { motion, useAnimation } from "framer-motion";

import { getMarketplaceContract, getNFTContract } from "../web3";
import NFTCard from "../components/NFTCard";

/* ---------------- PAGE TRANSITION ---------------- */
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

export default function Market() {
  const marqueeControls = useAnimation();

  const [allNfts, setAllNfts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [search, setSearch] = useState("");

  /* ---------------- LOAD MARKET ---------------- */
  async function loadMarketplaceNFTs() {
    try {
      const marketplace = await getMarketplaceContract();
      const nftContract = await getNFTContract();
      const data = await marketplace.getAllListings();

      const formatted = await Promise.all(
        data.map(async (item, index) => {
          let name = "";

          try {
            const tokenURI = await nftContract.tokenURI(item[3]);
            const meta = await axios.get(tokenURI);
            name = meta.data.name || "";
          } catch {
            console.warn("Metadata fetch failed");
          }

          return {
            seller: item[0],
            price: item[1],
            nftAddress: item[2],
            tokenId: item[3],
            index,
            name,
          };
        }),
      );

      const filtered = formatted.filter(
        (nft) => nft.tokenId && nft.price && nft.price > 0n,
      );

      setAllNfts(filtered);
    } catch (err) {
      console.error("Marketplace load error:", err);
    }

    setLoading(false);
  }

  /* ---------------- LOAD SALES ---------------- */
  async function loadSales() {
    const marketplace = await getMarketplaceContract();
    const data = await marketplace.getSales();

    const formatted = data.map((s) => ({
      buyer: s[1],
      tokenId: s[3],
      price: s[4],
      time: Number(s[5]),
    }));

    setSales(formatted);
  }

  useEffect(() => {
    loadMarketplaceNFTs();
    loadSales();
  }, []);

  /* ---------------- SEARCH ---------------- */
  const filteredNFTs = allNfts.filter((nft) =>
    nft.name.toLowerCase().includes(search.toLowerCase()),
  );

  const marqueeNFTs =
    filteredNFTs.length > 0 ? [...filteredNFTs, ...filteredNFTs] : [];

  /* ---------------- START MARQUEE ---------------- */
  useEffect(() => {
    if (marqueeNFTs.length === 0) return;

    marqueeControls.start({
      x: ["0%", "-50%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 35,
          ease: "linear",
        },
      },
    });
  }, [marqueeNFTs, marqueeControls]);

  if (loading) {
    return (
      <div className="p-6 text-xl text-center">Loading marketplace...</div>
    );
  }

  return (
    <motion.div
      className="flex-1 flex flex-col items-center px-6 py-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <h1 className="text-2xl font-bold mb-6 text-red-700">NFT Marketplace</h1>

      {/* 🔍 SEARCH */}
      <div className="max-w-md w-full px-2 mb-10 relative mt-4">
        <input
          type="text"
          placeholder="Search NFT by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-indigo-500"
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
            onHoverStart={() => marqueeControls.stop()}
            onHoverEnd={() =>
              marqueeControls.start({
                x: ["0%", "-50%"],
                transition: {
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 35,
                    ease: "linear",
                  },
                },
              })
            }
          >
            {marqueeNFTs.map((nft, i) => (
              <div
                key={`${nft.tokenId}-${i}`}
                className="min-w-[160px] sm:min-w-[200px] md:min-w-[220px] transition-transform duration-300 hover:scale-105"
              >
                <NFTCard nft={nft} reload={loadMarketplaceNFTs} />
              </div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-gray-400 text-lg w-full">
            No NFTs found
          </p>
        )}
      </div>

      {/* 🧾 SOLD HISTORY BUTTON */}
      <div className="flex justify-center mt-12 mb-6">
        <motion.button
          onClick={() => setShowHistory(!showHistory)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="
      relative overflow-hidden
      px-8 py-3 rounded-xl
      font-bold text-white text-lg
      bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600
      shadow-[0_0_25px_rgba(99,102,241,0.6)]
    "
        >
          {/* ✨ SHINE OVERLAY */}
          <motion.span
            className="
        absolute inset-0
        bg-gradient-to-r from-transparent via-white/40 to-transparent
      "
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* 💡 GLOW PULSE */}
          <motion.span
            className="
        absolute inset-0 rounded-xl
        shadow-[0_0_35px_rgba(139,92,246,0.9)]
      "
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* BUTTON TEXT */}
          <span className="relative z-10">
            {showHistory ? "Hide Sold History" : "Sold History"}
          </span>
        </motion.button>
      </div>

      {/* 🧾 SOLD HISTORY */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out w-full max-w-6xl ${
          showHistory ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {showHistory && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {sales.map((s, i) => (
              <div
                key={i}
                className="bg-slate-900 p-4 rounded-xl border border-slate-700 relative"
              >
                <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded">
                  SOLD
                </div>

                <p className="text-indigo-400 font-semibold">
                  NFT #{s.tokenId}
                </p>

                <p className="text-lg">{ethers.formatEther(s.price)} ETH</p>

                {/* ✅ BUYER ADDRESS */}
                <p className="text-xs text-gray-400 mt-1">
                  Buyer:{" "}
                  <span className="text-indigo-300 font-mono">
                    {s.buyer.slice(0, 6)}...{s.buyer.slice(-4)}
                  </span>
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {new Date(s.time * 1000).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

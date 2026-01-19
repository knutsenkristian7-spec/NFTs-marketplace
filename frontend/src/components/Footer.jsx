export default function Footer() {
  return (
    <footer className="mt-20 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left */}
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} NFT Marketplace. All rights reserved.
        </p>

        {/* Center */}
        <p className="text-sm text-gray-500">
          Built with ❤️ using Ethereum & React
        </p>

        {/* Right */}
        <div className="flex gap-4 text-sm">
          <a
            href="#"
            className="text-gray-400 hover:text-indigo-400 transition"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-indigo-400 transition"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-indigo-400 transition"
          >
            Contact
          </a>
        </div>

      </div>
    </footer>
  )
}
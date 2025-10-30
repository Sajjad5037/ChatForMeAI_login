export default function TestTailwind() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-10">
      <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
        🚀 Tailwind Test
      </h1>

      <p className="text-xl mb-6">
        If you see a colorful gradient background, Tailwind is working!
      </p>

      <button className="px-6 py-3 bg-white text-black font-semibold rounded-xl shadow-lg hover:scale-105 transition">
        Click Me
      </button>
    </div>
  )
}

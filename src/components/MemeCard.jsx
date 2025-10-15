// src/components/MemeCard.jsx
export default function MemeCard({ meme }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 p-3">
      <div className="relative mx-auto w-full max-w-sm">
        <img
          src={meme.img}
          alt={meme.name}
          className="w-full rounded-lg bg-black/40 object-contain"
        />
      </div>
      <div className="mt-2 text-sm">
        <div className="font-semibold">{meme.name}</div>
      </div>
    </div>
  );
}

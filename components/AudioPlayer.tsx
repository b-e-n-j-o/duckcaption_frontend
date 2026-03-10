'use client';

interface AudioPlayerProps {
  audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <audio controls className="w-full">
        <source src={audioUrl} type="audio/wav" />
        Votre navigateur ne supporte pas l'élément audio.
      </audio>
    </div>
  );
}
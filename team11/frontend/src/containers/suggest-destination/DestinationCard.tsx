import React from 'react';
import { Link } from 'react-router';

interface DestinationCardProps {
  province: string;
  name: string;
  summary: string;
  url: string;
  image?: string;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ province, name, summary, url, image }) => {
  const destinationPath = `/create-trip?province=${encodeURIComponent(province)}`;

  return (
    <div className="group relative flex flex-col bg-[#E0E0E0] rounded-2xl shadow-sm border border-white/60 transition-all duration-300 hover:shadow-2xl overflow-hidden h-full">

      {/* 1. Image Area - Set to object-contain to avoid cropping */}
      <div className="relative h-48 w-full bg-[#E0E0E0] overflow-hidden py-2">
        {image ? (
          <img
            src={image}
            alt={province}
            className="w-full bg-[#E0E0E0] h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mountain-grey/20">
            <i className="fa-solid fa-image text-5xl"></i>
          </div>
        )}
      </div>

      {/* 2. Content Area - Gradient border moved here */}
      <div className="flex flex-col p-6 pt-0 -mt-6 relative z-20 flex-1">

        {/* Gradient Side Accent - Positioned specifically next to the text area */}
        <div className="absolute right-0 top-12 bottom-6 w-1 bg-gradient-to-b from-persian-gold to-tile-cyan opacity-80 group-hover:opacity-100 transition-opacity" />

        {/* Province Title Tag */}
        <div className="bg-[#BDBDBD] text-text-dark px-8 py-2 rounded-lg text-xl font-black w-fit mx-auto mb-4 shadow-md group-hover:bg-persian-gold group-hover:text-white transition-colors">
          {name || province}
        </div>

        {/* Summary */}
        <p className="text-mountain-grey text-sm font-medium leading-relaxed text-justify dir-rtl mb-6 pr-2">
          {summary}
        </p>

        <div className='flex justify-between mt-auto items-center'>
          {url && <span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-text-dark font-bold text-xs opacity-70 hover:opacity-100 hover:text-tile-cyan transition-all"
            >
              مطالعه بیشتر
            </a>
          </span>}

          <span className='ms-auto'>
            <Link
              to={destinationPath}
              className="inline-flex items-center gap-2 text-text-dark font-bold text-sm border-b-2 border-text-dark pb-1 hover:text-tile-cyan hover:border-tile-cyan transition-all"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
              ایجاد برنامه سفر
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
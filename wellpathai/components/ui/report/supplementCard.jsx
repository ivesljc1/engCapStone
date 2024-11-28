import { Button } from "@/components/ui/button"

export function SupplementCard({ 
  image, 
  name, 
  price,
  onClick 
}) {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col flex-1 min-w-[171.5px] h-fit p-6 justify-center items-start gap-2.5 bg-white rounded-[24px] border border-[#E5E7EB] shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]"
    >
      {/* Image and title container */}
      <div className="flex flex-col items-start gap-4 flex-1 self-stretch">
        {/* Image container */}
        <div className="w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '288/250' }}>
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title container */}
        <div className="flex h-[54px] flex-col justify-center self-stretch">
          <h3 className="text-[18px] font-medium text-black overflow-hidden line-clamp-2 font-inter leading-normal">
            {name}
          </h3>
        </div>
      </div>

      {/* Price button */}
      <Button 
        className="h-10 px-5 py-3.5 flex justify-center items-center gap-2 self-stretch bg-primary hover:bg-primary-hover text-white rounded-xl"
      >
        ${price}
      </Button>
    </div>
  )
}

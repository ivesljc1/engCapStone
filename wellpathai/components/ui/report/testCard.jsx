import { Button } from "@/components/ui/button"

export function TestCard({ 
  image, 
  title = "Boold Test", 
  description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore."
}) {
  return (
    <div className="flex h-[240px] p-6 items-start gap-10 rounded-[24px] border shadow-sm">
      {/* Left side - Image */}
      <div className="w-1/2 h-full rounded-2xl overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side - Content */}
      <div className="flex flex-col flex-1 h-full justify-between">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="text-gray-500">{description}</p>
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl"
        >
          Book
        </Button>
      </div>
    </div>
  )
}

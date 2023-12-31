export function Navbar() {
  return (
    <div className="border-b-[1px] mb-4">
      <div className="container">
        <div className="flex justify-between items-center h-[60px]">
          <div className="flex items-center">
            <img className="w-10 mr-2" src="./favicon.svg" alt="luggage icon" />
            <a href="/" className="text-2xl font-semibold mb-1">
              Help Me Pack
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

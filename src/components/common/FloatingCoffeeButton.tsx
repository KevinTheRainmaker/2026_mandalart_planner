/**
 * Floating Buy Me a Coffee button
 * Displays in the bottom-right corner of the screen
 */
export function FloatingCoffeeButton() {
  return (
    <a
      href="https://www.buymeacoffee.com/kevinrain"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 shadow-lg rounded-full hover:scale-105 transition-transform"
    >
      <img
        src="https://img.buymeacoffee.com/button-api/?text=개발자 커피 사주기&emoji=&slug=kevinrain&button_colour=5F7FFF&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00"
        alt="Buy me a coffee"
        className="h-10 rounded-full"
      />
    </a>
  )
}

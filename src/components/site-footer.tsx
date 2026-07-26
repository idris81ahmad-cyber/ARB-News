export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-4 border-naija-gold bg-naija-green-dark px-4 py-6 text-center text-white">
      <p>
        &copy; {new Date().getFullYear()} ARB News — Bringing Nigeria to the World
      </p>
      <p className="mt-1 text-sm text-white/85">
        Inspired by the vibrant spirit of Naija, from Lagos to Abuja.
      </p>
    </footer>
  );
}

import PillNav from "../Design/PillNav";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <PillNav
          logo="https://img.freepik.com/premium-vector/crm-logo-crm-letter-crm-letter-logo-design-initials-crm-logo-linked-with-circle-uppercase-monogram-logo-crm-typography-technology-business-real-estate-brand_229120-63701.jpg"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Services', href: '/services' },
            { label: 'About Us', href: '/about' },
            { label: 'Contact Us', href: '/contact' },
          ]}
        />
      </div>
    </header>
  );
}
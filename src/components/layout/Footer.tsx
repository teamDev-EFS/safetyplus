import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">SafetyPlus</h3>
            <p className="text-sm mb-4">
              India's largest safety equipment supplier. Trusted by thousands of
              businesses nationwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-green-400 transition">
                Facebook
              </a>
              <a href="#" className="hover:text-green-400 transition">
                Twitter
              </a>
              <a href="#" className="hover:text-green-400 transition">
                LinkedIn
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shop" className="hover:text-green-400 transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-green-400 transition">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-green-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-green-400 transition">
                  Team
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-400 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/track-order"
                  className="hover:text-green-400 transition"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-green-400 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-green-400 transition">
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-green-400 transition"
                >
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-green-400 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <div>
                  <div>New Siyaganj, Unit No. AS-23,</div>
                  <div>HTL Unit No.2 Block No. A-4,</div>
                  <div>Mal Godown Road,</div>
                  <div>Indore 452 007 (M.P.) India</div>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <div>
                  <div>Phone: 0731-2430082-83</div>
                  <div>Mobile: 94248-36079</div>
                  <div>Fax: 0731-2430084</div>
                </div>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>marketing@safetyplus.co.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2025 SafetyPlus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

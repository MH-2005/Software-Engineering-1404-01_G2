import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const Navbar = () => {
  return (
    <header className="main-header">
      <div className="container header-content">
        {/* Right Side: Branding from your HTML */}
        <Link to="http://localhost:8000/" className="logo no-underline">
          <i className="fa-solid fa-leaf text-persian-gold text-3xl"></i>
          <div className="logo-text">
            <h1 className="text-xl font-extrabold text-white">ایران‌نما</h1>
            <span className="text-xs text-white">سامانه هوشمند گردشگری</span>
          </div>
        </Link>

        {/* Group 11 Specific Badge */}
        <div className="hidden md:flex items-center px-4 py-1 rounded-full bg-white/10 border border-white/20">
          <a href="/team11/"><span className="p-2 text-white text-sm font-bold">سرویس برنامه‌ریزی سفر (گروه ۱۱)</span></a>
        </div>


        {/* Left Side: Auth & Team Identity */}
        <div className="flex items-center gap-6">

          <div className="auth-buttons flex gap-2">
            <a href="http://localhost:8000/auth/">
              <Button variant="secondary" className="px-5 py-2 text-sm">ورود</Button>
            </a>
            <a href="http://localhost:8000/auth/signup/">
              <Button variant="secondary" className="px-5 py-2 text-sm">ثبت‌نام</Button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
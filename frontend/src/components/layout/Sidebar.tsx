import { SIDEBAR_DATA } from "./SidebarData";
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { pathname } = useLocation();

  return (
    <>
      <div className="px-4 py-3 flex items-center justify-between">
        {isOpen && (
          <h2 className="text-white font-sans font-semibold text-xl 2xl:text-2xl">CryptoLens</h2>
        )}
        <button
          onClick={onToggle} //buttonクリックでSidebar開閉
          className="p-1 rounded-lg text-white hover:bg-gray-700"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
      </div>
      <ul className="py-2">
        {SIDEBAR_DATA.map((sidebar_item) => {
          // Sidebarの現在位置をbooleanで保持
          const isActive = pathname === sidebar_item.link;

          return (
            <Link 
              to={sidebar_item.link} 
              key={sidebar_item.id}
            >
              <li
                className={`
                  flex items-center px-4 py-3
                  cursor-pointer
                  ${isActive 
                    ? 'bg-gray-300 text-blue-600' 
                    : 'text-white hover:bg-gray-500'
                  }
                  ${isOpen ? 'gap-3' : 'justify-center'}
                `}
              >
                <div className="flex items-center justify-center w-5 h-5">
                  {<sidebar_item.icon className={`${isActive ? 'text-blue-600' : 'text-white'}`} />}
                </div>
                {isOpen && (
                  <div className="flex items-center justify-center font-medium 2xl:text-lg">
                    {sidebar_item.title}
                  </div>
                )}
              </li>
            </Link>
          );
        })}
      </ul>
    </>
  );
};
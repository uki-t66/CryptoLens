import { SIDEBAR_DATA } from "./SidebarData";
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const { pathname } = useLocation();

  
  return (
    <div className="w-64 h-full bg-gray-800  border border-gray-700">
      <ul className="py-2">
        {SIDEBAR_DATA.map((sidebar_item) => {

    // 現在のURLパス(pathname)とメニュー項目のリンク(value.link)が一致するか確認  
          const isActive = pathname === sidebar_item.link;

          return (
            <Link 
              to={sidebar_item.link} 
              key={sidebar_item.id}
            >
              <li
                className={`
                  flex items-center px-4 py-2 gap-3
                  cursor-pointer
                  ${isActive 
                    ? 'bg-gray-300 text-blue-600' 
                    : 'text-white hover:bg-gray-500'
                  }
                `}
              >
                <div className="flex items-center justify-center w-5 h-5">
                  {<sidebar_item.icon className={`${isActive ? 'text-blue-600' : 'text-white'}`} />}
                </div>
                <div className="flex items-center justify-center font-medium text-lg">
                  {sidebar_item.title}
                </div>
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
};
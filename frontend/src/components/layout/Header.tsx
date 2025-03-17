import { Logout } from '@/pages/Logout';
import { CircleUser, LogOut } from 'lucide-react';
import { useState } from 'react';

export const Header = ({ headerTitle }:{ headerTitle: string }) => {
    const [isOpen, setIsOpen] = useState(false); 
    const handleClick = () => {
        setIsOpen(!isOpen);
      };


    return (
        <div className="mb-6 xl:mb-8  text-white bg-gray-800 flex justify-between items-center">
             <h1 className="text-2xl xl:text-3xl font-bold p-4">{ headerTitle }</h1>
             <h1 className="p-4 mr-10 flex justify-between items-center">
                <CircleUser  size={30} className='mr-6 cursor-pointer'/>
                <LogOut onClick={handleClick} size={30} className='text-white hover:text-gray-400 cursor-pointer transition-colors duration-300'/>
                <Logout open={isOpen} onClose={() => setIsOpen(false)}/>
             </h1>
        </div>
    )
}
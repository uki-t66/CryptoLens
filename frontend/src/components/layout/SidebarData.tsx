import HomeIcon from '@mui/icons-material/Home';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import TaskIcon from '@mui/icons-material/Task';
import SettingsIcon from '@mui/icons-material/Settings';
import type { SvgIconComponent } from '@mui/icons-material';


interface SidebarItems {
    id: string;
    title: string;
    icon: SvgIconComponent;
    link: string;
}

export const SIDEBAR_DATA: SidebarItems[] = [
    {
        id: "dashboard",
        title: "Dashboard",
        icon: HomeIcon,
        link: "/dashboard"
    },
    {
        id: "asset",
        title: "Asset",
        icon: CurrencyBitcoinIcon,
        link: "/asset"
    },
    {
        id: "tx",
        title: "Transaction",
        icon: SwapHorizIcon,
        link: "/transaction"
    },
    {
        id: "analytics",
        title: "Analytics",
        icon: AnalyticsIcon,
        link: "/analytics"
    },
    {
        id: "tracking",
        title: "Tracking",
        icon: QueryStatsIcon,
        link: "/tracking"
    },
    {
        id: "bookmark",
        title: "Bookmark",
        icon: BookmarkIcon,
        link: "/bookmark"
    },
    {
        id: "airdrop",
        title: "Airdrop task",
        icon: TaskIcon,
        link: "/airdrop"
    },
    {
        id: "setting",
        title: "Setting",
        icon: SettingsIcon,
        link: "/setting"
    }
]
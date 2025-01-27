import { useState } from "react";

interface MenuDataItem {
    id: number;
    name: string;
    link: string;
}

interface AccountMenuComponentProps {
    menuData: MenuDataItem[];
}

const AccountMenuComponent: React.FC<AccountMenuComponentProps> = ({ menuData }) => {
    const [error, setError] = useState<string | null>(null);

    return (
        <div>
            {/* Display error */}
            {error && <p className="error">{error}</p>}

            {/* Display content */}
            <div>
                {/* Navigation section */}
                <nav>
                    <ul>
                        {menuData.map((item) => (
                            <li key={item.id}>
                                <a href={item.link}>{item.name}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default AccountMenuComponent;
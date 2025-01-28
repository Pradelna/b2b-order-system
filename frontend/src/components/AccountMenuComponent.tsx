import React, { useState } from "react";


const AccountMenuComponent: React.FC = () => {
    const [error, setError] = useState<string | null>(null);

    return (
        <div>
            {/* Display error */}
            {error && <p className="error">{error}</p>}

            {/* Display content */}
            <div>

            </div>
        </div>
    );
};

export default AccountMenuComponent;
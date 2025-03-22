import React, { useState } from 'react';
import { fetchWithAuth } from "../account/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

interface Customer {
    id: number;
    full_name: string;
    email: string;
    phone: string;
}

const CustomerSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const BASE_URL = import.meta.env.VITE_API_URL;

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/customers/search/?q=${query}`);
            if (response.ok) {
                const data = await response.json();
                setResults(data.results);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row customer-search mt-4">
            <div className="col-lg-8">
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search customers..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn btn-primary" onClick={handleSearch}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>

                {loading && <p>Loading...</p>}

                {results.length > 0 && (
                    <ul className="list-group">
                        {results.map((customer) => (
                            <Link to={`/admin/customer-detail/${customer.user_id}`} key={customer.user_id} className="list-group-item">
                                <strong>{customer.company_name}</strong>,
                                {" "}{customer.company_address},
                                {" "}{customer.company_email},
                                {" "}{"IČO"}{" "}{customer.company_ico},
                                {" "}{customer.company_person},
                                {" "}{customer.company_phone}
                            </Link>
                        ))}
                    </ul>
                )}

                {results.length === 0 && query && !loading && <p>No customers found.</p>}
            </div>
        </div>
    );
};

export default CustomerSearch;
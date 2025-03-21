import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../account/auth';
import { Link } from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";

interface Customer {
    id: number;
    full_name: string;
    email: string;
    date_joined: string;
}

function AllCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/customers/?page=${currentPage}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setCustomers(data.results);
                    setTotalPages(data.total_pages);
                } else {
                    console.error('Failed to fetch customers');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [currentPage, BASE_URL]);

    return (
        <div className="row all-customers">
            <h3>All Customers</h3>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <>

                        {customers.map((customer) => (
                            <div key={customer.user_id} className="col-8 mb-3">
                                <Link to={`/admin/customer-detail/${customer.user_id}`}>
                                    <div className="card dashboard-button user-card">
                                        <div className="users-icon">
                                            <FontAwesomeIcon icon={faUser} className="icon" />
                                        </div>
                                        <p className="">
                                            user id {customer.user_id}  Joined on {new Date(customer.date_joined).toLocaleDateString('en-GB')}
                                        </p>
                                        <p className="">
                                            {customer.new_company_name} {customer.company_address}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}

                    <div className="col-8 mb-4">
                        <div className="pagination d-flex justify-content-center">
                            <button
                                className="btn"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                &laquo;
                            </button>
                            {[...Array(totalPages)].map((_, index) => {
                                const page = index + 1;
                                return (
                                    <button
                                        key={page}
                                        className={`btn ${currentPage === page ? 'btn-primary' : 'btn-light'}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            <button
                                className="btn"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                &raquo;
                            </button>
                        </div>
                    </div>

                </>
            )}
        </div>
    );
}

export default AllCustomers;
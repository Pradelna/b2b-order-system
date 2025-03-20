import React, {useState, useEffect, JSX} from "react";
import { fetchWithAuth } from "../account/auth";
import FooterAccount from "../FooterAccount";
import HeaderAdmin from "./HeaderAdmin";
import TotalCustomers from "./TotalCustomers";
import TotalOrders from "./TotalOrders";
import NewCustomers from "./NewCustomers";

// Define the shape of the customer data
interface CustomerData {
    company_email?: string;
    [key: string]: any; // Allow for additional fields if necessary
}

function Dashboard(): JSX.Element {
    const [customerId, setCustomerId] = useState<number | false>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const BASE_URL = import.meta.env.VITE_API_URL;


    return (
        <>
            <HeaderAdmin />
            <div className="container margin-top-90 wrapper account-page">
                <div className="row message-block-76">
                    <div className="col-xl-9 col-lg-8 col-12">

                    </div>
                </div>
                <div className="row">

                    <TotalCustomers />
                    <TotalOrders />

                </div>
                <div className="row">
                    <NewCustomers />
                </div>
            </div>
            <FooterAccount />
        </>
    );
}

export default Dashboard;
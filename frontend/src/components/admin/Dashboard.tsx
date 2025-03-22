import React, {useState, useEffect, JSX} from "react";
import { fetchWithAuth } from "../account/auth";
import FooterAccount from "../FooterAccount";
import HeaderAdmin from "./HeaderAdmin";
import TotalCustomers from "./TotalCustomers";
import TotalOrders from "./TotalOrders";
import NewCustomers from "./NewCustomers";
import AllCustomers from "./AllCustomers";
import CustomerSearch from "./CustomerSearch";

// Define the shape of the customer data
interface CustomerData {
    company_email?: string;
    [key: string]: any; // Allow for additional fields if necessary
}

function Dashboard(): JSX.Element {

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

                <CustomerSearch />

                <NewCustomers />

                <AllCustomers />

            </div>
            <FooterAccount />
        </>
    );
}

export default Dashboard;
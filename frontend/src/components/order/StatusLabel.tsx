import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

type StatusMap = {
    [key: number]: string;
};

type StatusLabelProps = {
    statusCode: number;
    currentData?: {
        status?: {
            [key: string]: string;
        };
    };
};

const defaultStatusLabels: StatusMap = {
    0: "Nová",
    1: "Nová",
    2: "Přijato",
    3: "Na cestě",
    4: "Dokončeno",
    5: "Complited",
    6: "Ověřeno",
    7: "Odmítnuto",
    8: "Neznámý status",
    9: "Odloženo",
    10: "Storno",
    11: "K fakturaci",
    12: "Čeká na díl",
    13: "Marný výjezd",
    20: "Nová"
};

const StatusLabel: FC<StatusLabelProps> = ({ statusCode, currentData }) => {
    const statusKey = `status_${statusCode}`;
    const label = currentData?.status?.[statusKey] || defaultStatusLabels[statusCode] || "Neznámý status";

    return (
        <>
          <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#00aab7", height: "18px" }} />
          <strong className="ms-2">
              {label}
          </strong>
        </>
    );
};

export default StatusLabel;
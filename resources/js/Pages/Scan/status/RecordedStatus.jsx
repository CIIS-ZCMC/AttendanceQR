import React from "react";

import check from "../../../src/check.gif";
import { recordedStatusContants } from "@/constants/contants";

const RecordedStatus = () => {
    const { header, description } = recordedStatusContants;

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <img src={check} alt="" width="40px" height="40px" />
            <h2 className="text-md font-semibold text-gray-800">{header}</h2>
            <p className="text-sm text-gray-500 text-center">{description}</p>
        </div>
    );
};

export default RecordedStatus;

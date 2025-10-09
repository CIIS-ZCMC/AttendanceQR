import React from 'react';

import warning from '../../../src/warning.gif';

import { AnomalyStatusContants } from '../../../constants/contants';

const AnomalyStatus = () => {

    const { header, description } = AnomalyStatusContants;

    return (
        <div>
            <img
                src={warning}
                alt=""
                width="60px"
                height="60px"
            />
            <h2 className="text-md font-semibold text-red-400">
                {header}
            </h2>
            <p className="text-sm text-gray-500 text-center">
                {description}
            </p>
        </div>
    )
}

export default AnomalyStatus
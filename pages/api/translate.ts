// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Cors from 'cors'
import initMiddleware from '../../lib/init-middleware'

import type { NextApiRequest, NextApiResponse } from 'next'

// Initialize the cors middleware
const cors = initMiddleware(
    // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
    Cors({
        // Only allow requests with GET, POST and OPTIONS
        methods: ['GET', 'POST', 'OPTIONS'],
    })
)

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
  ) {
    // Run cors
    await cors(req, res)

    console.log('request body:', req.body);

    // const params = new URLSearchParams({
    //     include: 'primary_image',
    //     keyword: req.body ? JSON.parse(req.body) : '',
    // });

    // const searchEndpoint = 'https://api.bigcommerce.com/stores/7nqbe06g6y/v3/catalog/products?' + params;

    // const request = await fetch(searchEndpoint, {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'X-Auth-Token': '1bdiouqx9wzkbp5ryborpb6d76g3jn2',
    //     },
    // });
    
    // const response = await request.json();
    
    // Rest of the API logic
    res.status(200).json({name: 'John Doe'});
}

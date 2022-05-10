// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Cors from 'cors'
import initMiddleware from '../../lib/init-middleware'

import type { NextApiRequest, NextApiResponse } from 'next'

import * as deepl from 'deepl-node';

// Initialize the cors middleware
const cors = initMiddleware(
    // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
    Cors({
        // Only allow requests with GET, POST and OPTIONS
        methods: ['GET', 'POST', 'OPTIONS'],
    })
)

// const apiKey = process.env.DEEPL_API_KEY as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
  ) {
    // Run cors
    await cors(req, res)

    // console.log('req.body:', req.body);

    const { 
      source, 
      target, 
      q,
      apiKey
    } = req.body;

    const translator = new deepl.Translator(apiKey);

    // console.log('source:', source);
    // console.log('target:', target);
    console.log('textToTranslate:', q);

    const textToTranslate: string = typeof q === 'object' 
      ? JSON.stringify(q)
      : q;

    const result = await translator.translateText(
      textToTranslate, 
      source, //source as deepl.SourceLanguageCode, 
      target as deepl.TargetLanguageCode);

    console.log('result:', result);

    const usage: deepl.Usage = await translator.getUsage();
    // console.log(`Characters: ${usage?.character?.count} of ${usage?.character?.limit}`)
    
    // Rest of the API logic
    res.status(200).json(result);
}

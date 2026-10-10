import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ProcessingModule } from '../processing/processing.module.js';
import { demoOnly, processDemo } from './fixtures.js';
import { z } from 'zod';
const [id,outcome='success']=process.argv.slice(2);
demoOnly();
if(process.argv.length>4||!z.uuid().safeParse(id).success||!['success','failure','empty'].includes(outcome))throw new Error('Usage: demo:process APPLICATION_UUID [success|failure|empty]');
const app=await NestFactory.createApplicationContext(ProcessingModule,{logger:false});
try{const fixtures=await processDemo(app,id,outcome as 'success'|'failure'|'empty');console.log(`Applied ${fixtures.length} tagged ${outcome} fixtures. No parsing or AI. Refresh HR review.`);}finally{await app.close();}

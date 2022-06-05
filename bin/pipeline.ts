#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import { ServerStack } from '../lib/server-stack';

const app = new cdk.App();
const pipeline = new PipelineStack(app, 'PipelineStack', {});

// new BillingStack(app, 'BillingStack', {  
//   EmailAddress:"rahul@lifeboxhealth.com",
//   BudgetAmount:5
// });
  
const serviceStackStaging= new ServerStack(app, "CDK-Lambda-Stack-Staging",{
    StageName:"Staging"
})
pipeline.addServiceStage(serviceStackStaging, "Staging", false);

const serviceStackProduction = new ServerStack(app, "CDK-Lambda-Stack-Production",{
    StageName:"Production"
})
pipeline.addServiceStage(serviceStackProduction, "Production", true);

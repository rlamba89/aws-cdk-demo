#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import { BillingStack } from '../lib/billing-stack';
import { CodePipeline} from 'aws-cdk-lib/pipelines';
import { ServerStack } from '../lib/server-stack';

const app = new cdk.App();
const pipeline = new PipelineStack(app, 'PipelineStack', {});

// new BillingStack(app, 'BillingStack', {
//   EmailAddress:"rahul@lifeboxhealth.com",
//   BudgetAmount:5
// });

const serviceStack = new ServerStack(app, "CDK-Lambda-Stack-Staging")

pipeline.addServiceStage(serviceStack, "Staging");